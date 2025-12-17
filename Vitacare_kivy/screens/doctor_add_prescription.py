from kivy.uix.screenmanager import Screen
from kivy.uix.popup import Popup
from kivy.uix.label import Label
import requests

class DoctorAddPrescriptionScreen(Screen):
    def on_pre_enter(self):
        try:
            self.ids.medicine_input.text = ""
            self.ids.dosage_input.text = ""
            self.ids.notes_input.text = ""
        except Exception:
            pass

    def show_popup(self, message):
        Popup(title="Prescription", content=Label(text=message, color=(0,0,0,1)),
              size_hint=(0.8, 0.4)).open()

    def submit_prescription(self):
        self.add_prescription()

    def add_prescription(self):
        manager = getattr(self, "manager", None)
        token = getattr(manager, "access_token", None) if manager else None
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        appointment_id = getattr(manager, "current_appointment_id", None) if manager else None
        doctor_email = getattr(manager, "doctor_email", None) if manager else None
        patient_id = getattr(manager, "current_patient_id", None) if manager else None

        medicine = self.ids.medicine_input.text.strip()
        dosage = self.ids.dosage_input.text.strip()
        notes = self.ids.notes_input.text.strip()

        if not appointment_id or not doctor_email:
            self.show_popup("Missing appointment context. Please reopen the appointment details.")
            return

        if not patient_id:
            self.show_popup("Patient information unavailable. Please reopen the appointment details.")
            return

        if not medicine or not dosage:
            self.show_popup("Medicine and dosage are required.")
            return

        data = {
            "appointment_id": appointment_id,
            "doctor_email": doctor_email,
            "patient_id": patient_id,
            "medication": medicine,
            "dosage": dosage,
            "notes": notes
        }

        try:
            resp = requests.post("http://127.0.0.1:8000/api/medical/prescriptions/create/", json=data, headers=headers, timeout=8)
            if resp.status_code in (200, 201):
                self.show_popup("Prescription saved.")
                if manager:
                    manager.current = "doctor_view_appointments"
            else:
                try:
                    err = resp.json()
                except Exception:
                    err = resp.text
                self.show_popup(f"Failed: {err}")
        except Exception as e:
            self.show_popup(f"Network error: {e}")