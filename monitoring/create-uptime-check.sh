#!/bin/bash

# Script to create Google Cloud Monitoring Uptime Check for Swarajya Trails
# Make sure you have gcloud CLI installed and authenticated

# Configuration - Update these variables
PROJECT_ID="astute-buttress-463406-b8"
SERVICE_NAME="swarajya-trails"
REGION="us-central1"
NOTIFICATION_EMAIL="vinitbamhane95@gmail.com"

# Get Cloud Run service URL
echo "Getting Cloud Run service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format="value(status.url)")

if [ -z "$SERVICE_URL" ]; then
  echo "Error: Could not find Cloud Run service $SERVICE_NAME in region $REGION"
  exit 1
fi

SERVICE_HOST=$(echo $SERVICE_URL | sed 's|https://||' | sed 's|http://||')
echo "Found service at: $SERVICE_URL"

# Create uptime check
echo "Creating uptime check..."
gcloud alpha monitoring uptime create \
  --project=$PROJECT_ID \
  --uptime-check-display-name="Swarajya Trails Uptime Check" \
  --http-check-path="/health" \
  --hostname=$SERVICE_HOST \
  --use-ssl \
  --timeout=10s \
  --period=60s \
  --regions=us-central1-a,us-west1-a,europe-west1-a

# Create notification channel (email)
echo "Creating notification channel..."
NOTIFICATION_CHANNEL=$(gcloud alpha monitoring channels create \
  --project=$PROJECT_ID \
  --display-name="Email Alerts" \
  --type=email \
  --channel-labels=email_address=$NOTIFICATION_EMAIL \
  --format="value(name)")

echo "Created notification channel: $NOTIFICATION_CHANNEL"

# Create alerting policy
echo "Creating alerting policy..."
cat > /tmp/uptime-alert-policy.json << EOF
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
EOF

gcloud alpha monitoring policies create \
  --project=$PROJECT_ID \
  --policy-from-file=/tmp/uptime-alert-policy.json

echo "✅ Uptime monitoring setup complete!"
echo "📧 You'll receive email alerts at: $NOTIFICATION_EMAIL"
echo "🔗 Check your monitoring dashboard at: https://console.cloud.google.com/monitoring/uptime"

# Clean up temp file
rm /tmp/uptime-alert-policy.json
