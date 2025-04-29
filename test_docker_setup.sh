#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing Docker setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install it and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ docker-compose is installed${NC}"

# Check if .env file exists
if [ ! -f "./backend/.env" ]; then
    echo -e "${RED}❌ backend/.env file is missing. Please create it with your DeepSeek API key.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env file exists${NC}"

# Build and start containers
echo "Building and starting containers..."
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check backend health
echo "Checking backend health..."
if curl -s http://localhost:8000/ | grep -q "Welcome to the Todo API"; then
    echo -e "${GREEN}✅ Backend is running and responding correctly${NC}"
else
    echo -e "${RED}❌ Backend is not responding correctly${NC}"
    docker-compose logs backend
    exit 1
fi

# Check frontend health
echo "Checking frontend health..."
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    docker-compose logs frontend
    exit 1
fi

echo -e "${GREEN}All tests passed! Your Docker setup is working correctly.${NC}"
echo "You can access the application at:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:8000" 