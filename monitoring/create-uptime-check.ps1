# PowerShell script to create Google Cloud Monitoring Uptime Check for Swarajya Trails
# Make sure you have gcloud CLI installed and authenticated

# Configuration
$PROJECT_ID = "astute-buttress-463406-b8"
$SERVICE_NAME = "swarajya-trails"
$REGION = "us-central1"
$NOTIFICATION_EMAIL = "vinitbamhane95@gmail.com"

Write-Host "🚀 Setting up uptime monitoring for Swarajya Trails..." -ForegroundColor Green

# Get Cloud Run service URL
Write-Host "Getting Cloud Run service URL..." -ForegroundColor Yellow
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)"

if (-not $SERVICE_URL) {
    Write-Host "❌ Error: Could not find Cloud Run service $SERVICE_NAME in region $REGION" -ForegroundColor Red
    exit 1
}

$SERVICE_HOST = $SERVICE_URL -replace "https://", "" -replace "http://", ""
Write-Host "✅ Found service at: $SERVICE_URL" -ForegroundColor Green

# Check if uptime check already exists
Write-Host "Checking for existing uptime checks..." -ForegroundColor Yellow
$EXISTING_CHECKS = gcloud alpha monitoring uptime list --project=$PROJECT_ID --format="value(displayName)" | Where-Object { $_ -like "*Swarajya Trails*" }

if ($EXISTING_CHECKS) {
    Write-Host "⚠️  Found existing uptime check. Skipping creation." -ForegroundColor Yellow
} else {
    # Create uptime check
    Write-Host "Creating uptime check..." -ForegroundColor Yellow
    gcloud alpha monitoring uptime create `
        --project=$PROJECT_ID `
        --uptime-check-display-name="Swarajya Trails Uptime Check" `
        --http-check-path="/health" `
        --hostname=$SERVICE_HOST `
        --use-ssl `
        --timeout=10s `
        --period=60s `
        --regions=us-central1-a,us-west1-a,europe-west1-a
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Uptime check created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create uptime check" -ForegroundColor Red
        exit 1
    }
}

# Check if notification channel already exists
Write-Host "Checking for existing notification channels..." -ForegroundColor Yellow
$EXISTING_CHANNELS = gcloud alpha monitoring channels list --project=$PROJECT_ID --format="value(displayName)" | Where-Object { $_ -eq "Email Alerts" }

if ($EXISTING_CHANNELS) {
    Write-Host "⚠️  Found existing email notification channel. Skipping creation." -ForegroundColor Yellow
    $NOTIFICATION_CHANNEL = gcloud alpha monitoring channels list --project=$PROJECT_ID --filter="displayName='Email Alerts'" --format="value(name)" | Select-Object -First 1
} else {
    # Create notification channel (email)
    Write-Host "Creating notification channel..." -ForegroundColor Yellow
    $NOTIFICATION_CHANNEL = gcloud alpha monitoring channels create `
        --project=$PROJECT_ID `
        --display-name="Email Alerts" `
        --type=email `
        --channel-labels=email_address=$NOTIFICATION_EMAIL `
        --format="value(name)"
    
    if ($NOTIFICATION_CHANNEL) {
        Write-Host "✅ Created notification channel: $NOTIFICATION_CHANNEL" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create notification channel" -ForegroundColor Red
        exit 1
    }
}

# Check if alerting policy already exists
Write-Host "Checking for existing alerting policies..." -ForegroundColor Yellow
$EXISTING_POLICIES = gcloud alpha monitoring policies list --project=$PROJECT_ID --format="value(displayName)" | Where-Object { $_ -eq "Swarajya Trails Down Alert" }

if ($EXISTING_POLICIES) {
    Write-Host "⚠️  Found existing alerting policy. Skipping creation." -ForegroundColor Yellow
} else {
    # Create alerting policy
    Write-Host "Creating alerting policy..." -ForegroundColor Yellow
    
    $TEMP_POLICY_FILE = [System.IO.Path]::GetTempFileName()
    
    $POLICY_JSON = @"
{
  "displayName": "Swarajya Trails Down Alert",
  "conditions": [
    {
      "displayName": "Uptime check failed",
      "conditionThreshold": {
        "filter": "resource.type=\"uptime_url\" AND metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id=~\".*swarajya-trails.*\"",
        "comparison": "COMPARISON_EQUAL",
        "thresholdValue": 0,
        "duration": "180s",
        "aggregations": [
          {
            "alignmentPeriod": "60s",
            "perSeriesAligner": "ALIGN_FRACTION_TRUE",
            "crossSeriesReducer": "REDUCE_MEAN",
            "groupByFields": [
              "resource.label.project_id"
            ]
          }
        ]
      }
    }
  ],
  "notificationChannels": [
    "$NOTIFICATION_CHANNEL"
  ],
  "alertStrategy": {
    "autoClose": "86400s"
  },
  "enabled": true
}
"@
    
    $POLICY_JSON | Out-File -FilePath $TEMP_POLICY_FILE -Encoding UTF8
    
    gcloud alpha monitoring policies create --project=$PROJECT_ID --policy-from-file=$TEMP_POLICY_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Alerting policy created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create alerting policy" -ForegroundColor Red
    }
    
    # Clean up temp file
    Remove-Item $TEMP_POLICY_FILE -Force -ErrorAction SilentlyContinue
}

Write-Host "`n🎉 Uptime monitoring setup complete!" -ForegroundColor Green
Write-Host "📧 You'll receive email alerts at: $NOTIFICATION_EMAIL" -ForegroundColor Cyan
Write-Host "🔗 Check your monitoring dashboard at: https://console.cloud.google.com/monitoring/uptime?project=$PROJECT_ID" -ForegroundColor Cyan
Write-Host "📊 View alerting policies at: https://console.cloud.google.com/monitoring/alerting?project=$PROJECT_ID" -ForegroundColor Cyan

# Test the health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$SERVICE_URL/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health endpoint is responding correctly (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Health endpoint returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to reach health endpoint: $($_.Exception.Message)" -ForegroundColor Red
}
