# Fix failed migration - Run from project root with venv activated
# This script handles the case where migration 002 failed partway through

Write-Host "=== Migration 002 Fix Script ===" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in project root
if (-not (Test-Path "alembic.ini")) {
    Write-Host "ERROR: Must run from project root (where alembic.ini is located)" -ForegroundColor Red
    exit 1
}

# Check if venv is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & .\venv\Scripts\Activate.ps1
}

Write-Host "Step 1: Checking current migration state..." -ForegroundColor Green
alembic current

Write-Host ""
Write-Host "Step 2: Rolling back to revision 001..." -ForegroundColor Green
try {
    alembic downgrade 001
    Write-Host "✓ Rollback successful" -ForegroundColor Green
} catch {
    Write-Host "⚠ Rollback failed or already at 001" -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Re-applying migration 002 with fixed SQL..." -ForegroundColor Green
try {
    alembic upgrade head
    Write-Host "✓ Migration successful!" -ForegroundColor Green
} catch {
    Write-Host "✗ Migration failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual fix may be required. Check database state with:" -ForegroundColor Yellow
    Write-Host "  psql -U kotoba_user -d kotoba_dojo" -ForegroundColor Yellow
    Write-Host "  Then run: \d user_settings" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 4: Verifying final state..." -ForegroundColor Green
alembic current

Write-Host ""
Write-Host "=== Migration Fix Complete ===" -ForegroundColor Cyan
