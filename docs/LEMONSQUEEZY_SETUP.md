# Lemon Squeezy Payment Integration Setup

## Prerequisites

1. **Lemon Squeezy Account**: Sign up at https://lemonsqueezy.com
2. **Supabase Project**: Already configured for TrendHawk

## Step 1: Set Up Lemon Squeezy Store

### Create Your Store
1. Log in to Lemon Squeezy dashboard
2. Create a new store or use an existing one
3. Enable **Test Mode** for development

### Create Products

Create two subscription products:

**Basic Plan**
- Name: TrendHawk Basic
- Price: $10/month
- Description: Great for casual sellers

**Pro Plan**
- Name: TrendHawk Pro
- Price: $30/month
- Description: For serious product researchers

### Get Product Variant IDs
1. Go to each product in your Lemon Squeezy dashboard
2. Click on the variant (usually "Default")
3. Copy the Variant ID from the URL (e.g., `123456`)

## Step 2: Get API Credentials

### API Key
1. Go to Settings → API: https://app.lemonsqueezy.com/settings/api
2. Click "Create API Key"
3. Give it a name (e.g., "TrendHawk Production")
4. Copy the API key (starts with `lemon_`)

### Store ID
1. Go to Settings → Stores
2. Copy your Store ID

### Webhook Secret
1. Go to Settings → Webhooks
2. Create a new webhook endpoint
3. URL: `https://your-domain.com/api/webhooks/lemonsqueezy`
4. Select events:
   - `order_created`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
5. Copy the Signing Secret

## Step 3: Configure Environment Variables

Update your `.env.local` file:

```bash
# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Change to your production URL

# Lemon Squeezy
LEMONSQUEEZY_API_KEY="lemon_your_api_key_here"
LEMONSQUEEZY_STORE_ID="12345"
LEMONSQUEEZY_WEBHOOK_SECRET="your_webhook_secret_here"

# Product Variant IDs
NEXT_PUBLIC_LEMONSQUEEZY_BASIC_VARIANT_ID="123456"
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID="789012"
```

## Step 4: Test the Integration

### Local Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test checkout flow**:
   - Navigate to http://localhost:3000/pricing
   - Click "Upgrade to Pro"
   - You should be redirected to Lemon Squeezy checkout

3. **Test webhook locally** (using ngrok):
   ```bash
   # Install ngrok if you haven't
   npm install -g ngrok
   
   # Expose your local server
   ngrok http 3000
   
   # Update webhook URL in Lemon Squeezy to:
   # https://your-ngrok-url.ngrok.io/api/webhooks/lemonsqueezy
   ```

4. **Complete a test payment**:
   - Use Lemon Squeezy test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC

5. **Verify subscription activation**:
   - Check Supabase user metadata for subscription info
   - User should have access to premium features

## Step 5: Production Deployment

### Update Environment Variables

In your production environment (Vercel, Netlify, etc.):

1. Set `NEXT_PUBLIC_APP_URL` to your production URL
2. Use production API keys from Lemon Squeezy
3. Update webhook URL to production domain

### Disable Test Mode

1. Go to Lemon Squeezy Settings
2. Disable Test Mode
3. Test with a real payment (then refund if needed)

## Troubleshooting

### Checkout not working
- Check API key is correct
- Verify variant IDs match your products
- Check browser console for errors

### Webhooks not received
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- View webhook logs in Lemon Squeezy dashboard

### Subscription not activating
- Check Supabase user metadata
- Verify webhook events are being processed
- Check server logs for errors

## User Subscription Status

Subscription data is stored in Supabase user metadata:

```json
{
  "subscription": {
    "plan": "pro",
    "status": "active",
    "lemon_squeezy_id": "sub_123",
    "variant_id": "789012",
    "renews_at": "2024-02-01T00:00:00Z"
  }
}
```

Access in your app:
```javascript
const { user } = useAuth();
const subscription = user?.user_metadata?.subscription;
const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';
```
