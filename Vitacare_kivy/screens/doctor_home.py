from kivy.uix.screenmanager import Screen
from kivy.uix.popup import Popup
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.metrics import dp
from kivymd.uix.card import MDCard
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.label import MDLabel
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.menu import MDDropdownMenu
import requests
import logging

logger = logging.getLogger(__name__)


class DoctorHomeScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        menu_items = [
            {
                "viewclass": "OneLineListItem",
                "text": "View All Appointments",
                "on_release": lambda x="doctor_view_appointments": self.menu_callback(
                    x
                ),
            },
            {
                "viewclass": "OneLineListItem",
                "text": "Add Prescription",
                "on_release": lambda x="doctor_add_prescription": self.menu_callback(x),
            },
            {
                "viewclass": "OneLineListItem",
                "text": "Add Consultation",
                "on_release": lambda x="doctor_add_consultation": self.menu_callback(x),
            },
            {
                "viewclass": "OneLineListItem",
                "text": "Start Video Consultation",
                "on_release": lambda x="video_call": self.menu_callback(x),
            },
        ]
        self.menu = MDDropdownMenu(
            items=menu_items,
            width_mult=4,
        )

    def open_menu(self, caller):
        self.menu.caller = caller
        self.menu.open()

    def menu_callback(self, screen_name):
        self.menu.dismiss()
        if screen_name == "video_call":
            self.start_video_consultation()
        else:
            self.manager.current = screen_name

    def on_pre_enter(self):
        # Set welcome message with doctor's name
        doctor_name = getattr(self.manager, "doctor_name", "Doctor")
        if hasattr(self.ids, 'welcome_label'):
            self.ids.welcome_label.text = f"Welcome, Dr. {doctor_name}"
        else:
            logger.warning("welcome_label not found in doctor home screen")

        # Clear previous appointment cards
        appointment_container = self.ids.appointment_container
        appointment_container.clear_widgets()

        # Add loading indicator
        loading_label = MDLabel(
            text="Loading appointments...",
            halign="center",
            theme_text_color="Secondary",
        )
        appointment_container.add_widget(loading_label)

        # Schedule appointment loading to prevent UI freeze
        Clock.schedule_once(lambda dt: self.load_appointments(), 0.1)

    def go_home(self):
        """Navigate to the home screen."""
        if hasattr(self.manager, 'current'):
            self.manager.current = 'doctor_home'

    def view_all_appointments(self):
        """Navigate to the view all appointments screen."""
        if hasattr(self.manager, 'current'):
            self.manager.current = 'doctor_view_appointments'

    def add_consultation(self):
        """Navigate to add consultation screen."""
        if hasattr(self.manager, 'current'):
            self.manager.current = 'doctor_add_consultation'

    def add_prescription(self):
        """Navigate to add prescription screen."""
        if hasattr(self.manager, 'current'):
            self.manager.current = 'doctor_add_prescription'

    def view_patient_records(self):
        """Placeholder for viewing patient records."""
        self.show_info("Patient records feature coming soon!")

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

    def logout(self, *args):
        """Handle logout process."""
        # Clear all tokens and user data
        for attr in ['access_token', 'refresh_token', 'doctor_id', 'doctor_email', 'doctor_name']:
            if hasattr(self.manager, attr):
                delattr(self.manager, attr)
        
        # Clear any stored credentials in the login screen
        if 'doctor_login' in self.manager.screen_names:
            login_screen = self.manager.get_screen('doctor_login')
            login_screen.clear_fields()
        
        # Clear the navigation stack and switch to welcome screen
        self.manager.transition.direction = 'right'
        self.manager.current = 'welcome'
        
        # Clear any stored tokens in the app config
        from kivy.app import App
        app = App.get_running_app()
        if hasattr(app, 'config'):
            app.config.remove_section('auth')
            app.config.write()

    def show_info(self, message):
        """Show an information popup."""
        popup = Popup(
            title='Information',
            content=Label(text=message, padding=20),
            size_hint=(0.8, 0.3)
        )
        popup.open()
        Clock.schedule_once(lambda dt: popup.dismiss(), 3)  # Auto-close after 3 seconds

    def load_appointments(self):
        """Load appointments for the doctor."""
        if not hasattr(self, 'ids') or 'appointment_container' not in self.ids:
            logger.error("Appointment container not found in doctor home screen")
            return

        token = getattr(self.manager, "access_token", None)
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        email = getattr(self.manager, "doctor_email", "")

        if not email:
            self.show_error("No email found. Please log in again.")
            return

        try:
            # Clear existing widgets except the first one (title)
            appointment_container = self.ids.appointment_container
            appointment_container.clear_widgets()

            # Try both endpoints for backward compatibility
            urls = [
                f"http://127.0.0.1:8000/api/appointments/doctor-list/?email={email}",
                f"http://127.0.0.1:8000/api/appointments/doctor-appointments/?email={email}",
            ]

            response = None
            for url in urls:
                try:
                    response = requests.get(url, headers=headers, timeout=10)
                    if response.status_code == 200:
                        break
                except:
                    continue

            if not response:
                self.show_error("Failed to reach appointments service. Please try again later.")
                return

            if response.status_code == 204:
                appointment_container.clear_widgets()
                appointment_container.add_widget(
                    MDLabel(
                        text="No appointments scheduled for today.",
                        halign="center",
                        theme_text_color="Secondary",
                        size_hint_y=None,
                        height=dp(48),
                    )
                )
                return

            if response.status_code != 200:
                error_message = "Failed to load appointments. Please try again later."
                try:
                    detail = response.json().get("error")
                    if detail:
                        error_message = detail
                except ValueError:
                    pass
                self.show_error(error_message)
                return

            try:
                data = response.json()
            except ValueError:
                self.show_error("Unexpected response while loading appointments.")
                return

            if isinstance(data, list):
                appointments = data
            else:
                appointments = (
                    data.get("appointments")
                    or data.get("results")
                    or data.get("data")
                    or []
                )

                if isinstance(appointments, dict):
                    appointments = (
                        appointments.get("results")
                        or appointments.get("data")
                        or appointments.get("items")
                        or []
                    )

            if not appointments:
                no_appointments = MDLabel(
                    text="No appointments scheduled for today.",
                    halign="center",
                    theme_text_color="Secondary",
                    size_hint_y=None,
                    height=dp(48),
                )
                appointment_container.add_widget(no_appointments)
                return

            # Add appointment cards
            for appointment in appointments:
                self.add_appointment_card(appointment, appointment_container)

        except Exception as e:
            self.show_error(f"Error loading appointments: {str(e)}")

    def add_appointment_card(self, appointment, container):
        """Create and add an appointment card to the container"""
        try:
            # Format date and time
            date_str = appointment.get("date", "")
            time_str = appointment.get("time", "")
            patient_name = appointment.get("patient_name", "Patient")
            patient_email = appointment.get("patient_email", "")
            reason = appointment.get("reason") or appointment.get("purpose") or "No reason provided"
            appointment_id = appointment.get("appointment_id") or appointment.get("id")

            # Create card
            card = MDCard(
                orientation="vertical",
                size_hint=(1, None),
                height=dp(160),
                padding=dp(16),
                spacing=dp(8),
                elevation=2,
                radius=[
                    12,
                ],
                md_bg_color=(1, 1, 1, 1),
            )

            # Add patient name and time
            header = MDBoxLayout(
                orientation="horizontal", size_hint_y=None, height=dp(40)
            )
            header.add_widget(
                MDLabel(
                    text=f"{patient_name}",
                    theme_text_color="Primary",
                    font_style="H6",
                    bold=True,
                    size_hint_x=0.7,
                )
            )

            # Add time chip
            time_chip = MDRaisedButton(
                text=time_str,
                size_hint=(None, None),
                size=(dp(80), dp(32)),
                elevation=0,
                md_bg_color=(0.1, 0.5, 0.8, 1),
                theme_text_color="Custom",
                text_color=(1, 1, 1, 1),
            )
            header.add_widget(time_chip)
            card.add_widget(header)

            # Appointment meta information
            meta_box = MDBoxLayout(
                orientation="vertical",
                size_hint_y=None,
                height=dp(56),
                spacing=dp(4),
            )
            meta_box.add_widget(
                MDLabel(
                    text=f"Date: {date_str}",
                    theme_text_color="Secondary",
                    font_style="Body2",
                )
            )
            if patient_email:
                meta_box.add_widget(
                    MDLabel(
                        text=f"Email: {patient_email}",
                        theme_text_color="Secondary",
                        font_style="Caption",
                    )
                )
            meta_box.add_widget(
                MDLabel(
                    text=f"Reason: {reason}",
                    theme_text_color="Primary",
                    font_style="Body2",
                    shorten=True,
                    shorten_from="right",
                )
            )
            card.add_widget(meta_box)

            # Add action buttons
            actions = MDBoxLayout(
                orientation="horizontal",
                size_hint_y=None,
                height=dp(40),
                spacing=dp(8),
            )

            # Add view details button
            view_btn = MDRaisedButton(
                text="View Details",
                size_hint=(0.5, 1),
                on_release=lambda x, a=appointment: self.view_appointment_details(a),
            )
            actions.add_widget(view_btn)

            # Add chat button
            chat_btn = MDRaisedButton(
                text="Chat",
                size_hint=(0.5, 1),
                md_bg_color=(0.6, 0.2, 0.8, 1),
                on_release=lambda x, a=appointment: self.chat_with_patient(a),
            )
            actions.add_widget(chat_btn)

            # Add start consultation button
            consult_btn = MDRaisedButton(
                text="Start Consultation",
                size_hint=(0.5, 1),
                md_bg_color=(0.2, 0.7, 0.2, 1),
                on_release=lambda x, appt_id=appointment_id: self.start_consultation_from_card(appt_id),
            )
            actions.add_widget(consult_btn)

            card.add_widget(actions)
            container.add_widget(card)

        except Exception as e:
            print(f"Error creating appointment card: {str(e)}")

    def start_consultation_from_card(self, appointment_id):
        """Prepare context and navigate to consultation form."""
        if appointment_id:
            self.manager.current_appointment_id = appointment_id
        self.start_consultation()

    def view_appointment_details(self, appointment):
        """View details of a specific appointment"""
        try:
            # Store appointment data in the screen manager
            self.manager.appointment_data = appointment
            self.manager.current = "appointment_detail"
        except Exception as e:
            self.show_error(f"Error viewing appointment: {str(e)}")

    def show_error(self, message):
        """Show error message in the appointments container"""
        appointment_container = self.ids.appointment_container
        appointment_container.clear_widgets()
        error_label = MDLabel(
            text=message,
            halign="center",
            theme_text_color="Error",
            size_hint_y=None,
            height=dp(48),
        )
        appointment_container.add_widget(error_label)

    def view_appointments(self):
        self.manager.current = "doctor_view_appointments"

    def start_consultation(self):
        self.manager.current = "doctor_add_consultation"

    def view_prescriptions(self):
        self.manager.current = "patient_prescriptions"

    def chat_with_patient(self, appointment=None):
        """Navigate to the doctor's chat screen for the selected appointment."""
        appointment_id = None
        partner_name = None

        if isinstance(appointment, dict):
            appointment_id = appointment.get("appointment_id") or appointment.get("id")
            partner_name = appointment.get("patient_name") or appointment.get("patient_email")

        self.manager.active_chat_context = {
            "appointment_id": appointment_id,
            "partner_name": partner_name,
            "back_screen": "doctor_home",
            "header_title": "Chat with {partner}",
            "partner_display_text": f"Discussing appointment #{appointment_id}" if appointment_id else "",
        }
        self.manager.current = "doctor_chat"

    def video_call_patient(self):
        self.manager.current = "video_call"

    def logout(self):
        self.manager.access_token = None
        self.manager.current = "doctor_login"

    def go_home(self):
        """Return to welcome screen"""
        self.manager.current = "welcome"

    def start_video_consultation(self):
        """Start video consultation with patient"""
        self.show_popup(
            "Video Consultation feature coming soon! This will allow you to have virtual consultations with your patients."
        )

    def show_popup(self, message):
        popup = Popup(title="Info", content=Label(text=message), size_hint=(0.8, 0.4))
        popup.open()
