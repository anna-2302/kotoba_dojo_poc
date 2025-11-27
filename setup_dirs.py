import os
from pathlib import Path

# Create directory structure
base = Path(r"c:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc")

dirs = [
    "server/app/api",
    "server/app/models",
    "server/app/schemas", 
    "server/app/services",
    "server/app/db",
    "server/app/core",
    "server/tests",
]

for d in dirs:
    path = base / d
    path.mkdir(parents=True, exist_ok=True)
    # Create __init__.py for Python packages
    if not d.startswith("server/tests"):
        (path / "__init__.py").touch()
    print(f"Created: {path}")

print("\nDirectory structure created successfully!")
