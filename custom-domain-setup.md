# Custom Domain Setup for Swarajya Trails

This guide shows you how to map a free custom domain from freedomain.one to your Cloud Run service.

## 🌐 Current Service
- **Service URL**: https://swarajya-trails-381076047248.us-central1.run.app
- **Project**: astute-buttress-463406-b8
- **Region**: us-central1

## Option 1: Cloud Run Custom Domain Mapping (Recommended)

### Step 1: Get Your Free Domain

1. Visit **https://freedomain.one**
2. Register a free domain like:
   - `swarajya-trails.publicvm.com`
   - `swarajya-trails.run.place`
   - `swarajya-trails.linkpc.net`
   - `swarajya-trails.work.gd`

### Step 2: Create Domain Mapping in Cloud Run

```bash
# Replace 'your-domain.publicvm.com' with your actual domain
gcloud run domain-mappings create --service=swarajya-trails --domain=your-domain.publicvm.com --region=us-central1
```

### Step 3: Get DNS Records from Google

After creating the domain mapping, Google will provide DNS records:

```bash
gcloud run domain-mappings describe your-domain.publicvm.com --region=us-central1
```

This will show you the required DNS records like:
- **CNAME**: `ghs.googlehosted.com`
- **A Record**: IP addresses (if provided)

### Step 4: Configure DNS at FreeDomain.one

1. Log into your freedomain.one account
2. Go to DNS Management for your domain
3. Add the DNS records provided by Google:
   - **Type**: CNAME
   - **Host**: @ (or your subdomain)
   - **Points to**: `ghs.googlehosted.com`

### Step 5: Wait for DNS Propagation

DNS changes can take 24-48 hours to propagate worldwide.

## Option 2: Using a Load Balancer with Static IP

If you need a static IP for some reason, you can use Google Cloud Load Balancer:

### Step 1: Reserve a Static IP

```bash
gcloud compute addresses create swarajya-trails-ip --global
```

### Step 2: Get the Static IP

```bash
gcloud compute addresses describe swarajya-trails-ip --global
```

### Step 3: Create Load Balancer

```bash
# Create backend service
gcloud compute backend-services create swarajya-trails-backend --global

# Create URL map
gcloud compute url-maps create swarajya-trails-url-map --default-backend-service=swarajya-trails-backend

# Create HTTP(S) proxy
gcloud compute target-https-proxies create swarajya-trails-https-proxy --url-map=swarajya-trails-url-map

# Create forwarding rule
gcloud compute forwarding-rules create swarajya-trails-https-forwarding-rule --address=swarajya-trails-ip --target-https-proxy=swarajya-trails-https-proxy --global --ports=443
```

### Step 4: Configure DNS with Static IP

At freedomain.one, create an A record pointing to your static IP.

## Option 3: Using Cloudflare (Alternative)

1. **Sign up for Cloudflare** (free tier)
2. **Add your freedomain.one domain** to Cloudflare
3. **Change nameservers** at freedomain.one to Cloudflare's nameservers
4. **Create a CNAME record** in Cloudflare pointing to your Cloud Run URL
5. **Enable Cloudflare's proxy** (orange cloud) for additional features

## Recommended Approach

**Use Option 1** (Cloud Run Custom Domain Mapping) because:
- ✅ **Simplest setup** - no additional infrastructure needed
- ✅ **Google manages SSL certificates** automatically
- ✅ **No extra costs** - completely free
- ✅ **Automatic scaling** - benefits from Cloud Run's serverless nature
- ✅ **Built-in security** - Google's infrastructure protection

## DNS Records Summary

For freedomain.one, you'll typically need:

```
Type: CNAME
Name: @ (for root domain) or www (for subdomain)
Value: ghs.googlehosted.com
TTL: 300 (5 minutes) or 3600 (1 hour)
```

## Verification Commands

After setup, verify your domain works:

```bash
# Check DNS resolution
nslookup your-domain.publicvm.com

# Test HTTP response
curl -I https://your-domain.publicvm.com

# Check SSL certificate
curl -vI https://your-domain.publicvm.com
```

## Troubleshooting

### Common Issues:
1. **DNS not propagating**: Wait 24-48 hours
2. **SSL certificate not ready**: Google needs to verify domain ownership first
3. **404 errors**: Ensure Cloud Run service is publicly accessible

### Debug Commands:
```bash
# Check domain mapping status
gcloud run domain-mappings list --region=us-central1

# Check service status
gcloud run services describe swarajya-trails --region=us-central1

# Check IAM permissions
gcloud run services get-iam-policy swarajya-trails --region=us-central1
```

## Next Steps

1. **Get your free domain** from freedomain.one
2. **Run the domain mapping command** with your chosen domain
3. **Configure DNS records** as provided by Google
4. **Wait for propagation** and test your custom domain
5. **Update any hardcoded URLs** in your application (if any)

Your Swarajya Trails app will then be accessible at your custom domain! 🎉
