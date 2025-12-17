# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('kv/*.kv', 'kv'),
        ('assets/*.png', 'assets'),
        ('assets/*.jpg', 'assets'),
        ('assets/*.ico', 'assets')
    ],
    hiddenimports=[
        'kivy',
        'kivymd',
        'requests',
        'stripe',
        'PIL',
        'screens.welcome',
        'screens.patient_login',
        'screens.doctor_login',
        'screens.sign_up',
        'screens.forgot_password_email',
        'screens.forgot_password_code',
        'screens.reset_password',
        'screens.patient_home',
        'screens.book_appointment',
        'screens.doctor_home',
        'screens.doctor_view_appointments',
        'screens.appointment_detail',
        'screens.doctor_add_prescription',
        'screens.doctor_add_consultation',
        'screens.chat',
        'screens.video_call',
        'screens.patient_prescriptions',
        'screens.patient_consultations'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='VitaCare',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Set to True if you want to see console output
    icon='assets/icon.ico',  # Add an icon file
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)