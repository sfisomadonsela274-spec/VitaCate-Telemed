from kivy.uix.screenmanager import Screen
from kivy.uix.label import Label
from kivymd.app import MDApp
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton

from api_client import authenticated_request

class PatientConsultationsScreen(Screen):
    def on_pre_enter(self, *args):
        self.ids.consultation_list.text = "Loading..."
        self.load_consultations()

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

    def load_consultations(self):
        response, error = authenticated_request(
            "GET",
            "http://127.0.0.1:8000/api/medical/consultations/my/",
            self.manager,
            timeout=8,
        )

        if response is None:
            if error == "authentication_required":
                self.ids.consultation_list.text = "Please log in to view consultations."
            else:
                self.ids.consultation_list.text = f"Network error: {error}"
            return

        if response.status_code == 200:
            try:
                data = response.json()
                items = data if isinstance(data, list) else data.get("consultations") or data
                if not items:
                    self.ids.consultation_list.text = "No consultations yet."
                    return
                lines = []
                for c in items:
                    doctor_display = c.get("doctor_name")
                    doctor_raw = c.get("doctor")
                    if not doctor_display:
                        if isinstance(doctor_raw, dict):
                            doctor_display = doctor_raw.get("full_name") or doctor_raw.get("email")
                        elif doctor_raw:
                            doctor_display = f"Doctor #{doctor_raw}"
                        else:
                            doctor_display = "Doctor"

                    summary = c.get("summary") or c.get("diagnosis") or c.get("summary_text", "")
                    notes = c.get("notes", "")
                    follow_up = c.get("follow_up", "")
                    date = c.get("date", "")

                    detail_lines = [
                        f"Doctor: {doctor_display}",
                        f"Date: {date}",
                        f"Summary: {summary}" if summary else "Summary: N/A",
                    ]
                    if notes:
                        detail_lines.append(f"Notes: {notes}")
                    if follow_up:
                        detail_lines.append(f"Follow-up: {follow_up}")

                    lines.append("\n".join(detail_lines))
                self.ids.consultation_list.text = "\n\n".join(lines)
            except Exception as exc:
                self.ids.consultation_list.text = f"Failed to parse consultations: {exc}"
        elif response.status_code in (401, 403):
            self.ids.consultation_list.text = "Session expired. Please log in again."
        else:
            self.ids.consultation_list.text = f"Failed to load: {response.status_code}"