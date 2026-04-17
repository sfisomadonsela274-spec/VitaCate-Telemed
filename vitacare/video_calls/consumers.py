import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

logger = logging.getLogger(__name__)


class VideoCallConsumer(AsyncWebsocketConsumer):
    _active_rooms: dict[str, set[str]] = {}

    async def connect(self):
        self.doctor_id = self.scope['url_route']['kwargs']['doctor_id']
        self.room_name = f'video_{self.doctor_id}'
        self.user_channel = self.channel_name
        self.user = None
        self.role = None

        query_string = self.scope.get('query_string', b'').decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break

        if not token:
            await self.close(code=4001)
            return

        try:
            access_token = AccessToken(token)
            self.user = (
                access_token.get('user_id') or
                access_token.get('id') or
                access_token.get('sub')
            )
            self.role = access_token.get('role', 'patient')
            if not self.user:
                payload = access_token.payload
                self.user = payload.get('user_id') or payload.get('id') or payload.get('sub')
        except (TokenError, InvalidToken):
            await self.close(code=4002)
            return

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()
        logger.info(f"VideoCall: User {self.user} connected to room {self.room_name}")

        if self.room_name not in self._active_rooms:
            self._active_rooms[self.room_name] = set()
        self._active_rooms[self.room_name].add(self.channel_name)

    async def disconnect(self, close_code):
        if not hasattr(self, 'room_name'):
            return

        await self.channel_layer.group_send(
            self.room_name,
            {'type': 'peer_disconnected', 'channel_name': self.channel_name, 'user': str(self.user) if self.user else None}
        )

        if self.room_name in self._active_rooms:
            self._active_rooms[self.room_name].discard(self.channel_name)
            if not self._active_rooms[self.room_name]:
                del self._active_rooms[self.room_name]

        await self.channel_layer.group_discard(self.room_name, self.channel_name)
        logger.info(f"VideoCall: User {self.user} disconnected from room {self.room_name}")

    async def receive_json(self, content: dict):
        msg_type = content.get('type')

        if msg_type == 'join':
            await self.channel_layer.group_send(
                self.room_name,
                {'type': 'peer_joined', 'channel_name': self.channel_name, 'user': str(self.user) if self.user else None, 'role': self.role}
            )
        elif msg_type in ('offer', 'answer', 'ice_candidate'):
            await self.channel_layer.group_send(
                self.room_name,
                {'type': 'signaling_message', 'message_type': msg_type, 'payload': content.get('data') or content.get('candidate'), 'sender_channel': self.channel_name}
            )
        elif msg_type == 'leave':
            await self.channel_layer.group_send(
                self.room_name,
                {'type': 'peer_left', 'channel_name': self.channel_name, 'user': str(self.user) if self.user else None}
            )
            await self.close()

    async def signaling_message(self, event: dict):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send(json.dumps({'type': event['message_type'], 'data': event['payload']}))

    async def peer_joined(self, event: dict):
        if event.get('channel_name') == self.channel_name:
            return
        await self.send(json.dumps({'type': 'peer_joined', 'user': event.get('user'), 'role': event.get('role')}))

    async def peer_left(self, event: dict):
        if event.get('channel_name') == self.channel_name:
            return
        await self.send(json.dumps({'type': 'peer_left', 'user': event.get('user')}))

    async def peer_disconnected(self, event: dict):
        if event.get('channel_name') == self.channel_name:
            return
        await self.send(json.dumps({'type': 'peer_disconnected', 'user': event.get('user')}))