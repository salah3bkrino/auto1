#!/bin/bash

# AutomationService - Production Deployment Script
# This script sets up and deploys the complete WhatsApp automation SaaS platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="automationservice.com"
EMAIL="admin@automationservice.com"
PROJECT_NAME="automation-service"

echo -e "${BLUE}🚀 Starting AutomationService Deployment${NC}"
echo "=================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check available memory
    MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$MEMORY" -lt 2048 ]; then
        print_warning "System has less than 2GB of available memory. Performance may be affected."
    fi
    
    # Check disk space
    DISK=$(df / | awk 'NR==2{printf "%.0f", $4}')
    if [ "$DISK" -lt 10485760 ]; then
        print_warning "System has less than 10GB of available disk space."
    fi
    
    print_status "System requirements check completed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p nginx/ssl
    mkdir -p nginx/logs
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p database/backups
    
    # Set proper permissions
    chmod 755 nginx/ssl
    chmod 755 nginx/logs
    chmod 755 backend/uploads
    chmod 755 backend/logs
    chmod 755 database/backups
    
    print_status "Directories created successfully"
}

# Generate SSL certificates (self-signed for development)
generate_ssl() {
    print_status "Generating SSL certificates..."
    
    if [ ! -f "nginx/ssl/cert.pem" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=SA/ST=Riyadh/L=Riyadh/O=AutomationService/CN=automationservice" \
            -addext "subjectAltName=DNS:automationservice.com,DNS:www.automationservice.com"
    
        print_status "Self-signed SSL certificates generated"
        print_warning "For production, use certificates from Let's Encrypt or your CA"
    else
        print_status "SSL certificates already exist"
    fi
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        cp backend/.env.example .env
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -base64 32)
        STRIPE_WEBHOOK_SECRET=$(openssl rand -base64 32)
        
        print_status "Generated random secrets"
        print_warning "Please update the .env file with your actual configuration:"
        echo "- META_APP_ID: Your Meta App ID"
        echo "- META_APP_SECRET: Your Meta App Secret"
        echo "- STRIPE_SECRET_KEY: Your Stripe Secret Key"
        echo "- STRIPE_PUBLISHABLE_KEY: Your Stripe Publishable Key"
        echo "- DOMAIN: $DOMAIN"
        echo "- EMAIL: $EMAIL"
    else
        print_status "Environment file already exists"
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Pull latest images
    docker-compose pull
    
    # Build custom images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    print_status "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec postgres pg_isready -U automation_user -d automation_service; do
        echo -n "."
        sleep 2
    done
    echo " ✓ PostgreSQL is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec redis redis-cli ping > /dev/null; do
        echo -n "."
        sleep 2
    done
    echo " ✓ Redis is ready"
    
    # Wait for Backend
    print_status "Waiting for Backend API..."
    until curl -f http://localhost:3000/health > /dev/null 2>&1; do
        echo -n "."
        sleep 5
    done
    echo " ✓ Backend API is ready"
    
    # Wait for Frontend
    print_status "Waiting for Frontend..."
    until curl -f http://localhost:3001 > /dev/null 2>&1; do
        echo -n "."
        sleep 5
    done
    echo " ✓ Frontend is ready"
    
    # Wait for n8n
    print_status "Waiting for n8n..."
    until curl -f http://localhost:5678 > /dev/null 2>&1; do
        echo -n "."
        sleep 5
    done
    echo " ✓ n8n is ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    docker-compose exec backend npx prisma migrate deploy
    docker-compose exec backend npx prisma generate
    
    print_status "Database migrations completed"
}

# Seed initial data
seed_data() {
    print_status "Seeding initial data for AutomationService..."
    
    docker-compose exec backend node src/scripts/seed.js
    
    print_status "Initial data seeding completed"
}

# Display deployment summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 AutomationService Deployment Complete!${NC}"
    echo "=================================="
    echo ""
    echo "🌐 Access your AutomationService platform:"
    echo "   Frontend: https://$DOMAIN"
    echo "   Backend API: https://$DOMAIN/api"
    echo "   n8n Dashboard: https://$DOMAIN:5678"
    echo ""
    echo "👤 Demo Account:"
    echo "   Email: demo@automationservice.com"
    echo "   Password: demo123"
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose logs -f [service]"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Update services: docker-compose pull && docker-compose up -d"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Configure your Meta Business Account"
    echo "   2. Set up your Stripe account"
    echo "   3. Update your DNS to point to this server"
    echo "   4. Set up production SSL certificates"
    echo "   5. Start marketing your AutomationService!"
    echo ""
    echo -e "${BLUE}🚀 Welcome to AutomationService!${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 AutomationService Deployment Script${NC}"
    echo "=================================="
    
    check_docker
    check_requirements
    create_directories
    generate_ssl
    setup_environment
    deploy_services
    wait_for_services
    run_migrations
    seed_data
    display_summary
}

# Handle script interruption
trap 'print_error "Deployment interrupted. Cleaning up..."; docker-compose down; exit 1' INT

# Run main function
main "$@"