from kivy.uix.screenmanager import Screen
from kivy.uix.popup import Popup
from kivy.uix.label import Label
from kivy.app import App
import webbrowser

class VideoCallScreen(Screen):
    def start_call(self):
        app = App.get_running_app()
        appt_id = getattr(app, "current_appointment_id", None) or "room"
        room = f"vitacare_{appt_id}"
        url = f"https://meet.jit.si/{room}"
        try:
            webbrowser.open(url)
            Popup(title="Video Call", content=Label(text=f"Opening room: {room}", color=(0,0,0,1)),
                  size_hint=(0.8, 0.4)).open()
        except Exception as e:
            Popup(title="Error", content=Label(text=str(e), color=(0,0,0,1)), size_hint=(0.8,0.4)).open()