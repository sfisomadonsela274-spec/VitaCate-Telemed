# VitaCare - Medical Application

VitaCare is a comprehensive medical application built with Kivy and KivyMD, designed to connect patients with healthcare providers for seamless medical consultations and appointment management.

## Features

- **User Authentication**: Secure login for both patients and doctors
- **Appointment Management**: Schedule, view, and manage medical appointments
- **Video Consultations**: Built-in video calling for remote consultations
- **Prescription Management**: Digital prescriptions and medical records
- **Chat System**: Real-time messaging between patients and doctors
- **Medical History**: Secure storage and access to patient medical history

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Vitacare_kivy
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # Unix or MacOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory and add the following:
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   ```

## Running the Application

1. **Start the application**:
   ```bash
   python main.py
   ```

2. **Access the application**:
   The application will start and open in a new window.

## Project Structure

```
Vitacare_kivy/
├── assets/                 # Static assets (images, icons, etc.)
├── kv/                     # Kivy language files
├── screens/                # Application screens
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── main.py                 # Main application entry point
├── README.md               # This file
└── requirements.txt        # Python dependencies
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
```

## Logging

Application logs are stored in `vitacare.log` in the root directory. The log level can be adjusted in `main.py`.

## Building for Distribution

To create a standalone executable:

1. Install PyInstaller:
   ```bash
   pip install pyinstaller
   ```

2. Build the application:
   ```bash
   pyinstaller --name VitaCare --windowed --onefile --add-data "assets;assets" --add-data "kv;kv" main.py
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository.
