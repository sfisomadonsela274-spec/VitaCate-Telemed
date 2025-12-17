from kivy.uix.screenmanager import Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.metrics import dp
import requests
from kivymd.app import MDApp
from kivymd.uix.button import MDRaisedButton, MDFlatButton
from kivymd.uix.dialog import MDDialog

class DoctorViewAppointmentsScreen(Screen):

    def on_pre_enter(self):
        self.load_appointments()

    def show_popup(self, message, title='Info', button_text='OK'):
        """Show a styled dialog with the given message"""
        app = MDApp.get_running_app()
        dialog = MDDialog(
            title=title,
            text=str(message),
            buttons=[
                MDFlatButton(
                    text=button_text,
                    theme_text_color="Custom",
                    text_color=app.theme_cls.primary_color,
                    on_release=lambda x: dialog.dismiss()
                ),
            ],
        )
        dialog.open()

    def load_appointments(self):
        self.ids.appointment_list.clear_widgets()
        doctor_email = getattr(self.manager, 'doctor_email', None)
        if not doctor_email:
            self.show_popup("Doctor email missing.")
            return
        try:
            url = f"http://127.0.0.1:8000/api/appointments/doctor-list/?email={doctor_email}"
            token = getattr(self.manager, 'access_token', None)
            headers = {"Authorization": f"Bearer {token}"} if token else {}
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code == 200:
                appointments = resp.json().get('appointments', [])
                if not appointments:
                    self.ids.appointment_list.add_widget(Label(text="No appointments.", color=(0,0,0,1)))
                    return

                app = MDApp.get_running_app()
                primary_color = (0.1, 0.5, 0.8, 1)
                accent_color = (0.6, 0.2, 0.8, 1)
                success_color = (0.2, 0.7, 0.2, 1)
                if app and hasattr(app, "theme_cls"):
                    primary_color = getattr(app.theme_cls, "primary_color", primary_color)
                    accent_color = getattr(app.theme_cls, "accent_color", accent_color)

                for a in appointments:
                    box = BoxLayout(orientation='vertical', size_hint_y=None, height=120, padding=6)
                    box.add_widget(Label(text=f"{a['date']} {a['time']}", color=(0,0,0,1)))
                    box.add_widget(Label(text=f"Patient: {a['patient_email']}", color=(0,0,0,1)))
                    btn_row = BoxLayout(size_hint_y=None, height=dp(44), spacing=dp(8))
                    btn_view = MDRaisedButton(
                        text="Details",
                        size_hint=(1, 1),
                        elevation=0,
                        md_bg_color=primary_color,
                        theme_text_color="Custom",
                        text_color=(1, 1, 1, 1),
                    )
                    btn_chat = MDRaisedButton(
                        text="Chat",
                        size_hint=(1, 1),
                        elevation=0,
                        md_bg_color=accent_color,
                        theme_text_color="Custom",
                        text_color=(1, 1, 1, 1),
                    )
                    btn_video = MDRaisedButton(
                        text="Video",
                        size_hint=(1, 1),
                        elevation=0,
                        md_bg_color=success_color,
                        theme_text_color="Custom",
                        text_color=(1, 1, 1, 1),
                    )
                    appt_id = a['appointment_id']
                    pid = a['patient_id']
                    pemail = a['patient_email']
                    btn_view.bind(on_release=lambda inst, appt_id=appt_id: self.open_appointment_detail(appt_id))
                    patient_name = a.get('patient_name')
                    btn_chat.bind(on_release=lambda inst, appt_id=appt_id, pname=patient_name, pemail=pemail: self.open_chat(appt_id, pname, pemail))
                    btn_video.bind(on_release=lambda inst, appt_id=appt_id: self.open_video(appt_id))
                    btn_row.add_widget(btn_view); btn_row.add_widget(btn_chat); btn_row.add_widget(btn_video)
                    box.add_widget(btn_row)
                    self.ids.appointment_list.add_widget(box)
            elif resp.status_code == 204:
                self.ids.appointment_list.add_widget(Label(text="No appointments.", color=(0,0,0,1)))
            else:
                self.show_popup(f"Error: {resp.text}")
        except Exception as e:
            self.show_popup(f"Network error: {e}")

    def open_appointment_detail(self, appointment_id):
        self.manager.current_appointment_id = appointment_id
        self.manager.current = 'appointment_detail'

    def open_chat(self, appointment_id, patient_name=None, patient_email=None):
        self.manager.active_chat_context = {
            "appointment_id": appointment_id,
            "partner_name": patient_name or patient_email,
            "partner_email": patient_email,
            "back_screen": "doctor_view_appointments",
            "header_title": "Chat with {partner}",
            "partner_display_text": f"Appointment #{appointment_id}",
        }
        self.manager.current = 'doctor_chat'

    def open_video(self, appointment_id):
        self.manager.current_appointment_id = appointment_id
        self.manager.current = 'video_call'