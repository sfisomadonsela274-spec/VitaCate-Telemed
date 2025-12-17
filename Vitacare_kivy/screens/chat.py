import json
import time
from typing import Dict

import requests
from kivy.animation import Animation
from kivy.clock import Clock
from kivy.metrics import dp
from kivy.properties import DictProperty, NumericProperty, StringProperty
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.screenmanager import Screen
from kivymd.app import MDApp


class MessageBubble(BoxLayout):
    message = StringProperty('')
    sender = StringProperty('')
    time = StringProperty('')
    is_me = NumericProperty(0)
    
    def __init__(self, **kwargs):
        super(MessageBubble, self).__init__(**kwargs)
        self.orientation = 'horizontal'
        self.size_hint = (1, None)
        self.padding = [dp(8), dp(4), dp(8), dp(4)]
        self.spacing = dp(8)
        
        # Add animation for new messages
        anim = Animation(opacity=1, duration=0.3)
        anim.start(self)
        self.opacity = 0


class BaseChatScreen(Screen):
    FIREBASE_DB_URL = "https://vitacare-chat-default-rtdb.firebaseio.com/"
    POLL_INTERVAL = 3  # seconds
    last_message_count = 0
    DEFAULT_HEADER_TITLE = "Chat"
    DEFAULT_BACK_SCREEN = "welcome"
    USER_ROLE = "user"

    header_title = StringProperty(DEFAULT_HEADER_TITLE)
    partner_display_text = StringProperty("")
    back_screen = StringProperty(DEFAULT_BACK_SCREEN)
    context = DictProperty({})

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._refresh_event = None

    def on_pre_enter(self, *args):
        super().on_pre_enter(*args)
        self._load_context()
        appointment_id = self.context.get('appointment_id')

        if not appointment_id:
            self.show_status("No conversation selected", is_error=True)
            return

        self.show_status("Loading messages...")
        self.last_message_count = 0
        self.load_messages()
        self._refresh_event = Clock.schedule_interval(
            lambda dt: self.load_messages(),
            self.POLL_INTERVAL
        )

    def on_pre_leave(self, *args):
        """Stop polling when leaving the screen"""
        super().on_pre_leave(*args)
        if self._refresh_event is not None:
            Clock.unschedule(self._refresh_event)
            self._refresh_event = None

    def navigate_back(self):
        """Return to the originating screen."""
        if self._refresh_event is not None:
            Clock.unschedule(self._refresh_event)
            self._refresh_event = None

        target = self.back_screen or self.DEFAULT_BACK_SCREEN
        if target and target in self.manager.screen_names:
            self.manager.current = target

    def _load_context(self):
        raw_context: Dict = getattr(self.manager, 'active_chat_context', {}) or {}
        self.context = raw_context

        partner = raw_context.get('partner_name') or raw_context.get('partner_email') or ""
        header = raw_context.get('header_title', self.DEFAULT_HEADER_TITLE)
        if '{partner}' in header:
            header = header.format(partner=partner)
        elif partner and header == self.DEFAULT_HEADER_TITLE:
            header = f"{header} - {partner}"

        self.partner_display_text = raw_context.get('partner_display_text') or (
            f"Chatting with {partner}" if partner else "")
        self.header_title = header
        self.back_screen = raw_context.get('back_screen', self.DEFAULT_BACK_SCREEN)

    def get_chat_url(self):
        """Return Firebase path for current appointment"""
        appointment_id = self.context.get('appointment_id')
        if not appointment_id:
            return None
        chat_id = self.context.get('chat_id') or f"appointment_{appointment_id}"
        return f"{self.FIREBASE_DB_URL}/chats/{chat_id}/messages.json"

    def show_status(self, message, is_error=False):
        """Show status message in the status bar"""
        status_label = self.ids.get('status_label')
        if not status_label:
            return

        status_label.text = message
        status_label.color = (0.8, 0.2, 0.2, 1) if is_error else (0.1, 0.5, 0.8, 1)
        timeout = 5 if is_error else 3
        Clock.schedule_once(lambda dt: self.clear_status(), timeout)

    def clear_status(self):
        """Clear the status message"""
        status_label = self.ids.get('status_label')
        if status_label:
            status_label.text = ""

    def load_messages(self):
        """Fetch messages from Firebase"""
        try:
            url = self.get_chat_url()
            if not url:
                self.show_status("Chat not available", is_error=True)
                return
            response = requests.get(f"{url}?orderBy=\"$key\"&limitToLast=50")
            
            if response.status_code == 200 and response.json():
                messages = response.json()
                
                # Only update if we have new messages
                if len(messages) != self.last_message_count:
                    self.last_message_count = len(messages)
                    self.display_messages(messages)
                    
        except Exception as e:
            self.show_status(f"Error loading chat: {str(e)}", is_error=True)
    
    def display_messages(self, messages):
        """Display messages in the chat area"""
        container = self.ids.messages_container
        container.clear_widgets()
        
        # Get current user name to identify own messages
        current_user = self._get_current_user_name(default="User")
        
        # Sort messages by timestamp
        sorted_msgs = sorted(messages.values(), 
                           key=lambda m: m.get('timestamp', 0))
        
        for msg in sorted_msgs:
            sender = msg.get('sender', 'Unknown')
            text = msg.get('message', '')
            timestamp = msg.get('timestamp', 0)
            is_me = sender == current_user
            
            # Create and add message bubble
            bubble = MessageBubble(
                message=text,
                sender=sender,
                time=self.format_timestamp(timestamp),
                is_me=1 if is_me else 0
            )
            
            # Add message to container
            container.add_widget(bubble)
        
        # Scroll to bottom after adding messages
        Clock.schedule_once(self.scroll_to_bottom, 0.1)
    
    def format_timestamp(self, timestamp):
        """Format timestamp for display"""
        # This is a simple formatter - you can enhance it to show actual time
        return "just now"
    
    def scroll_to_bottom(self, *args):
        """Scroll the chat to the bottom"""
        scroll_view = self.ids.scroll_view
        if scroll_view.height < scroll_view.children[0].height:
            scroll_view.scroll_y = 0

    def send_message(self):
        """Send a message to Firebase"""
        message = self.ids.message_input.text.strip()
        if not message:
            return
            
        # Clear input immediately for better UX
        self.ids.message_input.text = ""
        
        # Get sender info
        current_user = self._get_current_user_name(default="User")
        url = self.get_chat_url()
        if not url:
            self.show_status("Cannot send message right now", is_error=True)
            self.ids.message_input.text = message
            return
        
        # Prepare message data
        data = {
            "sender": current_user,
            "message": message,
            "timestamp": time.time(),
            "role": self.USER_ROLE
        }
        
        try:
            # Send message to Firebase
            response = requests.post(url, data=json.dumps(data))
            if response.status_code != 200:
                self.show_status("Failed to send message. Please try again.", is_error=True)
                # Re-enable the message in the input field
                self.ids.message_input.text = message
        except Exception as e:
            self.show_status(f"Error: {str(e)}", is_error=True)
            # Re-enable the message in the input field
            self.ids.message_input.text = message

    def _get_current_user_name(self, default=""):
        app = MDApp.get_running_app()
        if not app:
            return default

        user = getattr(app, 'current_user', {}) or {}
        name = (
            getattr(app, 'current_user_name', None)
            or user.get('display_name')
            or user.get('name')
            or user.get('first_name')
            or user.get('email')
        )
        return name or default


class DoctorChatScreen(BaseChatScreen):
    DEFAULT_HEADER_TITLE = "Chat with {partner}"
    DEFAULT_BACK_SCREEN = "doctor_home"
    USER_ROLE = "doctor"


class PatientChatScreen(BaseChatScreen):
    DEFAULT_HEADER_TITLE = "Chat with Dr. {partner}"
    DEFAULT_BACK_SCREEN = "patient_home"
    USER_ROLE = "patient"