import json
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from users.models import CustomUser


@database_sync_to_async
def get_user_from_token(token_key: str):
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        return CustomUser.objects.get(id=user_id)
    except (InvalidToken, TokenError, CustomUser.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_params = parse_qs(scope.get('query_string', b'').decode())
        token = query_params.get('token', [None])[0]

        scope['user'] = (
            await get_user_from_token(token)
            if token else AnonymousUser()
        )

        return await super().__call__(scope, receive, send)