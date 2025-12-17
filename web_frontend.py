from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
import requests
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# Backend API URL
BACKEND_URL = 'http://127.0.0.1:8000'

@app.route('/')
def index():
    return render_template('welcome.html')

@app.route('/patient_login', methods=['GET', 'POST'])
def patient_login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        
        if not email or not password:
            flash('All fields are required', 'error')
            return render_template('patient_login.html')
        
        try:
            response = requests.post(f"{BACKEND_URL}/api/users/login/", 
                                   json={"email": email, "password": password}, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                session['access_token'] = result.get('access')
                session['refresh_token'] = result.get('refresh')
                
                # Get user info
                headers = {"Authorization": f"Bearer {session['access_token']}"}
                me_response = requests.get(f"{BACKEND_URL}/api/users/me/", 
                                         headers=headers, timeout=10)
                
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    if user_data.get('role') == 'patient':
                        session['user'] = user_data
                        return redirect(url_for('patient_home'))
                    else:
                        flash('Access denied. Please use doctor login.', 'error')
                else:
                    flash('Failed to fetch user information.', 'error')
            elif response.status_code == 401:
                flash('Invalid email or password.', 'error')
            else:
                flash(f'Server error: {response.status_code}', 'error')
                
        except requests.exceptions.RequestException as e:
            flash(f'Network error: {str(e)}', 'error')
    
    return render_template('patient_login.html')

@app.route('/doctor_login', methods=['GET', 'POST'])
def doctor_login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '').strip()
        
        if not email or not password:
            flash('All fields are required', 'error')
            return render_template('doctor_login.html')
        
        try:
            response = requests.post(f"{BACKEND_URL}/api/users/login/", 
                                   json={"email": email, "password": password}, 
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                session['access_token'] = result.get('access')
                session['refresh_token'] = result.get('refresh')
                
                # Get user info
                headers = {"Authorization": f"Bearer {session['access_token']}"}
                me_response = requests.get(f"{BACKEND_URL}/api/users/me/", 
                                         headers=headers, timeout=10)
                
                if me_response.status_code == 200:
                    user_data = me_response.json()
                    if user_data.get('role') == 'doctor':
                        session['user'] = user_data
                        return redirect(url_for('doctor_home'))
                    else:
                        flash('Access denied. Please use patient login.', 'error')
                else:
                    flash('Failed to fetch user information.', 'error')
            elif response.status_code == 401:
                flash('Invalid email or password.', 'error')
            else:
                flash(f'Server error: {response.status_code}', 'error')
                
        except requests.exceptions.RequestException as e:
            flash(f'Network error: {str(e)}', 'error')
    
    return render_template('doctor_login.html')

@app.route('/patient_home')
def patient_home():
    if 'user' not in session or session['user'].get('role') != 'patient':
        return redirect(url_for('patient_login'))
    return render_template('patient_home.html', user=session['user'])

@app.route('/doctor_home')
def doctor_home():
    if 'user' not in session or session['user'].get('role') != 'doctor':
        return redirect(url_for('doctor_login'))
    return render_template('doctor_home.html', user=session['user'])

@app.route('/logout', methods=['GET', 'POST'])
def logout():
    if request.method == 'POST':
        # Clear all session data
        session.clear()
        
        # Add security headers to prevent caching of sensitive pages
        response = redirect(url_for('index'))
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        # Clear any potential session cookies
        response.set_cookie('session', '', expires=0)
        
        # Show logout success message
        flash('You have been successfully logged out.', 'success')
        return response
    
    # If GET request, show logout confirmation
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Logout Confirmation</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
            .modal-overlay {
                background-color: rgba(0, 0, 0, 0.5);
            }
        </style>
    </head>
    <body class="bg-gray-100 h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Logout Confirmation</h2>
            <p class="text-gray-600 mb-6">Are you sure you want to log out? This will end your current session.</p>
            
            <div class="flex justify-end space-x-4">
                <a href="/" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                    Cancel
                </a>
                <form method="POST" action="{{ url_for('logout') }}" class="inline">
                    <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        Logout
                    </button>
                </form>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    app.run(debug=True, port=5000)
