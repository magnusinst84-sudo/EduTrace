from dotenv import load_dotenv
load_dotenv()

from utils.firebase_init import init_firebase
from firebase_admin import firestore

init_firebase()
db = firestore.client()
db.collection("test").document("ping").set({"status": "connected"})
print("Firestore connected")
