from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ChatMessage


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, doctor_id):
        user = request.user
        messages = ChatMessage.objects.filter(
            Q(sender=user, receiver_id=doctor_id) |
            Q(sender_id=doctor_id, receiver=user)
        ).order_by('timestamp')

        data = [
            {
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'message': msg.message,
                'timestamp': msg.timestamp.isoformat(),
                'is_read': msg.is_read,
            }
            for msg in messages
        ]
        return Response(data, status=status.HTTP_200_OK)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        receiver_id = request.data.get('receiver_id')
        message_text = request.data.get('message', '').strip()

        if not receiver_id:
            return Response({'error': 'receiver_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not message_text:
            return Response({'error': 'message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        msg = ChatMessage.objects.create(
            sender=sender,
            receiver_id=receiver_id,
            message=message_text
        )

        return Response(
            {
                'id': msg.id,
                'sender_id': msg.sender_id,
                'receiver_id': msg.receiver_id,
                'message': msg.message,
                'timestamp': msg.timestamp.isoformat(),
                'is_read': msg.is_read,
            },
            status=status.HTTP_201_CREATED
        )


class MarkMessagesReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doctor_id = request.data.get('doctor_id')
        if not doctor_id:
            return Response({'error': 'doctor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        updated = ChatMessage.objects.filter(
            sender_id=doctor_id,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({'updated': updated}, status=status.HTTP_200_OK)