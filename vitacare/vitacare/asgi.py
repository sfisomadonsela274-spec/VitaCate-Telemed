import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vitacare.settings')

django_asgi = get_asgi_application()

from chat.jwt_auth import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns as chat_websocket
from video_calls.routing import websocket_urlpatterns as video_websocket

application = ProtocolTypeRouter({
    "http": django_asgi,
    "websocket": JWTAuthMiddleware(
        URLRouter(chat_websocket + video_websocket)
    ),
})