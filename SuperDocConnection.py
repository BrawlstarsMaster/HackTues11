import requests

SUPERDOC_API_URL = "https://superdoc.bg/"
payload = {
    "patient_name": "John Doe",
    "doctor_id": 1234,
    "appointment_time": "2025-04-01T10:00:00"
}

response = requests.post(SUPERDOC_API_URL, json=payload)

if response.status_code == 200:
    print("Appointment successfully booked!")
else:
    print("Failed to book appointment.")
