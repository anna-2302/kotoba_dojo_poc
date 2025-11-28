# Navigate to server directory and start uvicorn with venv python
Set-Location -Path "c:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc\server"
& "c:\Users\AnnaKhoziasheva\Desktop\python\kotoba_dojo_poc\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
