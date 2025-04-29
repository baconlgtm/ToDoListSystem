import requests
import sys

def check_backend():
    try:
        response = requests.get('http://localhost:8000/')
        if response.status_code == 200:
            print("✅ Backend is running and responding correctly")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend")
        return False

if __name__ == "__main__":
    if check_backend():
        sys.exit(0)
    else:
        sys.exit(1) 