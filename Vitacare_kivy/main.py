import os
import sys
import logging
from pathlib import Path
from typing import Dict, Type, List, Tuple

# Configure logging before any other imports
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('vitacare.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Third-party imports
from kivy.config import Config
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, NoTransition, Screen
from kivymd.app import MDApp

# Configure application paths
BASE_DIR = Path(__file__).parent.absolute()
ASSETS_DIR = BASE_DIR / 'assets'
KV_DIR = BASE_DIR / 'kv'

# Handle PyInstaller bundled app
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    ASSETS_DIR = Path(sys._MEIPASS) / 'assets'
    KV_DIR = Path(sys._MEIPASS) / 'kv'

# Add to Python path
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Ensure required directories exist
for directory in [ASSETS_DIR, KV_DIR]:
    try:
        directory.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logger.error(f"Failed to create directory {directory}: {e}")
        sys.exit(1)

# Lazy load screens to improve startup time
def get_screen_imports() -> Dict[str, Type[Screen]]:
    """Dynamically import and return screen classes."""
    screen_imports = {
        'welcome': 'WelcomeScreen',
        'patient_login': 'PatientLoginScreen',
        'doctor_login': 'DoctorLoginScreen',
        'sign_up': 'SignUpScreen',
        'forgot_password_email': 'ForgotPasswordEmailScreen',
        'forgot_password_code': 'ForgotPasswordCodeScreen',
        'reset_password': 'ResetPasswordScreen',
        'patient_home': 'PatientHomeScreen',
        'book_appointment': 'BookAppointmentScreen',
        'doctor_home': 'DoctorHomeScreen',
        'doctor_view_appointments': 'DoctorViewAppointmentsScreen',
        'appointment_detail': 'AppointmentDetailScreen',
        'doctor_add_prescription': 'DoctorAddPrescriptionScreen',
        'doctor_add_consultation': 'DoctorAddConsultationScreen',
        'doctor_chat': ('chat', 'DoctorChatScreen'),
        'patient_chat': ('chat', 'PatientChatScreen'),
        'video_call': 'VideoCallScreen',
        'patient_prescriptions': 'PatientPrescriptionsScreen',
        'patient_consultations': 'PatientConsultationsScreen'
    }
    
    screens = {}
    for screen_name, target in screen_imports.items():
        try:
            if isinstance(target, tuple):
                module_name, class_name = target
            else:
                module_name, class_name = screen_name, target

            module = __import__(f'screens.{module_name}', fromlist=[class_name])
            screens[screen_name] = getattr(module, class_name)
        except (ImportError, AttributeError) as e:
            logger.error(f"Failed to import screen {screen_name}: {e}")
            continue

    
    return screens

def load_kv_files() -> bool:
    """Load all KV files with proper error handling."""
    kv_files = [
        "welcome_screen.kv",
        "patient_login.kv",
        "doctor_login.kv",
        "sign_up.kv",
        "forgot_password_email.kv",
        "forgot_password_code.kv",
        "reset_password.kv",
        "patient_home.kv",
        "book_appointment.kv",
        "doctor_home.kv",
        "doctor_view_appointments.kv",
        "appointment_detail.kv",
        "doctor_add_prescription.kv",
        "doctor_add_consultation.kv",
        "message_bubble.kv",
        "chat.kv",
        "video_call.kv",
        "patient_prescriptions.kv",
        "patient_consultations.kv",
        "main.kv"
    ]
    
    success = True
    for kv_file in kv_files:
        kv_path = KV_DIR / kv_file
        try:
            Builder.load_file(str(kv_path))
            logger.info(f"Successfully loaded KV file: {kv_file}")
        except Exception as e:
            logger.error(f"Failed to load KV file {kv_file}: {e}")
            success = False
    
    return success

class VitaCareApp(MDApp):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.title = "VitaCare - Medical App"
        self.icon = str(ASSETS_DIR / 'icon.png')
        self.screen_manager = None
        self._screens = {}
        
        # Configure theme
        self.theme_cls.primary_palette = "Blue"
        self.theme_cls.theme_style = "Light"
        
        # Configure window settings
        self._configure_window()
    
    def _configure_window(self):
        """Configure application window settings."""
        Config.set('graphics', 'width', '1200')
        Config.set('graphics', 'height', '800')
        Config.set('graphics', 'minimum_width', '800')
        Config.set('graphics', 'minimum_height', '600')
        Config.set('graphics', 'resizable', '1')
        Config.set('kivy', 'exit_on_escape', '0')
    
    def build(self):
        """Build the application."""
        try:
            # Load KV files
            if not load_kv_files():
                logger.warning("Some KV files failed to load, the app may not work as expected")
            
            # Initialize screen manager
            self.screen_manager = ScreenManager(transition=NoTransition())
            
            # Load screens dynamically
            screen_classes = get_screen_imports()
            for name, screen_class in screen_classes.items():
                self._add_screen(name, screen_class)
            
            # Set initial screen
            self.screen_manager.current = "welcome"
            logger.info("Application initialized successfully")
            return self.screen_manager
            
        except Exception as e:
            logger.critical(f"Failed to initialize application: {e}", exc_info=True)
            raise
    
    def _add_screen(self, name: str, screen_class: Type[Screen]) -> None:
        """Safely add a screen to the screen manager."""
        try:
            if name not in self._screens:
                screen = screen_class(name=name)
                self.screen_manager.add_widget(screen)
                self._screens[name] = screen
                logger.debug(f"Added screen: {name}")
        except Exception as e:
            logger.error(f"Failed to add screen {name}: {e}", exc_info=True)
    
    def switch_screen(self, screen_name: str, direction: str = 'left') -> None:
        """Safely switch between screens with animation."""
        try:
            if screen_name in self.screen_manager.screen_names:
                self.screen_manager.transition.direction = direction
                self.screen_manager.current = screen_name
                logger.debug(f"Switched to screen: {screen_name}")
            else:
                logger.warning(f"Attempted to switch to non-existent screen: {screen_name}")
        except Exception as e:
            logger.error(f"Failed to switch to screen {screen_name}: {e}")
    
    def on_stop(self):
        """Clean up resources when the application stops."""
        logger.info("Application is shutting down")
        # Add any cleanup code here

def main():
    """Main entry point for the application."""
    try:
        logger.info("Starting VitaCare application")
        app = VitaCareApp()
        return app.run()
    except Exception as e:
        logger.critical(f"Unhandled exception: {e}", exc_info=True)
        return 1
    finally:
        logger.info("VitaCare application has exited")

if __name__ == "__main__":
    sys.exit(main())