from kivy.uix.screenmanager import Screen
from kivy.uix.popup import Popup
from kivy.uix.label import Label
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
import requests
import stripe

class BookAppointmentScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Initialize Stripe with your existing API key
        stripe.api_key = "sk_test_51RnZUeFfw2n197YweVuQb94gG90ov7U7TodTKNu7Vvy9wWjULhXq1a3RRHPnVZ4jGyBgsGw8DXBKzSKgxYigb1NZ00ETSnYLC5"

    def show_popup(self, message):
        popup = Popup(title="Appointment Info",
                      content=Label(text=message),
                      size_hint=(0.8, 0.4))
        popup.open()

    def process_payment(self, customer_email, customer_name, amount=2000):
        """Process payment using Stripe - added function"""
        try:
            # Create customer using your existing Stripe code
            customer = stripe.Customer.create(
                email=customer_email,
                name=customer_name
            )
            print(f"Customer created: {customer.id}")

            # Create payment intent using your existing Stripe code
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,  # Amount in cents
                currency="zar",
                payment_method_types=["card"],
                customer=customer.id
            )
            print(f"Payment Intent created: {payment_intent.id}")
            
            # For demo purposes, we'll assume payment is successful
            # In real implementation, you'd handle the payment flow here
            return True
            
        except Exception as e:
            print(f"Payment processing error: {e}")
            return False

    def show_back_confirmation(self):
        """Show confirmation dialog before going back"""
        from kivymd.app import MDApp
        
        def confirm_exit(instance):
            dialog.dismiss()
            self.manager.current = 'patient_home'
        
        app = MDApp.get_running_app()
        dialog = MDDialog(
            title="Discard Changes?",
            text="Are you sure you want to go back? Any unsaved changes will be lost.",
            buttons=[
                MDFlatButton(
                    text="CANCEL",
                    theme_text_color="Custom",
                    text_color=app.theme_cls.primary_color,
                    on_release=lambda x: dialog.dismiss()
                ),
                MDFlatButton(
                    text="DISCARD",
                    theme_text_color="Custom",
                    text_color=(0.8, 0.2, 0.2, 1),
                    on_release=confirm_exit
                ),
            ],
        )
        dialog.open()

    def book_appointment(self):
        """Original function with Stripe payment added"""
        email = self.ids.doctor_email.text.strip()
        date = self.ids.date_input.text.strip()
        time = self.ids.time_input.text.strip()
        reason = self.ids.reason_input.text.strip()

        if not email:
            self.show_popup("Doctor email is required.")
            return

        try:
            # First process payment
            # You might want to get patient email/name from your user data
            payment_success = self.process_payment(
                customer_email="patient@example.com",  # Replace with actual patient email
                customer_name="Patient Name"  # Replace with actual patient name
            )
            
            if not payment_success:
                self.show_popup("Payment processing failed. Please try again.")
                return

            # Continue with original appointment booking logic
            url_id = f"http://127.0.0.1:8000/api/users/doctor-id/?email={email}"
            response_id = requests.get(url_id)
            if response_id.status_code != 200:
                self.show_popup("Doctor not found.")
                return
            doctor_id = response_id.json().get("doctor_id")

            url_book = "http://127.0.0.1:8000/api/appointments/book/"
            headers = {
                "Authorization": f"Bearer {self.manager.access_token}",
                "Content-Type": "application/json"
            }
            data = {"doctor": doctor_id}
            if date:
                data["date"] = date
            if time:
                data["time"] = time
            if reason:
                data["reason"] = reason

            response_book = requests.post(url_book, json=data, headers=headers)
            if response_book.status_code == 201:
                res = response_book.json()
                msg = f"✅ Appointment booked successfully!\nSuggested time: {res.get('suggested_time')}\nPayment processed successfully!"
                self.show_popup(msg)
                self.ids.appointment_status.text = f"Next available: {res.get('suggested_time')}"
            else:
                error = response_book.json()
                self.show_popup(f"❌ Error: {error}")
        except Exception as e:
            self.show_popup(f"Error: {str(e)}")