# 🚀 Deployment Notes - Orniva

**Last Updated:** September 30, 2025

---

## 🔴 PENDING DEPLOYMENT

### Edge Function Update Required

**What Changed:**
Upgraded Gemini AI model from `gemini-1.5-flash` to `gemini-2.5-pro` for better accuracy.

**Files Modified:**
- `supabase/functions/identify-bird/index.ts`
  - Line 138: Model initialization
  - Line 223: Response metadata

**Deployment Steps:**

#### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# 1. Navigate to project directory
cd "D:\Projects\ROOK AI PROJECTS\orniva_app"

# 2. Make sure Supabase CLI is logged in
supabase login

# 3. Link to your project (if not already linked)
supabase link --project-ref coowimujsrlgrcifebhm

# 4. Deploy the Edge Function
supabase functions deploy identify-bird

# 5. Verify deployment
supabase functions list

# 6. Test the function
supabase functions logs identify-bird --tail
```

#### Option 2: Deploy via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Navigate to your project: `coowimujsrlgrcifebhm`
3. Go to **Edge Functions** section
4. Select `identify-bird` function
5. Click **Deploy New Version**
6. Upload the updated `index.ts` file
7. Click **Deploy**

---

## ⚠️ Important Notes

### API Key Verification

Make sure your Gemini API key supports `gemini-2.5-pro` model:

```bash
# Check if secret is set
supabase secrets list

# If not set or needs update:
supabase secrets set GEMINI_API_KEY=your_key_here
```

### Cost Implications

**Before (gemini-1.5-flash):**
- Cost per analysis: ~$0.00002
- 10,000 requests = ~$0.20

**After (gemini-2.5-pro):**
- Cost per analysis: ~$0.00005
- 10,000 requests = ~$0.50

**Monthly Cost Estimate (assuming 1000 users, 3 analyses each):**
- Previous: $0.06/month
- New: $0.15/month
- **Increase: $0.09/month** (still very affordable!)

### Expected Changes After Deployment

**User Experience:**
- ✅ More accurate bird species identification
- ✅ Better confidence scores
- ✅ More detailed descriptions
- ⚠️ Slightly longer processing time (1-3 seconds more)

**Monitoring:**
After deployment, monitor for:
1. Response times (should be 3-8 seconds)
2. Error rates (should remain same or lower)
3. API costs in Gemini dashboard
4. User feedback on accuracy

---

## 📊 Post-Deployment Verification

### 1. Test the Endpoint

```bash
# Get your project's anon key
supabase status

# Test with curl
curl -i --location --request POST \
  'https://coowimujsrlgrcifebhm.supabase.co/functions/v1/identify-bird' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "imageUri": "data:image/jpeg;base64,TEST_BASE64_HERE",
    "user_id": "test-user-id"
  }'
```

### 2. Check Response Metadata

Verify the response includes:
```json
{
  "success": true,
  "result": { ... },
  "model_used": "gemini-2.5-pro",  // ← Should show gemini-2.5-pro
  "timestamp": "..."
}
```

### 3. Monitor Logs

```bash
# Watch real-time logs
supabase functions logs identify-bird --tail

# Look for:
# - "Calling Gemini API..." messages
# - Response times
# - Any errors or warnings
```

### 4. Test in Mobile App

1. Open the Orniva app
2. Upload a bird photo
3. Verify:
   - Analysis completes successfully
   - Results look accurate
   - Response time is acceptable (< 10 seconds)
   - Credit deduction works correctly

---

## 🔄 Rollback Plan (If Needed)

If you experience issues with gemini-2.5-pro:

### Quick Rollback

```bash
# 1. Edit supabase/functions/identify-bird/index.ts
# Change line 138 back to:
model: "gemini-1.5-flash"

# Change line 223 back to:
model_used: 'gemini-1.5-flash'

# 2. Redeploy
supabase functions deploy identify-bird

# 3. Verify rollback
# Check logs and test the app
```

### Known Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Model not found" error | API key doesn't support 2.5-pro | Update API key or rollback to 1.5-flash |
| Timeout errors (>60s) | Model taking too long | Increase timeout or rollback |
| Higher error rates | Model compatibility issues | Check Gemini API status, consider rollback |
| Cost alerts | Unexpected high usage | Review usage patterns, consider rollback if unsustainable |

---

## 📝 Deployment Checklist

Before deploying:
- [x] Code changes reviewed and tested locally
- [x] Edge Function modified correctly
- [x] Documentation updated
- [ ] Gemini API key verified for gemini-2.5-pro support
- [ ] Team notified of deployment
- [ ] Monitoring dashboard ready

During deployment:
- [ ] Deploy Edge Function
- [ ] Verify deployment success
- [ ] Check function is running
- [ ] Review initial logs

After deployment:
- [ ] Test with sample image
- [ ] Verify response metadata
- [ ] Monitor for 30 minutes
- [ ] Check error rates
- [ ] Gather user feedback

---

## 🎯 Success Criteria

Deployment is successful if:
- ✅ Edge Function deploys without errors
- ✅ Test requests return valid results
- ✅ Response includes `model_used: 'gemini-2.5-pro'`
- ✅ Analysis completes within 10 seconds
- ✅ Error rate stays below 5%
- ✅ Users report good accuracy

---

## 📞 Support

**If deployment issues occur:**
1. Check Edge Function logs: `supabase functions logs identify-bird`
2. Review Gemini API dashboard for errors
3. Check Supabase project health dashboard
4. Consider rollback if critical issues persist

**Useful Commands:**
```bash
# View function status
supabase functions list

# View recent logs
supabase functions logs identify-bird

# Test function locally
supabase functions serve --env-file supabase/.env.local

# Check secrets
supabase secrets list
```

---

**End of Deployment Notes**  
**Next Steps:** Deploy to production and monitor for 24 hours