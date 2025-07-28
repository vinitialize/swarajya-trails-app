# Swarajya Trails - Google Cloud Run Deployment Script (PowerShell)

param(
    [string]$ProjectId = $env:PROJECT_ID,
    [string]$Region = "us-central1"
)

# Configuration
$ServiceName = "swarajya-trails"
$ImageName = "gcr.io/$ProjectId/$ServiceName"

Write-Host "🚀 Deploying Swarajya Trails to Google Cloud Run" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Check if PROJECT_ID is set
if (-not $ProjectId) {
    Write-Host "❌ Error: PROJECT_ID is not set" -ForegroundColor Red
    Write-Host "Please set your Google Cloud Project ID:" -ForegroundColor Yellow
    Write-Host "`$env:PROJECT_ID = 'your-project-id'" -ForegroundColor Yellow
    Write-Host "Or run: .\deploy.ps1 -ProjectId 'your-project-id'" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Project ID: $ProjectId" -ForegroundColor Yellow
Write-Host "🌍 Region: $Region" -ForegroundColor Yellow
Write-Host "🐳 Image: $ImageName" -ForegroundColor Yellow
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "❌ Error: gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Please install the Google Cloud CLI: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
try {
    $authList = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $authList -or $authList.Trim() -eq "") {
        Write-Host "❌ Error: You are not authenticated with gcloud" -ForegroundColor Red
        Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Authenticated as: $($authList.Split([Environment]::NewLine)[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking authentication: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "🔧 Setting project..." -ForegroundColor Blue
gcloud config set project $ProjectId

# Enable required APIs
Write-Host "🔌 Enabling required APIs..." -ForegroundColor Blue
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Check if GEMINI_API_KEY secret exists
Write-Host "🔐 Checking for Gemini API key secret..." -ForegroundColor Blue
try {
    $secretCheck = gcloud secrets describe gemini-api-key --format="value(name)" 2>$null
    if (-not $secretCheck) {
        Write-Host "⚠️  Gemini API key secret not found" -ForegroundColor Yellow
        Write-Host "Please create the secret with your Gemini API key:" -ForegroundColor Yellow
        Write-Host "echo 'YOUR_GEMINI_API_KEY' | gcloud secrets create gemini-api-key --data-file=-" -ForegroundColor Cyan
        Write-Host ""
        $response = Read-Host "Have you created the secret? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "❌ Deployment cancelled" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Gemini API key secret found" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking secret: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Build and push the container image using Cloud Build configuration
Write-Host "🏗️  Building container image..." -ForegroundColor Blue
try {
    if (Test-Path "cloudbuild.yaml") {
        Write-Host "Using cloudbuild.yaml configuration..." -ForegroundColor Yellow
        $buildResult = gcloud builds submit --config=cloudbuild.yaml 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed: $buildResult" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Using direct image build..." -ForegroundColor Yellow
        $buildResult = gcloud builds submit --tag $ImageName 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed: $buildResult" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error during build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update the service configuration with the correct PROJECT_ID
Write-Host "📝 Updating service configuration..." -ForegroundColor Blue
$serviceConfig = Get-Content cloud-run-service.yaml -Raw
$updatedConfig = $serviceConfig -replace "PROJECT_ID", $ProjectId
$updatedConfig | Out-File -FilePath cloud-run-service-updated.yaml -Encoding UTF8

# Deploy to Cloud Run
Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Blue
gcloud run services replace cloud-run-service-updated.yaml --region=$Region

# Make the service publicly accessible
Write-Host "🌐 Making service publicly accessible..." -ForegroundColor Blue
gcloud run services add-iam-policy-binding $ServiceName `
    --member="allUsers" `
    --role="roles/run.invoker" `
    --region=$Region

# Get the service URL
$ServiceUrl = gcloud run services describe $ServiceName --region=$Region --format="value(status.url)"

# Clean up temporary file
Remove-Item cloud-run-service-updated.yaml -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌍 Your app is available at: $ServiceUrl" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 To view logs:" -ForegroundColor Blue
Write-Host "gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$ServiceName' --limit=50 --project=$ProjectId" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 To manage your service:" -ForegroundColor Blue
Write-Host "https://console.cloud.google.com/run/detail/$Region/$ServiceName/metrics?project=$ProjectId" -ForegroundColor Cyan
