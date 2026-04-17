from django.urls import path
from .views import ChatHistoryView, SendMessageView, MarkMessagesReadView

urlpatterns = [
    path('history/<int:doctor_id>/', ChatHistoryView.as_view(), name='chat-history'),
    path('send/', SendMessageView.as_view(), name='chat-send'),
    path('mark-read/', MarkMessagesReadView.as_view(), name='chat-mark-read'),
]