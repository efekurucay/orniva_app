# 🦜 Orniva Edge Functions

Secure server-side functions for the Orniva Find Birds application.

## 📁 Functions

### `identify-bird`
Identifies bird species from images using Gemini AI API.

**Features:**
- ✅ Secure API key management (server-side only)
- ✅ Image format handling (file://, http://, base64, data URI)
- ✅ 60-second timeout protection
- ✅ Rate limiting error handling
- ✅ Detailed error responses with retry suggestions
- ✅ CORS enabled for client requests

**Request:**
```json
{
  "imageUri": "file:///path/to/image.jpg",
  "user_id": "user-uuid-here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "result": {
    "species": "American Robin (Turdus migratorius)",
    "confidence": 95,
    "description": "A medium-sized songbird with distinctive orange-red breast..."
  },
  "timestamp": "2025-09-30T12:00:00.000Z",
  "model_used": "gemini-1.5-flash"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Request timeout. Please try again.",
  "retryable": true,
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

## 🚀 Deployment

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Local Development

1. **Create local environment file:**
```bash
cp supabase/.env.local.example supabase/.env.local
# Edit .env.local and add your GEMINI_API_KEY
```

2. **Start Supabase locally:**
```bash
supabase start
```

3. **Serve functions locally:**
```bash
supabase functions serve --env-file supabase/.env.local
```

4. **Test the function:**
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/identify-bird' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"imageUri":"test","user_id":"test-user"}'
```

### Production Deployment

1. **Link to your Supabase project:**
```bash
supabase link --project-ref coowimujsrlgrcifebhm
```

2. **Set production secrets:**
```bash
supabase secrets set GEMINI_API_KEY=your_production_gemini_api_key
```

3. **Deploy the function:**
```bash
supabase functions deploy identify-bird
```

4. **Verify deployment:**
```bash
supabase functions list
```

### Production URL
After deployment, your function will be available at:
```
https://coowimujsrlgrcifebhm.supabase.co/functions/v1/identify-bird
```

## 🔐 Security

### API Key Management

**Never commit API keys to git!**

- ✅ Use `.env.local` for local development
- ✅ Use Supabase Secrets for production
- ✅ API keys are only accessible server-side
- ✅ Client never sees the Gemini API key

**Setting Secrets:**
```bash
# Production
supabase secrets set GEMINI_API_KEY=your_key

# View secrets (values are hidden)
supabase secrets list

# Delete a secret
supabase secrets unset GEMINI_API_KEY
```

### Rate Limiting

**Gemini API Free Tier Limits:**
- 15 requests/minute
- 1,500 requests/day
- 1M tokens/minute

The Edge Function handles rate limit errors gracefully with retry suggestions.

## 🧪 Testing

### Unit Testing (Local)

```bash
# Test with a real image
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/identify-bird' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "imageUri": "data:image/jpeg;base64,YOUR_BASE64_HERE",
    "user_id": "test-user-id"
  }'
```

### Error Testing

```bash
# Test timeout handling (expect 408 after 60s)
# Test rate limiting (make many requests quickly)
# Test invalid image format
```

## 📊 Monitoring

### View Logs

```bash
# Real-time logs (local)
supabase functions serve --env-file supabase/.env.local --debug

# Production logs (last 100 lines)
supabase functions logs identify-bird --tail
```

### Logs in Dashboard

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select `identify-bird`
4. View logs, invocations, and errors

## 🔧 Troubleshooting

### "GEMINI_API_KEY not configured"
**Solution**: Set the secret in Supabase:
```bash
supabase secrets set GEMINI_API_KEY=your_key
```

### "Failed to process image"
**Causes:**
- Invalid image URI
- Image too large
- Unsupported format

**Solution**: Ensure image is JPEG/PNG, < 10MB

### "Request timeout"
**Causes:**
- Large image processing
- Slow Gemini API response
- Network issues

**Solution**: 
- Compress images before uploading
- Retry the request
- Check network connectivity

### "API rate limit exceeded"
**Causes:**
- Too many requests in short period
- Reached Gemini free tier limit

**Solution**:
- Implement client-side request throttling
- Upgrade to paid Gemini API tier
- Cache results for duplicate requests

## 🎯 Best Practices

1. **Image Optimization**
   - Compress images before sending to Edge Function
   - Limit image dimensions (max 1024x1024)
   - Use JPEG format for photos

2. **Error Handling**
   - Always check `success` field in response
   - Handle `retryable` errors appropriately
   - Show user-friendly error messages

3. **Performance**
   - Cache results for duplicate images
   - Implement request queuing on client
   - Show progress indicators

4. **Security**
   - Always send user_id for logging
   - Validate images on client before upload
   - Never expose API keys client-side

## 📚 Dependencies

- **Deno**: 2.1+ (Edge Function runtime)
- **@google/generative-ai**: 0.21.0+ (Gemini AI SDK)
- **@supabase/supabase-js**: Latest (Client SDK)

## 🔄 Updates

To update the function:

1. Make changes to `supabase/functions/identify-bird/index.ts`
2. Test locally:
   ```bash
   supabase functions serve --env-file supabase/.env.local
   ```
3. Deploy:
   ```bash
   supabase functions deploy identify-bird
   ```

---

**Last Updated**: 2025-09-30  
**Version**: 1.0.0  
**Status**: Production Ready ✨