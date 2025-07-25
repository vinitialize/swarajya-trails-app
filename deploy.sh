#!/bin/bash

# Swarajya Trails - Google Cloud Run Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="swarajya-trails"
REGION="us-central1"  # Change this to your preferred region
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo -e "${BLUE}🚀 Deploying Swarajya Trails to Google Cloud Run${NC}"
echo "=================================================="

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: PROJECT_ID environment variable is not set${NC}"
    echo "Please set your Google Cloud Project ID:"
    echo "export PROJECT_ID=your-project-id"
    exit 1
fi

echo -e "${YELLOW}📋 Project ID: $PROJECT_ID${NC}"
echo -e "${YELLOW}🌍 Region: $REGION${NC}"
echo -e "${YELLOW}🐳 Image: $IMAGE_NAME${NC}"
echo

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Error: You are not authenticated with gcloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set the project
echo -e "${BLUE}🔧 Setting project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Check if GEMINI_API_KEY secret exists, if not create it
echo -e "${BLUE}🔐 Checking for Gemini API key secret...${NC}"
if ! gcloud secrets describe gemini-api-key &> /dev/null; then
    echo -e "${YELLOW}⚠️  Gemini API key secret not found${NC}"
    echo "Please create the secret with your Gemini API key:"
    echo "echo 'YOUR_GEMINI_API_KEY' | gcloud secrets create gemini-api-key --data-file=-"
    echo
    read -p "Have you created the secret? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Gemini API key secret found${NC}"
fi

# Build and push the container image
echo -e "${BLUE}🏗️  Building container image...${NC}"
gcloud builds submit --tag $IMAGE_NAME

# Update the service configuration with the correct PROJECT_ID
echo -e "${BLUE}📝 Updating service configuration...${NC}"
sed "s/PROJECT_ID/$PROJECT_ID/g" cloud-run-service.yaml > cloud-run-service-updated.yaml

# Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
gcloud run services replace cloud-run-service-updated.yaml --region=$REGION

# Make the service publicly accessible
echo -e "${BLUE}🌐 Making service publicly accessible...${NC}"
gcloud run services add-iam-policy-binding $SERVICE_NAME \
    --member="allUsers" \
    --role="roles/run.invoker" \
    --region=$REGION

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

# Clean up temporary file
rm -f cloud-run-service-updated.yaml

echo
echo "=================================================="
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌍 Your app is available at: $SERVICE_URL${NC}"
echo "=================================================="
echo
echo -e "${BLUE}📊 To view logs:${NC}"
echo "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50 --project=$PROJECT_ID"
echo
echo -e "${BLUE}🔧 To manage your service:${NC}"
echo "https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID"
