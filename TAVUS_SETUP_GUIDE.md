# Tavus Integration Setup Guide

## What you need to do on Tavus:

### 1. Create a Tavus Account
1. Go to [Tavus.io](https://tavus.io) and sign up
2. Complete the onboarding process

### 2. Get Your API Key
1. Go to your Tavus Dashboard
2. Navigate to **Settings** → **API Keys**
3. Create a new API key
4. Copy the API key

### 3. Create a Replica (AI Avatar)
You need to create at least one replica (AI avatar) to use in interviews:

1. Go to **Replicas** in your Tavus dashboard
2. Click **Create New Replica**
3. Upload a video of yourself or use a stock avatar
4. Wait for processing (this can take 10-30 minutes)
5. Once ready, note the `replica_id`

### 4. Configure Environment Variables
Add these to your `.env` file:

```env
VITE_TAVUS_API_KEY=your_actual_api_key_here
VITE_TAVUS_DEFAULT_REPLICA_ID=your_replica_id_here
```

## How the Integration Works:

### 1. Interview Flow
1. User starts an interview session
2. App calls Tavus API to create a conversation with your replica
3. Tavus returns a conversation URL
4. The URL is embedded in an iframe for the video call
5. User can interact with the AI interviewer in real-time

### 2. Features Included
- **Real-time video conversation** with AI interviewer
- **Voice interaction** - user speaks, AI responds
- **Recording** - conversations can be recorded for review
- **Transcription** - automatic speech-to-text
- **Custom prompts** - AI can be programmed for specific interview types

### 3. Current Implementation
- ✅ API integration ready
- ✅ Video player component
- ✅ Conversation management
- ✅ Error handling and fallbacks
- ✅ Mock mode for development

## Testing Without Tavus:

The app includes a **mock mode** that works without Tavus:
- Shows a simulated AI interviewer interface
- Allows you to test the interview flow
- No actual video/voice interaction

## Next Steps:

1. **Get Tavus API key** and add to `.env`
2. **Create a replica** for your AI interviewer
3. **Test the integration** in a real interview session
4. **Customize the AI prompts** for different interview types

## Pricing Note:

Tavus has usage-based pricing. Check their pricing page for current rates. The integration is designed to be cost-effective by:
- Only starting conversations when needed
- Properly ending conversations when interviews finish
- Using efficient API calls

## Support:

If you need help with Tavus setup:
1. Check Tavus documentation: https://docs.tavus.io
2. Contact Tavus support for account issues
3. The integration code handles most edge cases automatically