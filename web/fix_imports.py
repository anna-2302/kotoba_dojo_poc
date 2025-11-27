#!/usr/bin/env python3
"""
Vite Module Import Fix Script

This script helps diagnose and fix Vite module import issues on Windows, macOS, and Linux.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path


def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 50)
    print(f"  {text}")
    print("=" * 50)


def print_step(number, text):
    """Print a formatted step"""
    print(f"\n[Step {number}] {text}")


def print_success(text):
    """Print a success message"""
    print(f"  ✓ {text}")


def print_error(text):
    """Print an error message"""
    print(f"  ✗ {text}")


def remove_directory(path):
    """Safely remove a directory"""
    try:
        if os.path.exists(path):
            shutil.rmtree(path)
            return True
    except Exception as e:
        print_error(f"Failed to remove {path}: {e}")
        return False
    return False


def remove_file(path):
    """Safely remove a file"""
    try:
        if os.path.exists(path):
            os.remove(path)
            return True
    except Exception as e:
        print_error(f"Failed to remove {path}: {e}")
        return False
    return False


def check_file_exists(path):
    """Check if a file exists and has content"""
    if not os.path.exists(path):
        return False, "File does not exist"
    
    size = os.path.getsize(path)
    if size == 0:
        return False, "File is empty"
    
    return True, f"File exists ({size} bytes)"


def check_exports(file_path):
    """Check if client.ts has expected exports"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        exports = []
        required = ['export interface Card', 'export const apiClient', 'export const cardsApi']
        
        for export in required:
            if export in content:
                exports.append((export, True))
            else:
                exports.append((export, False))
        
        return exports
    except Exception as e:
        print_error(f"Could not read file: {e}")
        return []


def run_command(cmd, description):
    """Run a command and return success/failure"""
    try:
        print(f"  Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print_success(description)
            return True
        else:
            print_error(f"{description} (exit code: {result.returncode})")
            if result.stderr:
                print(f"    Error: {result.stderr[:200]}")
            return False
    except Exception as e:
        print_error(f"Failed to run command: {e}")
        return False


def main():
    """Main fix process"""
    print_header("Vite Module Import Issue - Diagnostic & Fix Tool")
    
    # Change to web directory
    script_dir = Path(__file__).parent
    web_dir = script_dir / "web" if (script_dir / "web").exists() else script_dir
    
    print(f"\nWorking directory: {web_dir}")
    os.chdir(web_dir)
    
    # Step 1: Verify client.ts exists and has exports
    print_step(1, "Checking client.ts file")
    client_ts = web_dir / "src" / "api" / "client.ts"
    
    exists, message = check_file_exists(str(client_ts))
    print(f"  {message}")
    
    if not exists:
        print_error("client.ts not found or is empty!")
        return 1
    
    exports = check_exports(str(client_ts))
    for export, found in exports:
        if found:
            print_success(f"Found: {export}")
        else:
            print_error(f"Missing: {export}")
    
    # Step 2: Remove Vite caches
    print_step(2, "Removing Vite cache directories")
    
    cache_dirs = [
        '.vite',
        'dist',
        'node_modules/.vite',
        'node_modules/.tmp',
        'node_modules/.cache',
    ]
    
    for cache_dir in cache_dirs:
        if remove_directory(cache_dir):
            print_success(f"Removed {cache_dir}")
    
    # Step 3: Clear TypeScript build info
    print_step(3, "Clearing TypeScript build cache")
    
    ts_files = [
        'tsconfig.app.tsbuildinfo',
        'node_modules/.tsbuildinfo',
    ]
    
    for ts_file in ts_files:
        if remove_file(ts_file):
            print_success(f"Removed {ts_file}")
    
    # Step 4: Reinstall dependencies
    print_step(4, "Reinstalling npm dependencies")
    
    if not run_command(['npm', 'install'], 'npm install completed'):
        print_error("npm install failed - you may need to run it manually")
    
    print_header("✓ Cleanup Complete!")
    print("""
Next Steps:
1. Start the dev server:
   npm run dev

2. Hard refresh your browser:
   - Windows/Linux: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

3. If the issue persists:
   - Check browser console for detailed errors
   - Verify your backend API is running on http://localhost:8000
   - Try restarting the dev server

For more information, see: VITE_IMPORT_FIX.md
    """)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
