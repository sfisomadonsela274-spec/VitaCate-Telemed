from kivy.uix.screenmanager import Screen
from kivy.uix.label import Label
from kivymd.app import MDApp
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton

from api_client import authenticated_request

class PatientPrescriptionsScreen(Screen):
    def on_pre_enter(self, *args):
        self.ids.prescription_list.text = "Loading..."
        self.load_prescriptions()

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

    def load_prescriptions(self):
        response, error = authenticated_request(
            "GET",
            "http://127.0.0.1:8000/api/medical/prescriptions/my/",
            self.manager,
            timeout=8,
        )

        if response is None:
            if error == "authentication_required":
                self.ids.prescription_list.text = "Please log in to view prescriptions."
            else:
                self.ids.prescription_list.text = f"Network error: {error}"
            return

        if response.status_code == 200:
            try:
                data = response.json()
                items = data if isinstance(data, list) else data.get("prescriptions") or data
                if not items:
                    self.ids.prescription_list.text = "No prescriptions yet."
                    return
                lines = []
                for p in items:
                    doctor_display = p.get("doctor_name")
                    doctor_raw = p.get("doctor")
                    if not doctor_display:
                        if isinstance(doctor_raw, dict):
                            doctor_display = doctor_raw.get("full_name") or doctor_raw.get("email")
                        elif doctor_raw:
                            doctor_display = f"Doctor #{doctor_raw}"
                        else:
                            doctor_display = "Doctor"

                    med = p.get("medication") or p.get("medicine") or p.get("medication_name", "N/A")
                    dosage = p.get("dosage", "N/A")
                    notes = p.get("notes", "")
                    date = p.get("date_issued") or p.get("date", "")

                    detail_lines = [
                        f"Doctor: {doctor_display}",
                        f"Medicine: {med}",
                        f"Dosage: {dosage}",
                    ]
                    if date:
                        detail_lines.append(f"Date: {date}")
                    if notes:
                        detail_lines.append(f"Notes: {notes}")

                    lines.append("\n".join(detail_lines))
                self.ids.prescription_list.text = "\n\n".join(lines)
            except Exception as exc:
                self.ids.prescription_list.text = f"Failed to parse prescriptions: {exc}"
        elif response.status_code in (401, 403):
            self.ids.prescription_list.text = "Session expired. Please log in again."
        else:
            self.ids.prescription_list.text = f"Failed to load: {response.status_code}"