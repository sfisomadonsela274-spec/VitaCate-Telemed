from kivy.uix.screenmanager import Screen
from kivy.uix.label import Label
from kivy.clock import Clock
import hashlib
import re
import requests
from kivymd.app import MDApp
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton

from api_client import authenticated_request

class PatientLoginScreen(Screen):
    def clear_fields(self):
        self.ids.email_input.text = ''
        self.ids.password_input.text = ''
        
    def on_pre_enter(self):
        self.clear_fields()
    
    def on_back_press(self):
        self.manager.current = 'welcome'

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

    def validate_email(self, email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def validate_inputs(self, email, password):
        """Validate login inputs"""
        if not email or not password:
            return False, "All fields are required"
        
        if not self.validate_email(email):
            return False, "Please enter a valid email address"
        
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"
        
        return True, "Valid"

    def hash_password(self, password):
        """Hash password for additional security (optional client-side hashing)"""
        # Note: This is in addition to your backend security
        salt = "vitacare_client_salt"
        return hashlib.sha256((password + salt).encode()).hexdigest()

    def login_user(self):
        # Get reference to the login button
        login_button = self.ids.get('login_button')
        
        def reset_login_button():
            if login_button:
                login_button.disabled = False
                login_button.text = 'Login'
        
        def complete_login(dt):
            try:
                # Get input values
                email = self.ids.email_input.text.strip().lower()
                password = self.ids.password_input.text.strip()

                # Validate inputs
                is_valid, message = self.validate_inputs(email, password)
                if not is_valid:
                    self.show_popup(message)
                    reset_login_button()
                    return
                
                # Make API request to login
                url = "http://127.0.0.1:8000/api/users/login/"
                data = {
                    "email": email,
                    "password": password  # Note: In production, ensure this is using HTTPS
                }

                response = requests.post(url, json=data, timeout=10)
                response.raise_for_status()

                result = response.json()
                access_token = result.get('access')
                refresh_token = result.get('refresh')
                user_info = result.get('user') or {}

                if not access_token:
                    raise ValueError("No access token received")

                # Store tokens in manager
                self.manager.access_token = access_token
                self.manager.refresh_token = refresh_token

                # Store user info
                app = MDApp.get_running_app()
                app.current_user = {
                    'email': email,
                    'first_name': user_info.get('first_name', ''),
                    'role': user_info.get('role', 'patient'),
                    'access_token': access_token
                }
                
                # Clear sensitive data from form
                self.clear_fields()
                
                # Navigate to patient home
                self.manager.current = 'patient_home'
                
                # Update welcome message after a short delay
                def update_label(dt):
                    try:
                        patient_home_screen = self.manager.get_screen('patient_home')
                        if hasattr(patient_home_screen, 'ids') and 'welcome_label' in patient_home_screen.ids:
                            patient_home_screen.ids.welcome_label.text = f"Welcome, {app.current_user.get('first_name', '')}!"
                    except Exception as e:
                        print(f"Error updating welcome label: {e}")
                    finally:
                        reset_login_button()

                Clock.schedule_once(update_label, 0.5)

            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 401:
                    self.show_popup("Invalid email or password.")
                elif e.response.status_code == 400:
                    try:
                        error_data = e.response.json()
                        self.show_popup(f"Login error: {error_data.get('detail', 'Invalid request')}")
                    except Exception:
                        self.show_popup("Invalid request format.")
                else:
                    self.show_popup(f"Server error: {e.response.status_code}")
            except requests.exceptions.Timeout:
                self.show_popup("Connection timeout. Please try again.")
            except requests.exceptions.ConnectionError:
                self.show_popup("Network error. Please check your connection.")
            except requests.exceptions.RequestException as e:
                self.show_popup(f"Network error: {str(e)}")
            except Exception as e:
                self.show_popup(f"An error occurred: {str(e)}")
            finally:
                reset_login_button()
        
        try:
            # Disable the login button to prevent multiple submissions
            if login_button:
                login_button.disabled = True
                login_button.text = 'Logging in...'
            
            # Schedule the login to run in the next frame to prevent UI freeze
            Clock.schedule_once(complete_login, 0.1)
            
        except Exception as e:
            self.show_popup(f"Error during login: {str(e)}")
            reset_login_button()

    def attempt_auto_login(self):
        """Optional: Attempt auto-login if tokens exist"""
        if hasattr(self.manager, 'access_token') and self.manager.access_token:
            try:
                headers = {"Authorization": f"Bearer {self.manager.access_token}"}
                response = requests.get(
                    "http://127.0.0.1:8000/api/users/me/", 
                    headers=headers,
                    timeout=5
                )
                if response.status_code == 200:
                    self.manager.current = 'patient_home'
            except:
                # Clear invalid tokens
                self.manager.access_token = None
                self.manager.refresh_token = None

    def on_enter(self):
        """Called when screen is entered"""
        # Optional: Attempt auto-login
        # self.attempt_auto_login()
        pass