# 🏥 VitaCare Telemedicine Platform

[![Deployment Status](https://img.shields.io/github/actions/workflow/status/sfisomadonsela274-spec/VitaCate-Telemed/deploy.yml?branch=main&label=Deployment&style=flat-square)](https://sfisomadonsela274-spec.github.io/VitaCate-Telemed/)
[![Tech Stack](https://img.shields.io/badge/Stack-Angular%2018%20%2B%20Supabase-587064?style=flat-square)](https://angular.io)

**VitaCare** is a professional-grade, clinical telemedicine system designed with a "Soft Clinical Luxury" aesthetic. It provides a seamless interface for both patients and healthcare professionals to manage consultations, prescriptions, and real-time vital monitoring.

---

## 🚀 Live Demo

Experience the platform live at:  
👉 **[https://sfisomadonsela274-spec.github.io/VitaCate-Telemed/](https://sfisomadonsela274-spec.github.io/VitaCate-Telemed/)**

---

## ✨ Key Features

- **🔐 Dual-Portal Authentication**: Secure, specialized login flows for Patients and Doctors.
- **📊 Real-time Monitoring**: Integrated vitals tracking (Heart Rate, SpO2, Temperature).
- **📋 Clinical Management**: Digital prescription signing and consultation history.
- **💬 Secure Communication**: Real-time patient-doctor messaging.
- **🎨 Premium UI/UX**: Custom SCSS design system optimized for clinical environments.

---

## 🔐 Authentication & Access

### 🩺 Doctor Portal
To access the professional dashboard, doctors require their medical license number in addition to their credentials.

- **Email**: `dr.smith@vitacare.com` *(Demo)*
- **License Number**: `MED-1001` *(Demo)*
- **Password**: `testpass123`

### 👤 Patient Portal
Patients can log in using their registered email and password.

- **Email**: `patient@test.com` *(Demo)*
- **Password**: `testpass123`

---

## 🛠️ Tech Stack

- **Frontend**: [Angular 18](https://angular.io/) (Standalone Components, Signals)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- **Styling**: Vanilla CSS / SCSS (Custom Design Tokens)
- **Deployment**: GitHub Pages (Automated via GitHub Actions)

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sfisomadonsela274-spec/VitaCate-Telemed.git
   cd VitaCate-Telemed/vitacare-ng
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4200/`.

---

## 📁 Project Structure

```text
VitaCate-Telemed/
├── vitacare-ng/        # Modern Angular Frontend
│   ├── src/            # Source code
│   └── public/         # Static assets
└── supabase/           # Database migrations & SQL
```

---

## ⚖️ License & Terms

*This project is a clinical demonstration platform. Ensure Row Level Security (RLS) is enabled on all tables in production environments.*
