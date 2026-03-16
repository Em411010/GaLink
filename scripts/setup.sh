#!/usr/bin/env bash
# HanapAI Setup Script
# Run: bash scripts/setup.sh

echo "=== HanapAI Setup ==="

# Install root dependencies
echo "[1/4] Installing root dependencies..."
npm install

# Install backend dependencies
echo "[2/4] Installing backend dependencies..."
cd backend && npm install && cd ..

# Install web dependencies
echo "[3/4] Installing web dependencies..."
cd web && npm install && cd ..

# Setup Python AI services
echo "[4/4] Setting up AI services..."
cd ai-services
python -m venv .venv
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
else
  source .venv/Scripts/activate
fi
pip install -r requirements.txt
cd ..

# Copy .env examples
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env — please update with your credentials"
fi

echo ""
echo "=== Setup Complete ==="
echo "Next steps:"
echo "  1. Update backend/.env with your MongoDB URI, OpenAI key, etc."
echo "  2. Run 'npm run dev' to start backend + web"
echo "  3. For AI services: cd ai-services && uvicorn main:app --reload --port 8000"
echo "  4. For mobile: cd mobile && npx expo start"
