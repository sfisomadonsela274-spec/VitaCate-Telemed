from kivy.uix.screenmanager import Screen
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.toast import toast
from kivy.app import App
import requests

class ForgotPasswordEmailScreen(Screen):
    """Screen for requesting a password reset code via email."""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.name = 'forgot_password_email'
    
    def on_back_press(self):
        """Navigate back to the login screen."""
        self.manager.current = 'patient_login'
    
    def on_pre_enter(self):
        """Clear the email input when the screen is entered."""
        if hasattr(self.ids, 'email_input'):
            self.ids.email_input.text = ""

    def send_reset_code(self, email):
        """Send a password reset code to the provided email."""
        email = email.strip()
        if not email:
            toast("Email is required.")
            return

        try:
            response = requests.post(
                "http://127.0.0.1:8000/api/users/forgot-password/",
                json={"email": email},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("redirect") == "signup":
                    toast("Email not registered. Please sign up first.")
                    self.manager.current = "sign_up"
                else:
                    toast("Reset code sent. Check your email.")
                    App.get_running_app().email_for_reset = email
                    self.manager.current = "forgot_password_code"
            else:
                toast(f"Failed to send reset code: {response.text}")
        except requests.exceptions.RequestException as e:
            toast(f"Network error: {e}")