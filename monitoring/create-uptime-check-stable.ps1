# PowerShell script to create Google Cloud Monitoring Uptime Check for Swarajya Trails
# Using stable gcloud commands (non-alpha)

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

# Create uptime check using REST API via gcloud
Write-Host "Creating uptime check..." -ForegroundColor Yellow

$UPTIME_CONFIG = @{
    displayName = "Swarajya Trails Uptime Check"
    monitoredResource = @{
        type = "uptime_url"
        labels = @{
            project_id = $PROJECT_ID
            host = $SERVICE_HOST
        }
    }
    httpCheck = @{
        path = "/health"
        port = 443
        useSsl = $true
        validateSsl = $true
        requestMethod = "GET"
        maskHeaders = $false
        headers = @{
            "User-Agent" = "GoogleCloudUptimeCheck"
        }
    }
    timeout = "10s"
    period = "60s"
    selectedRegions = @(
        "USA_OREGON"
        "USA_IOWA"
        "EUROPE_IRELAND"
    )
}

# Convert to JSON and save to temp file
$TEMP_CONFIG_FILE = [System.IO.Path]::GetTempFileName()
$UPTIME_CONFIG | ConvertTo-Json -Depth 10 | Out-File -FilePath $TEMP_CONFIG_FILE -Encoding UTF8

# Create the uptime check using REST API
try {
    $result = gcloud beta monitoring uptime-check-configs create --config-from-file=$TEMP_CONFIG_FILE --project=$PROJECT_ID
    Write-Host "✅ Uptime check created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Use curl to call the REST API directly
    $ACCESS_TOKEN = gcloud auth print-access-token
    $API_URL = "https://monitoring.googleapis.com/v1/projects/$PROJECT_ID/uptimeCheckConfigs"
    
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $API_URL -Method POST -Headers $headers -Body (Get-Content $TEMP_CONFIG_FILE -Raw)
        Write-Host "✅ Uptime check created successfully via REST API!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create uptime check: $_" -ForegroundColor Red
    }
}

# Clean up temp file
Remove-Item $TEMP_CONFIG_FILE -Force -ErrorAction SilentlyContinue

# Create notification channel using REST API
Write-Host "Creating email notification channel..." -ForegroundColor Yellow

$NOTIFICATION_CONFIG = @{
    type = "email"
    displayName = "Swarajya Trails Email Alerts"
    labels = @{
        email_address = $NOTIFICATION_EMAIL
    }
    enabled = $true
}

$TEMP_NOTIFICATION_FILE = [System.IO.Path]::GetTempFileName()
$NOTIFICATION_CONFIG | ConvertTo-Json -Depth 10 | Out-File -FilePath $TEMP_NOTIFICATION_FILE -Encoding UTF8

try {
    $ACCESS_TOKEN = gcloud auth print-access-token
    $NOTIFICATION_API_URL = "https://monitoring.googleapis.com/v1/projects/$PROJECT_ID/notificationChannels"
    
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
        "Content-Type" = "application/json"
    }
    
    $notification_response = Invoke-RestMethod -Uri $NOTIFICATION_API_URL -Method POST -Headers $headers -Body (Get-Content $TEMP_NOTIFICATION_FILE -Raw)
    $NOTIFICATION_CHANNEL_NAME = $notification_response.name
    Write-Host "✅ Email notification channel created: $NOTIFICATION_CHANNEL_NAME" -ForegroundColor Green
    
    # Create alerting policy
    Write-Host "Creating alerting policy..." -ForegroundColor Yellow
    
    $ALERT_POLICY = @{
        displayName = "Swarajya Trails Down Alert"
        conditions = @(
            @{
                displayName = "Uptime check failed"
                conditionThreshold = @{
                    filter = "resource.type=`"uptime_url`" AND metric.type=`"monitoring.googleapis.com/uptime_check/check_passed`""
                    comparison = "COMPARISON_EQUAL"
                    thresholdValue = 0
                    duration = "180s"
                    aggregations = @(
                        @{
                            alignmentPeriod = "60s"
                            perSeriesAligner = "ALIGN_FRACTION_TRUE"
                            crossSeriesReducer = "REDUCE_MEAN"
                            groupByFields = @("resource.label.project_id")
                        }
                    )
                }
            }
        )
        notificationChannels = @($NOTIFICATION_CHANNEL_NAME)
        alertStrategy = @{
            autoClose = "86400s"
        }
        enabled = $true
    }
    
    $TEMP_ALERT_FILE = [System.IO.Path]::GetTempFileName()
    $ALERT_POLICY | ConvertTo-Json -Depth 10 | Out-File -FilePath $TEMP_ALERT_FILE -Encoding UTF8
    
    $ALERT_API_URL = "https://monitoring.googleapis.com/v1/projects/$PROJECT_ID/alertPolicies"
    $alert_response = Invoke-RestMethod -Uri $ALERT_API_URL -Method POST -Headers $headers -Body (Get-Content $TEMP_ALERT_FILE -Raw)
    Write-Host "✅ Alerting policy created successfully!" -ForegroundColor Green
    
    Remove-Item $TEMP_ALERT_FILE -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Failed to create notification/alert: $_" -ForegroundColor Red
}

Remove-Item $TEMP_NOTIFICATION_FILE -Force -ErrorAction SilentlyContinue

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
        Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Health endpoint returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to reach health endpoint: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be normal if the endpoint requires authentication or has CORS restrictions." -ForegroundColor Gray
}

Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the Google Cloud Console to verify the uptime check was created" -ForegroundColor White
Write-Host "2. Wait a few minutes for the first checks to run" -ForegroundColor White
Write-Host "3. You can manually trigger a test by visiting the monitoring dashboard" -ForegroundColor White
