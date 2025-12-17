from kivy.uix.screenmanager import Screen
from kivy.uix.label import Label
import requests
import json
from kivymd.app import MDApp
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton

class SignUpScreen(Screen):
    def on_back_press(self):
        self.manager.current = 'patient_login'
    
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

    def sign_up(self):
        # Get form data
        email = self.ids.email_input.text.strip()
        password = self.ids.password_input.text.strip()
        confirm_password = self.ids.confirm_password_input.text.strip()
        first_name = self.ids.first_name_input.text.strip()
        last_name = self.ids.last_name_input.text.strip()
        phone = self.ids.phone_input.text.strip()
        address = self.ids.address_input.text.strip()
        
        # Default to patient role for sign-up
        role = 'patient'

        # Validation
        if not all([email, password, confirm_password, first_name, last_name]):
            self.show_popup("Error", "All required fields are required")
            return

        if password != confirm_password:
            self.show_popup("Error", "Passwords do not match")
            return

        # Password strength validation
        if len(password) < 8:
            self.show_popup("Error", "Password must be at least 8 characters long")
            return
        
        if not any(c.isupper() for c in password):
            self.show_popup("Error", "Password must contain at least one uppercase letter")
            return
            
        if not any(c.islower() for c in password):
            self.show_popup("Error", "Password must contain at least one lowercase letter")
            return
            
        if not any(c.isdigit() for c in password):
            self.show_popup("Error", "Password must contain at least one digit")
            return

        try:
            # Prepare data with exact field names expected by serializer
            data = {
                "email": email.lower(),  # Normalize email
                "password": password,
                "confirm_password": confirm_password,
                "first_name": first_name,
                "last_name": last_name,
                "role": role
            }
            
            if phone:
                data["phone"] = phone
            if address:
                data["address"] = address
            
            # Make API request with timeout and proper headers
            url = "http://127.0.0.1:8000/api/users/register/"
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            response = requests.post(url, json=data, headers=headers, timeout=10)
            
            if response.status_code == 201:
                self.show_popup("Success", "Account created successfully! Please login.")
                self.manager.current = "patient_login"
                self.clear_form()
            elif response.status_code == 400:
                # Parse validation errors
                try:
                    errors = response.json()
                    error_messages = []
                    for field, error in errors.items():
                        if isinstance(error, list):
                            error_messages.append(f"{field}: {' '.join(error)}")
                        else:
                            error_messages.append(f"{field}: {error}")
                    self.show_popup("Validation Error", "\n".join(error_messages))
                except:
                    self.show_popup("Error", f"Registration failed: {response.text}")
            else:
                error_msg = response.text
                self.show_popup("Error", f"Registration failed ({response.status_code}): {error_msg}")

        except requests.exceptions.ConnectionError:
            self.show_popup("Connection Error", 
                          "Cannot connect to server. Please make sure the backend server is running on http://127.0.0.1:8000")
        except requests.exceptions.Timeout:
            self.show_popup("Timeout Error", "Server connection timed out. Please try again.")
        except Exception as e:
            self.show_popup("Error", f"An error occurred: {str(e)}")

    def clear_form(self):
        # Clear all form fields
        self.ids.email_input.text = ""
        self.ids.password_input.text = ""
        self.ids.confirm_password_input.text = ""
        self.ids.first_name_input.text = ""
        self.ids.last_name_input.text = ""
        self.ids.phone_input.text = ""
        self.ids.address_input.text = ""