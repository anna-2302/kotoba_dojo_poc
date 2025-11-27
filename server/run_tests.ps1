# Run tests with clean database
# Usage: .\run_tests.ps1

# Remove stale test database
if (Test-Path "test_settings.db") {
    Remove-Item "test_settings.db" -Force
    Write-Host "Removed stale test database" -ForegroundColor Yellow
}

# Run tests
Write-Host "Running tests..." -ForegroundColor Green
python -m pytest tests/test_api_settings.py -v --tb=short
