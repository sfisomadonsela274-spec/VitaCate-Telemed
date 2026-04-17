import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q

from .models import ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return

        # Users listen to their own personal "inbox"
        self.room_group_name = f'inbox_{self.user.id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type')

        if event_type == 'message':
            await self._handle_message(data)
        elif event_type == 'get_messages':
            await self._handle_get_messages(data)
        elif event_type == 'mark_read':
            await self._handle_mark_read(data)
        elif event_type == 'typing':
            await self._handle_typing(data)

    async def _handle_message(self, data):
        message_text = data.get('message', '').strip()
        receiver_id = data.get('receiver_id')
        
        if not message_text or not receiver_id:
            return

        # Validate the receiver exists
        receiver = await self._get_user_by_id(receiver_id)
        if receiver is None:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Receiver with id {receiver_id} not found.'
            }))
            return

        saved_msg = await self._save_message(
            sender=self.user,
            receiver=receiver,
            message=message_text,
            message_type=data.get('message_type', 'text'),
            media_payload=data.get('media_payload')
        )

        payload = {
            'type': 'message',
            'id': saved_msg['id'],
            'sender_id': saved_msg['sender_id'],
            'receiver_id': saved_msg['receiver_id'],
            'message': saved_msg['message'],
            'message_type': saved_msg['message_type'],
            'media_payload': saved_msg['media_payload'],
            'timestamp': saved_msg['timestamp'],
        }

        # Broadcast to receiver's inbox
        await self.channel_layer.group_send(
            f'inbox_{receiver_id}',
            {'type': 'chat_message', 'payload': payload}
        )
        # Broadcast back to sender's inbox (for sync) ONLY if different from receiver
        if receiver_id != self.user.id:
            await self.channel_layer.group_send(
                f'inbox_{self.user.id}',
                {'type': 'chat_message', 'payload': payload}
            )

    async def _handle_typing(self, data):
        receiver_id = data.get('receiver_id')
        is_typing = data.get('is_typing', False)
        if not receiver_id: return
        
        await self.channel_layer.group_send(
            f'inbox_{receiver_id}',
            {
                'type': 'chat_typing',
                'payload': {
                    'type': 'typing',
                    'sender_id': self.user.id,
                    'is_typing': is_typing
                }
            }
        )

    async def _handle_get_messages(self, data):
        peer_id = data.get('peer_id')
        if not peer_id:
            # Fallback if peer_id not provided (unlikely in new flow)
            return

        messages = await self._get_history(user=self.user, peer_id=peer_id)
        await self.send(text_data=json.dumps({
            'type': 'message_history',
            'peer_id': peer_id,
            'messages': messages,
        }))

    async def _handle_mark_read(self, data):
        peer_id = data.get('peer_id')
        if not peer_id:
            return
        count = await self._mark_read(user=self.user, peer_id=peer_id)
        await self.send(text_data=json.dumps({
            'type': 'mark_read_ack',
            'peer_id': peer_id,
            'updated': count,
        }))

    @database_sync_to_async
    def _get_user_by_id(self, user_id):
        from users.models import CustomUser
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    @database_sync_to_async
    def _save_message(self, sender, receiver, message, message_type='text', media_payload=None):
        msg = ChatMessage.objects.create(
            sender=sender, receiver=receiver, message=message,
            message_type=message_type, media_payload=media_payload
        )
        return {
            'id': msg.id, 'sender_id': msg.sender_id, 'receiver_id': msg.receiver_id,
            'message': msg.message, 'message_type': msg.message_type, 
            'media_payload': msg.media_payload, 'timestamp': msg.timestamp.isoformat(),
        }

    @database_sync_to_async
    def _get_history(self, user, peer_id):
        messages = ChatMessage.objects.filter(
            Q(sender=user, receiver_id=peer_id) | Q(sender_id=peer_id, receiver=user)
        ).order_by('timestamp')
        return [
            {'id': m.id, 'sender_id': m.sender_id, 'receiver_id': m.receiver_id,
             'message': m.message, 'message_type': m.message_type,
             'media_payload': m.media_payload, 'timestamp': m.timestamp.isoformat(), 
             'is_read': m.is_read}
            for m in messages
        ]

    @database_sync_to_async
    def _mark_read(self, user, peer_id):
        return ChatMessage.objects.filter(
            sender_id=peer_id, receiver=user, is_read=False
        ).update(is_read=True)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['payload']))

    async def chat_typing(self, event):
        await self.send(text_data=json.dumps(event['payload']))