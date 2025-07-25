# Swarajya Trails - Custom Domain Setup Script
param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    [string]$ProjectId = "astute-buttress-463406-b8",
    [string]$ServiceName = "swarajya-trails",
    [string]$Region = "us-central1"
)

Write-Host "🌐 Setting up custom domain for Swarajya Trails" -ForegroundColor Blue
Write-Host "=================================================" -ForegroundColor Blue

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Domain: $Domain" -ForegroundColor Yellow
Write-Host "   Service: $ServiceName" -ForegroundColor Yellow
Write-Host "   Region: $Region" -ForegroundColor Yellow
Write-Host "   Project: $ProjectId" -ForegroundColor Yellow
Write-Host ""

# Validate domain format
if ($Domain -notmatch '^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$') {
    Write-Host "❌ Error: Invalid domain format: $Domain" -ForegroundColor Red
    Write-Host "Please provide a valid domain like: swarajya-trails.publicvm.com" -ForegroundColor Yellow
    exit 1
}

# Check if gcloud is available
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "❌ Error: gcloud CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Google Cloud CLI: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Set the project
Write-Host "🔧 Setting project..." -ForegroundColor Blue
gcloud config set project $ProjectId

# Check if service exists
Write-Host "🔍 Verifying Cloud Run service..." -ForegroundColor Blue
$serviceExists = gcloud run services describe $ServiceName --region=$Region --format="value(metadata.name)" 2>$null
if (-not $serviceExists) {
    Write-Host "❌ Error: Cloud Run service '$ServiceName' not found in region '$Region'" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Service found: $ServiceName" -ForegroundColor Green

# Install beta components if needed
Write-Host "🔧 Checking beta components..." -ForegroundColor Blue
$betaInstalled = gcloud components list --filter="id:beta" --format="value(state.name)" --quiet 2>$null
if ($betaInstalled -ne "Installed") {
    Write-Host "📦 Installing beta components..." -ForegroundColor Yellow
    gcloud components install beta --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install beta components" -ForegroundColor Red
        exit 1
    }
}

# Create domain mapping
Write-Host "🌐 Creating domain mapping..." -ForegroundColor Blue
try {
    $result = gcloud beta run domain-mappings create --service=$ServiceName --domain=$Domain --region=$Region 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error creating domain mapping:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Yellow
        
        # Check if domain mapping already exists
        $existingMapping = gcloud beta run domain-mappings describe $Domain --region=$Region --format="value(metadata.name)" 2>$null
        if ($existingMapping) {
            Write-Host "⚠️  Domain mapping already exists for: $Domain" -ForegroundColor Yellow
        } else {
            exit 1
        }
    } else {
        Write-Host "✅ Domain mapping created successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

# Get DNS records
Write-Host "📋 Getting DNS configuration..." -ForegroundColor Blue
Write-Host ""
Write-Host "🔧 DNS Records to configure at FreeDomain.one:" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

try {
    $dnsInfo = gcloud beta run domain-mappings describe $Domain --region=$Region --format="json" | ConvertFrom-Json
    
    Write-Host "Domain: $Domain" -ForegroundColor White
    Write-Host ""
    
    if ($dnsInfo.status.resourceRecords) {
        foreach ($record in $dnsInfo.status.resourceRecords) {
            Write-Host "Type: $($record.type)" -ForegroundColor Yellow
            Write-Host "Name: $($record.name)" -ForegroundColor Yellow
            Write-Host "Value: $($record.rrdata)" -ForegroundColor Yellow
            Write-Host "TTL: 300 (5 minutes)" -ForegroundColor Yellow
            Write-Host ""
        }
    } else {
        Write-Host "Type: CNAME" -ForegroundColor Yellow
        Write-Host "Name: @ (or your subdomain)" -ForegroundColor Yellow
        Write-Host "Value: ghs.googlehosted.com" -ForegroundColor Yellow
        Write-Host "TTL: 300 (5 minutes)" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host "⚠️  Could not retrieve DNS records. Using default CNAME configuration:" -ForegroundColor Yellow
    Write-Host "Type: CNAME" -ForegroundColor Yellow
    Write-Host "Name: @ (for root domain)" -ForegroundColor Yellow
    Write-Host "Value: ghs.googlehosted.com" -ForegroundColor Yellow
    Write-Host "TTL: 300" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📝 Next Steps:" -ForegroundColor Green
Write-Host "1. Log into your FreeDomain.one account" -ForegroundColor White
Write-Host "2. Go to DNS Management for domain: $Domain" -ForegroundColor White
Write-Host "3. Add the DNS records shown above" -ForegroundColor White
Write-Host "4. Wait 24-48 hours for DNS propagation" -ForegroundColor White
Write-Host "5. Test your domain: https://$Domain" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Verification Commands:" -ForegroundColor Green
Write-Host "nslookup $Domain" -ForegroundColor Cyan
Write-Host "curl -I https://$Domain" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Monitor domain mapping status:" -ForegroundColor Green
Write-Host "gcloud run domain-mappings describe $Domain --region=$Region" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Domain mapping setup completed!" -ForegroundColor Green
Write-Host "Your Swarajya Trails app will be accessible at: https://$Domain" -ForegroundColor Green
Write-Host "once DNS propagation is complete." -ForegroundColor Green
