import re
import json
import hashlib
from kivy.uix.screenmanager import Screen
from kivy.uix.label import Label
from kivy.clock import Clock
from kivy.properties import BooleanProperty, StringProperty
import requests
from kivymd.app import MDApp
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivymd.uix.card import MDCard
from kivymd.uix.floatlayout import MDFloatLayout
from kivy.properties import StringProperty, BooleanProperty
from kivy.core.window import Window

class DoctorLoginScreen(Screen):
    # Properties for dynamic content
    login_button_text = StringProperty("LOGIN")
    is_loading = BooleanProperty(False)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set window background color
        Window.clearcolor = (0.95, 0.95, 0.98, 1)  # Light blue-gray background

    def clear_fields(self):
        self.ids.email_input.text = ''
        self.ids.license_input.text = ''
        self.ids.password_input.text = ''

    def on_pre_enter(self):
        self.clear_fields()
        self.is_loading = False
        self.login_button_text = "LOGIN"

    def show_popup(self, title, message, button_text='OK'):
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

    def validate_license(self, license_num):
        """Validate license number format"""
        if not license_num:
            return False, "License number is required"
        if len(license_num) < 5:
            return False, "License number appears to be invalid"
        return True, "Valid"

    def validate_inputs(self, email, license_num, password):
        """Validate all login inputs"""
        if not email or not license_num or not password:
            return False, "All fields are required"
        
        if not self.validate_email(email):
            return False, "Please enter a valid email address"
        
        license_valid, license_msg = self.validate_license(license_num)
        if not license_valid:
            return False, license_msg
        
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"
        
        return True, "Valid"

    def start_loading(self):
        """Start loading animation"""
        self.is_loading = True
        self.login_button_text = "PLEASE WAIT..."

    def stop_loading(self):
        """Stop loading animation"""
        self.is_loading = False
        self.login_button_text = "LOGIN"

    def login_doctor(self):
        if self.is_loading:
            return  # Prevent multiple clicks
            
        email = self.ids.email_input.text.strip().lower()
        license_num = self.ids.license_input.text.strip()
        password = self.ids.password_input.text.strip()

        # Validate inputs
        is_valid, message = self.validate_inputs(email, license_num, password)
        if not is_valid:
            self.show_popup("Validation Error", message)
            return

        # Start loading animation
        self.start_loading()

        try:
            url = "http://127.0.0.1:8000/api/users/doctor/login/"
            data = {
                "email": email,
                "license": license_num,
                "password": password
            }
            
            # Add timeout for security
            response = requests.post(url, json=data, timeout=10)

            if response.status_code == 200:
                result = response.json()
                access_token = result.get("access")
                refresh_token = result.get("refresh")
                
                if not access_token:
                    self.stop_loading()
                    self.show_popup("Authentication Failed", "No access token received")
                    return

                # Store tokens in manager
                self.manager.access_token = access_token
                self.manager.refresh_token = refresh_token
                
                # Get doctor data from response
                doctor_data = result.get('doctor', {})
                doctor_email = doctor_data.get('email', '')
                doctor_name = doctor_data.get('name', 'Dr. User')
                
                # Store doctor email in manager
                self.manager.doctor_email = doctor_email
                
                # Store user data in app instance for global access
                app = MDApp.get_running_app()
                app.current_user = {
                    'email': doctor_email,
                    'name': doctor_name,
                    'role': 'doctor',
                    'license_number': license_num,
                    'access_token': access_token
                }

                # Show success message
                self.show_popup("Success", f"Welcome back, Dr. {doctor_name.split()[-1]}!")
                
                # Navigate to doctor home after a short delay
                def navigate_to_home(dt):
                    self.manager.current = 'doctor_home'
                    
                    def set_label(dt2):
                        doctor_home_screen = self.manager.get_screen('doctor_home')
                        if hasattr(doctor_home_screen, 'ids') and 'welcome_label' in doctor_home_screen.ids:
                            doctor_home_screen.ids.welcome_label.text = f"Welcome, {doctor_name}"
                        # Clear sensitive data from form
                        self.clear_fields()
                        self.stop_loading()

                    Clock.schedule_once(set_label, 0.1)

                Clock.schedule_once(navigate_to_home, 1.5)
                
            else:
                self.stop_loading()
                if response.status_code == 401:
                    self.show_popup("Login Failed", "Invalid email, license number, or password.")
                elif response.status_code == 403:
                    self.show_popup("Access Denied", "Account not authorized. Please contact administrator.")
                elif response.status_code == 400:
                    error_data = response.json()
                    error_msg = error_data.get('error', 'Login failed. Please check your credentials.')
                    self.show_popup("Login Error", error_msg)
                elif response.status_code == 404:
                    self.show_popup("Not Found", "Doctor account not found. Please check your credentials.")
                else:
                    self.show_popup("Server Error", f"Please try again later. (Code: {response.status_code})")

        except requests.exceptions.Timeout:
            self.stop_loading()
            self.show_popup("Timeout", "Connection timeout. Please try again.")
        except requests.exceptions.ConnectionError:
            self.stop_loading()
            self.show_popup("Network Error", "Cannot connect to server. Please check your internet connection.")
        except requests.exceptions.RequestException as e:
            self.stop_loading()
            self.show_popup("Network Issue", f"Network error: {str(e)}")
        except KeyError as e:
            self.stop_loading()
            self.show_popup("Data Error", f"Invalid response format: Missing {str(e)}")
        except Exception as e:
            self.stop_loading()
            self.show_popup("Unexpected Error", f"An unexpected error occurred: {str(e)}")

    def on_back_press(self):
        """Handle back button press"""
        self.manager.current = 'welcome'

    def attempt_auto_login(self):
        """Optional: Attempt auto-login if tokens exist"""
        if hasattr(self.manager, 'access_token') and self.manager.access_token:
            try:
                headers = {
                    "Authorization": f"Bearer {self.manager.access_token}",
                    "Content-Type": "application/json"
                }
                response = requests.get(
                    "http://127.0.0.1:8000/api/users/me/", 
                    headers=headers,
                    timeout=5
                )
                if response.status_code == 200:
                    user_data = response.json()
                    if user_data.get('role') == 'doctor':
                        self.manager.current = 'doctor_home'
            except:
                # Clear invalid tokens
                self.manager.access_token = None
                self.manager.refresh_token = None

    def on_enter(self):
        """Called when screen is entered"""
        # Optional: Attempt auto-login
        # self.attempt_auto_login()
        pass

    def reset_form(self):
        """Reset form fields"""
        self.clear_fields()
        
    def on_leave(self):
        """Called when leaving the screen"""
        self.stop_loading()