from kivy.uix.screenmanager import Screen
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.toast import toast
from kivy.app import App
import requests

class ForgotPasswordCodeScreen(Screen):
    """Screen for verifying the password reset code."""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.name = 'forgot_password_code'
    
    def on_back_press(self):
        """Navigate back to the email entry screen."""
        self.manager.current = 'forgot_password_email'
    
    def on_pre_enter(self):
        """Clear the code input when the screen is entered."""
        if hasattr(self.ids, 'code_input'):
            self.ids.code_input.text = ""

    def verify_code(self):
        """Verify the password reset code."""
        app = App.get_running_app()
        email = getattr(app, 'email_for_reset', '')
        code = self.ids.code_input.text.strip() if hasattr(self.ids, 'code_input') else ""

        if not email:
            toast("Email not found. Please request reset code again.")
            self.manager.current = 'forgot_password_email'
            return

        if not code or len(code) != 5 or not code.isdigit():
            toast("Please enter a valid 5-digit code.")
            return

        try:
            response = requests.post(
                "http://127.0.0.1:8000/api/users/verify-code/",
                json={'email': email, 'code': code},
                timeout=5
            )
            if response.status_code == 200:
                toast("Code verified! Please reset your password.")
                self.manager.current = 'reset_password'
            else:
                toast("Invalid or expired code.")
        except requests.exceptions.RequestException as e:
            toast(f"Error verifying code: {e}")