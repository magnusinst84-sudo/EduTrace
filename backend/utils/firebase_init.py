import base64, json, os
import firebase_admin
from firebase_admin import credentials

def init_firebase():
    b64 = os.environ.get("FIREBASE_SERVICE_ACCOUNT_BASE64")
    if not b64:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT_BASE64 not set")

    decoded = base64.b64decode(b64).decode("utf-8")
    service_account = json.loads(decoded)

    cred = credentials.Certificate(service_account)
    firebase_admin.initialize_app(cred)