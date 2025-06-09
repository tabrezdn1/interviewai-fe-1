# Tavus Integration Setup Guide

## Updated Multi-Replica Setup

This integration now supports **three different AI interviewers** for different interview rounds:

1. **HR Screening** - Initial screening with HR representative
2. **Technical Round** - Technical interview with engineering lead  
3. **Behavioral Round** - Behavioral interview with hiring manager

## What you need to do on Tavus:

### 1. Create a Tavus Account
1. Go to [Tavus.io](https://tavus.io) and sign up
2. Complete the onboarding process

### 2. Get Your API Key
1. Go to your Tavus Dashboard
2. Navigate to **Settings** → **API Keys**
3. Create a new API key
4. Copy the API key

### 3. Create Three Replicas (AI Avatars)
You need to create **three different replicas** for the different interview rounds:

#### Replica 1: HR Interviewer
1. Go to **Replicas** in your Tavus dashboard
2. Click **Create New Replica**
3. Name it "HR Interviewer" or similar
4. Upload a video that represents an HR professional
5. Wait for processing (10-30 minutes)
6. Note the `replica_id` for HR

#### Replica 2: Technical Interviewer  
1. Create another replica
2. Name it "Technical Lead" or similar
3. Upload a video that represents a technical interviewer
4. Note the `replica_id` for technical

#### Replica 3: Behavioral Interviewer
1. Create a third replica
2. Name it "Hiring Manager" or similar  
3. Upload a video that represents a senior manager
4. Note the `replica_id` for behavioral

### 4. Configure Environment Variables
Add these to your `.env` file:

```env
VITE_TAVUS_API_KEY=your_actual_api_key_here
VITE_TAVUS_HR_REPLICA_ID=replica_id_for_hr_interviewer
VITE_TAVUS_TECHNICAL_REPLICA_ID=replica_id_for_technical_interviewer
VITE_TAVUS_BEHAVIORAL_REPLICA_ID=replica_id_for_behavioral_interviewer
```

## New Interview Modes:

### 1. Single Round Interview
- User selects one specific interview type (technical, behavioral, etc.)
- Uses the appropriate replica for that round
- Duration: 15-45 minutes depending on round type

### 2. Complete Interview Process
- **Multi-round interview** with all three interviewers
- Automatically progresses through: HR Screening → Technical → Behavioral
- Total duration: ~90 minutes (15 + 45 + 30 minutes)
- Each round uses a different AI interviewer

## How the Integration Works:

### 1. Single Round Flow
1. User starts an interview session
2. App selects appropriate replica based on interview type
3. Creates conversation with that specific replica
4. User interacts with the specialized AI interviewer

### 2. Complete Interview Flow
1. User selects "Complete Interview" mode
2. **Round 1**: HR Screening (15 min)
   - Uses HR replica for initial screening questions
3. **Round 2**: Technical Interview (45 min)  
   - Automatically switches to technical replica
   - Focuses on coding/technical questions
4. **Round 3**: Behavioral Interview (30 min)
   - Switches to behavioral replica
   - Focuses on soft skills and experience

### 3. Smart Replica Selection
- **HR Replica**: Used for screening rounds and general questions
- **Technical Replica**: Used for technical interviews and coding questions
- **Behavioral Replica**: Used for behavioral and management-style questions
- **Fallback**: If specific replica not available, uses first available replica

## Features Included:

### ✅ Multi-Replica Support
- Different AI personalities for different interview types
- Automatic replica selection based on interview round
- Seamless transitions between rounds

### ✅ Interview Modes
- **Single Round**: Practice specific interview type
- **Complete Process**: Full multi-round interview experience
- **Custom Selection**: Choose specific rounds to practice

### ✅ Progress Tracking
- Visual progress indicator for multi-round interviews
- Round completion tracking
- Automatic progression between rounds

### ✅ Flexible Configuration
- Works with 1, 2, or 3 replicas
- Graceful fallbacks if replicas not available
- Mock mode for development/testing

## Setup Priority:

### Minimum Setup (1 Replica):
- Create just the **Technical Replica**
- Users can do single-round technical interviews
- Complete interview mode will be disabled

### Recommended Setup (3 Replicas):
- Create all three replicas for full experience
- Enables both single-round and complete interview modes
- Provides most realistic interview simulation

## Testing:

### With Replicas:
1. Add all three replica IDs to `.env`
2. Test single-round interviews with each type
3. Test complete interview process
4. Verify automatic round transitions

### Without Replicas (Mock Mode):
- App automatically detects missing replicas
- Shows demo interface with simulated AI interviewers
- All functionality works except actual video/voice interaction

## Pricing Optimization:

The integration is designed to be cost-effective:
- **Conversations only start when needed**
- **Automatic cleanup** when rounds end
- **Efficient API usage** with proper error handling
- **Round-specific durations** to minimize usage

## Next Steps:

1. **Create your three replicas** on Tavus
2. **Add replica IDs** to your `.env` file  
3. **Test single-round interviews** first
4. **Test complete interview process**
5. **Customize AI prompts** for each replica type

The system will automatically detect which replicas you have configured and enable the appropriate interview modes!
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