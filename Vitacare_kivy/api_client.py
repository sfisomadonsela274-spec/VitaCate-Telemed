"""Shared helpers for making authenticated API requests with automatic token refresh."""

from __future__ import annotations

from typing import Optional, Tuple, Dict, Any

import requests
from kivy.logger import Logger
from kivymd.app import MDApp

TOKEN_REFRESH_ENDPOINT = "http://127.0.0.1:8000/api/users/token/refresh/"


def _get_running_app():
    try:
        return MDApp.get_running_app()
    except Exception:  # pragma: no cover - defensive
        return None


def refresh_access_token(manager) -> Optional[str]:
    """Attempt to refresh the access token using the stored refresh token."""
    refresh_token = getattr(manager, "refresh_token", None)
    if not refresh_token:
        return None

    try:
        response = requests.post(
            TOKEN_REFRESH_ENDPOINT,
            json={"refresh": refresh_token},
            timeout=10,
        )
    except requests.RequestException as exc:  # pragma: no cover - network failure
        Logger.warning(f"APIClient: refresh request failed: {exc}")
        return None

    if response.status_code != 200:
        Logger.info(
            "APIClient: refresh rejected with status %s", response.status_code
        )
        if response.status_code in (401, 403):
            for attr in ("access_token", "refresh_token"):
                if hasattr(manager, attr):
                    delattr(manager, attr)
        return None

    data = response.json()
    new_access = data.get("access")
    if not new_access:
        Logger.warning("APIClient: refresh response missing access token")
        return None

    manager.access_token = new_access

    app = _get_running_app()
    if app and hasattr(app, "current_user") and isinstance(app.current_user, dict):
        app.current_user["access_token"] = new_access

    return new_access


def authenticated_request(
    method: str,
    url: str,
    manager,
    *,
    require_auth: bool = True,
    headers: Optional[Dict[str, str]] = None,
    **kwargs: Any,
) -> Tuple[Optional[requests.Response], Optional[str]]:
    """
    Perform an HTTP request that automatically attempts to refresh expired tokens.

    Returns:
        Tuple of (response, error). If `response` is None, `error` contains a string
        describing the issue. When a response is returned the caller should inspect
        the status code as usual.
    """
    request_headers: Dict[str, str] = dict(headers or {})

    if require_auth:
        token = getattr(manager, "access_token", None)
        if token:
            request_headers.setdefault("Authorization", f"Bearer {token}")
        else:
            new_token = refresh_access_token(manager)
            if new_token:
                request_headers.setdefault("Authorization", f"Bearer {new_token}")
            else:
                return None, "authentication_required"

    try:
        response = requests.request(
            method.upper(),
            url,
            headers=request_headers,
            **kwargs,
        )
    except requests.RequestException as exc:
        return None, str(exc)

    if not require_auth or response.status_code != 401:
        return response, None

    new_token = refresh_access_token(manager)
    if not new_token:
        return response, "token_refresh_failed"

    request_headers["Authorization"] = f"Bearer {new_token}"
    try:
        retry_response = requests.request(
            method.upper(),
            url,
            headers=request_headers,
            **kwargs,
        )
        return retry_response, None
    except requests.RequestException as exc:
        return None, str(exc)
