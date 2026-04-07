import os
import sys
from waitress import serve
from core.wsgi import application

def start_server():
    # Set the port from environment variable or default to 8001
    port = os.getenv('PORT', '8001')
    
    print(f"Starting e-Dak System on port {port}...")
    print(f"Server is running at http://localhost:{port}")
    print("Press Ctrl+C to stop.")
    
    try:
        serve(application, host='0.0.0.0', port=int(port))
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Ensure BASE_DIR is in sys.path
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    if BASE_DIR not in sys.path:
        sys.path.append(BASE_DIR)
        
    start_server()
