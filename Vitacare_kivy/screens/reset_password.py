from kivy.uix.screenmanager import Screen
from kivymd.toast import toast
from kivy.app import App
import requests

class ResetPasswordScreen(Screen):
    def on_back_press(self):
        self.manager.current = 'forgot_password_code'
    
    def on_pre_enter(self):
        self.ids.new_password.text = ""
        self.ids.confirm_password.text = ""

    def reset_password(self):
        new_pass = self.ids.new_password.text.strip()
        confirm_pass = self.ids.confirm_password.text.strip()
        app = App.get_running_app()
        email = getattr(app, 'email_for_reset', '')

        if not new_pass or not confirm_pass:
            toast("All fields must be filled.")
            return
        if new_pass != confirm_pass:
            toast("Passwords do not match.")
            return
        if len(new_pass) < 6:
            toast("Password must be at least 6 characters.")
            return
        if not email:
            toast("Email not found. Please start over.")
            self.manager.current = "forgot_password_email"
            return

        try:
            response = requests.post(
                "http://127.0.0.1:8000/api/users/reset-password/",
                json={"email": email, "new_password": new_pass, "confirm_password": confirm_pass},
                timeout=5
            )
            if response.status_code == 200:
                toast("Password reset successful. Please login.")
                self.manager.current = "patient_login"
            else:
                toast(f"Failed to reset password: {response.text}")
        except requests.exceptions.RequestException as e:
            toast(f"Network error: {e}")