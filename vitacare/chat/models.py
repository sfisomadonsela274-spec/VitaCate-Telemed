from django.db import models
from users.models import CustomUser


class ChatMessage(models.Model):
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    receiver = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    message = models.TextField(blank=True, null=True)
    message_type = models.CharField(max_length=20, default='text') # 'text' or 'image'
    media_payload = models.TextField(blank=True, null=True) # Base64 for demo
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.email} -> {self.receiver.email}: {self.message[:30]}"