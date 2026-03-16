# HanapAI Setup Script (Windows PowerShell)
# Run: .\scripts\setup.ps1

Write-Host "=== HanapAI Setup ===" -ForegroundColor Cyan

# Install root dependencies
Write-Host "[1/4] Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install backend dependencies
Write-Host "[2/4] Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
Pop-Location

# Install web dependencies
Write-Host "[3/4] Installing web dependencies..." -ForegroundColor Yellow
Push-Location web
npm install
Pop-Location

# Setup Python AI services
Write-Host "[4/4] Setting up AI services..." -ForegroundColor Yellow
Push-Location ai-services
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Pop-Location

# Copy .env examples
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "Created backend\.env - please update with your credentials" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "Next steps:"
Write-Host "  1. Update backend\.env with your MongoDB URI, OpenAI key, etc."
Write-Host "  2. Run 'npm run dev' to start backend + web"
Write-Host "  3. For AI services: cd ai-services; uvicorn main:app --reload --port 8000"
Write-Host "  4. For mobile: cd mobile; npx expo start"
