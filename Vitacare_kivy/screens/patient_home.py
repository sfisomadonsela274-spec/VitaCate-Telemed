from kivy.uix.screenmanager import Screen
from kivy.uix.label import Label
from kivy.clock import Clock
import requests
import json
from kivy.properties import StringProperty, ObjectProperty
from kivymd.app import MDApp
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton

class PatientHomeScreen(Screen):

    def on_pre_enter(self, *args):
        """Called when screen is about to be shown"""
        self.ids.welcome_label.text = "Welcome!"
        self.load_appointment()

    def show_logout_confirmation(self):
        """Show logout confirmation dialog"""
        from kivymd.uix.dialog import MDDialog
        from kivymd.uix.button import MDFlatButton
        from kivymd.app import MDApp
        
        def logout_callback(instance):
            self.logout()
            dialog.dismiss()
        
        app = MDApp.get_running_app()
        dialog = MDDialog(
            title="Logout Confirmation",
            text="Are you sure you want to log out? This will end your current session.",
            buttons=[
                MDFlatButton(
                    text="CANCEL",
                    theme_text_color="Custom",
                    text_color=app.theme_cls.primary_color,
                    on_release=lambda x: dialog.dismiss()
                ),
                MDFlatButton(
                    text="LOGOUT",
                    theme_text_color="Custom",
                    text_color=(0.8, 0.2, 0.2, 1),
                    on_release=logout_callback
                ),
            ],
        )
        dialog.open()
    
    def show_home_confirmation(self):
        """Show confirmation dialog before going to home screen"""
        from kivymd.uix.dialog import MDDialog
        from kivymd.uix.button import MDFlatButton
        from kivymd.app import MDApp
        
        def go_home_callback(instance):
            self.go_home()
            dialog.dismiss()
        
        app = MDApp.get_running_app()
        dialog = MDDialog(
            title="Leave Dashboard",
            text="Are you sure you want to leave the dashboard? Any unsaved changes will be lost.",
            buttons=[
                MDFlatButton(
                    text="CANCEL",
                    theme_text_color="Custom",
                    text_color=app.theme_cls.primary_color,
                    on_release=lambda x: dialog.dismiss()
                ),
                MDFlatButton(
                    text="LEAVE",
                    theme_text_color="Custom",
                    text_color=app.theme_cls.primary_color,
                    on_release=go_home_callback
                ),
            ],
        )
        dialog.open()
    
    def logout(self, *args):
        """Perform the actual logout process"""
        # Clear all tokens and user data
        for attr in ['access_token', 'refresh_token', 'user_id', 'patient_name', 'patient_email']:
            if hasattr(self.manager, attr):
                delattr(self.manager, attr)
        
        # Clear any stored credentials in the login screen
        if 'patient_login' in self.manager.screen_names:
            login_screen = self.manager.get_screen('patient_login')
            login_screen.clear_fields()
        
        # Clear the navigation stack and switch to login screen
        self.manager.transition.direction = 'right'
        self.manager.current = 'patient_login'
        
        # Clear any stored tokens in the app config
        from kivy.app import App
        app = App.get_running_app()
        if hasattr(app, 'config'):
            app.config.remove_section('auth')
            app.config.write()

    def go_home(self):
        """Return to welcome screen"""
        self.manager.current = 'welcome'

    def start_video_call(self):
        """Start video call with doctor"""
        # Get the current appointment ID from the app instance
        from kivymd.app import MDApp
        app = MDApp.get_running_app()
        appointment_id = None

        if hasattr(app, 'current_user') and isinstance(app.current_user, dict):
            appointment_id = app.current_user.get('current_appointment_id')

        if not appointment_id and app:
            appointment_id = getattr(app, 'current_appointment_id', None)

        if appointment_id:
            # Ensure the appointment context stays in sync for other screens
            self._set_current_appointment(appointment_id)
            self.manager.video_previous = 'patient_home'
            self.manager.current = 'video_call'
        else:
            self.show_popup("You don't have an active appointment. Please book an appointment first.")

    def start_chat(self):
        """Open chat with the assigned doctor."""
        from kivymd.app import MDApp
        app = MDApp.get_running_app()

        appointment_id = None
        doctor_name = None

        if hasattr(app, 'current_user') and isinstance(app.current_user, dict):
            appointment_id = app.current_user.get('current_appointment_id')
            doctor_name = app.current_user.get('current_appointment_doctor')

        if not appointment_id and app:
            appointment_id = getattr(app, 'current_appointment_id', None)

        if not doctor_name and app:
            doctor_name = getattr(app, 'current_appointment_doctor', None)

        if not appointment_id:
            self.show_popup("You don't have an active appointment to chat about.")
            return

        # Keep appointment details consistent across the app
        self._set_current_appointment(appointment_id, doctor_name)

        self.manager.active_chat_context = {
            "appointment_id": appointment_id,
            "partner_name": doctor_name or "Doctor",
            "back_screen": "patient_home",
            "header_title": "Chat with Dr. {partner}",
            "partner_display_text": f"Appointment #{appointment_id}",
        }
        self.manager.video_previous = 'patient_home'
        self.manager.current = 'patient_chat'

    def show_popup(self, message, title='Info', button_text='OK'):
        """Show a styled dialog with the given message"""
        dialog = MDDialog(
            title=title,
            text=message,
            buttons=[
                MDFlatButton(
                    text=button_text,
                    theme_text_color="Custom",
                    text_color=MDApp.get_running_app().theme_cls.primary_color,
                    on_release=lambda x: dialog.dismiss()
                ),
            ],
        )
        dialog.open()

    def _set_current_appointment(self, appointment_id=None, doctor_name=None):
        """Maintain a consistent view of the active appointment across the app."""
        app = MDApp.get_running_app()
        manager = getattr(self, 'manager', None)

        if appointment_id:
            if app:
                current_user = getattr(app, 'current_user', None)
                if isinstance(current_user, dict):
                    current_user['current_appointment_id'] = appointment_id
                    if doctor_name:
                        current_user['current_appointment_doctor'] = doctor_name
                app.current_appointment_id = appointment_id
                if doctor_name:
                    app.current_appointment_doctor = doctor_name

            if manager:
                manager.current_appointment_id = appointment_id
                if doctor_name:
                    manager.current_appointment_doctor = doctor_name
        else:
            if app:
                current_user = getattr(app, 'current_user', None)
                if isinstance(current_user, dict):
                    current_user.pop('current_appointment_id', None)
                    current_user.pop('current_appointment_doctor', None)

                for attr in ('current_appointment_id', 'current_appointment_doctor'):
                    if hasattr(app, attr):
                        delattr(app, attr)

            if manager:
                for attr in ('current_appointment_id', 'current_appointment_doctor'):
                    if hasattr(manager, attr):
                        delattr(manager, attr)

    def load_appointment(self):
        """Fetch latest appointment for logged-in patient"""
        token = getattr(self.manager, 'access_token', None)
        if not token:
            self.ids.appointment_label.text = "You are not logged in."
            return

        headers = {"Authorization": f"Bearer {token}"}
        url = "http://127.0.0.1:8000/api/appointments/my-latest/"

        try:
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json() or {}
                appointment_id = data.get("appointment_id") or data.get("id")
                doctor = data.get("doctor_name") or data.get("doctor")
                date = data.get("date")
                time_value = data.get("time")

                if appointment_id:
                    self._set_current_appointment(appointment_id, doctor)
                    segments = []
                    if doctor:
                        segments.append(f"You have an appointment with Dr. {doctor}")
                    if date:
                        segments.append(f"on {date}")
                    if time_value:
                        segments.append(f"at {time_value}")
                    self.ids.appointment_label.text = " ".join(segments) if segments else "You have an upcoming appointment."
                else:
                    self._set_current_appointment(None)
                    self.ids.appointment_label.text = "No appointments"
            elif response.status_code == 204:
                self._set_current_appointment(None)
                self.ids.appointment_label.text = "No appointments"
            else:
                self._set_current_appointment(None)
                self.ids.appointment_label.text = f"Failed to load appointments: {response.status_code}"
        except Exception as e:
            self._set_current_appointment(None)
            self.ids.appointment_label.text = f"Failed to load appointments: {str(e)}"