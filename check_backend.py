#!/usr/bin/env python3
"""
Quick backend health check and startup script.
Checks if backend is running and helps start it if not.
"""
import subprocess
import socket
import sys
import os
from pathlib import Path

def check_port(port: int) -> bool:
    """Check if a port is in use."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()
    return result == 0

def main():
    print("=" * 60)
    print("Kotoba Dojo - Backend Health Check")
    print("=" * 60)
    print()
    
    # Check if backend is running
    print("[1/3] Checking if backend is running on port 8000...")
    if check_port(8000):
        print("✅ Backend is running on port 8000")
        print()
        print("Next steps:")
        print("1. Open frontend: http://localhost:5173")
        print("2. Check API docs: http://localhost:8000/docs")
        print("3. If still getting errors, restart backend:")
        print("   - Stop current server (Ctrl+C in terminal)")
        print("   - Run: cd server && python init_db.py")
        print("   - Run: cd server && uvicorn app.main:app --reload")
        return
    else:
        print("❌ Backend is NOT running on port 8000")
        print()
    
    # Check if we're in the right directory
    print("[2/3] Checking project directory...")
    server_dir = Path("server")
    if not server_dir.exists():
        print("❌ Error: 'server' directory not found")
        print("Please run this script from the project root directory")
        print("Current directory:", os.getcwd())
        return
    else:
        print("✅ Found server directory")
        print()
    
    # Provide startup instructions
    print("[3/3] Backend Startup Instructions")
    print("=" * 60)
    print()
    print("To start the backend, run these commands:")
    print()
    
    if sys.platform == "win32":
        print("Option 1 - Using startup script (Recommended):")
        print("  start_backend.bat")
        print()
        print("Option 2 - Manual commands:")
        print("  cd server")
        print("  python init_db.py")
        print("  uvicorn app.main:app --reload")
    else:
        print("  cd server")
        print("  python init_db.py")
        print("  uvicorn app.main:app --reload")
    
    print()
    print("Then in a NEW terminal:")
    print("  cd web")
    print("  npm run dev")
    print()
    print("=" * 60)
    print()
    print("Common Issues:")
    print("- If 'uvicorn' not found: pip install -r server/requirements.txt")
    print("- If port 8000 in use: Change port or kill existing process")
    print("- If database errors: Run 'cd server && python init_db.py'")
    print()

if __name__ == "__main__":
    main()
