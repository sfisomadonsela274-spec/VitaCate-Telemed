from kivy.uix.screenmanager import Screen
from kivy.uix.popup import Popup
from kivy.uix.label import Label
import requests

class AppointmentDetailScreen(Screen):
    def on_pre_enter(self):
        self.load_detail()

    def show_popup(self, msg):
        Popup(title="Info", content=Label(text=str(msg), color=(0,0,0,1)), size_hint=(0.8,0.4)).open()

    def load_detail(self):
        appt_id = getattr(self.manager, 'current_appointment_id', None)
        if not appt_id:
            self.ids.detail_label.text = "No appointment selected."
            return
        doctor_email = getattr(self.manager, 'doctor_email', '')
        resp = requests.get(f"http://127.0.0.1:8000/api/appointments/doctor-list/?email={doctor_email}")
        if resp.status_code == 200:
            for a in resp.json().get('appointments', []):
                if a['appointment_id'] == appt_id:
                    self.ids.detail_label.text = f"Date: {a['date']}\nTime: {a['time']}\nPatient: {a['patient_email']}\nReason: {a['reason']}"
                    self.manager.current_patient_id = a['patient_id']
                    self.manager.current_patient_email = a['patient_email']
                    self.manager.current_patient_name = a.get('patient_name')
                    return
            self.ids.detail_label.text = "Appointment not found."
        else:
            self.ids.detail_label.text = "Failed to load appointment."

    def mark_complete(self):
        appt_id = getattr(self.manager, 'current_appointment_id', None)
        if not appt_id:
            self.show_popup("No appointment selected.")
            return
        token = getattr(self.manager, 'access_token', None)
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        resp = requests.post(f"http://127.0.0.1:8000/api/appointments/complete/{appt_id}/", headers=headers)
        if resp.status_code == 200:
            self.show_popup("Appointment marked complete.")
            self.manager.current = 'doctor_view_appointments'
        else:
            self.show_popup(f"Error: {resp.text}")

    def add_prescription(self):
        self.manager.current = 'doctor_add_prescription'

    def add_consultation(self):
        self.manager.current = 'doctor_add_consultation'

    def start_chat(self):
        appointment_id = getattr(self.manager, 'current_appointment_id', None)
        if not appointment_id:
            self.show_popup("No appointment selected.")
            return

        patient_name = getattr(self.manager, 'current_patient_name', None)
        patient_email = getattr(self.manager, 'current_patient_email', None)

        self.manager.active_chat_context = {
            "appointment_id": appointment_id,
            "partner_name": patient_name or patient_email,
            "partner_email": patient_email,
            "back_screen": "appointment_detail",
            "header_title": "Chat with {partner}",
            "partner_display_text": f"Appointment #{appointment_id}",
        }
        self.manager.current = 'doctor_chat'