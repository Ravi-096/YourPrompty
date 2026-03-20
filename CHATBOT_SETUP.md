# 🤖 Chatbot Setup Guide

## ✅ Installation Complete!

All chatbot files have been created and integrated. Now you just need to add your **Google Gemini API Key**!

---

## 🔑 Step 1: Get Your FREE Gemini API Key

1. Visit: **https://makersuite.google.com/app/apikey**
2. Click **"Get API Key"** or **"Create API Key"**
3. Select a Google Cloud project (or create a new one)
4. Copy your API key (starts with `AIza...`)

---

## ⚙️ Step 2: Add API Key to Server

Open this file:
```
server/.env
```

Find this line:
```
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key:
```
GEMINI_API_KEY=AIza...your-actual-key-here
```

**Save the file!**

---

## 🚀 Step 3: Restart Your Server

In your terminal (in the `server` folder):

```powershell
# Stop the current server (Ctrl+C)
# Then restart it:
node src/app.js
```

Or if using nodemon:
```powershell
npm run dev
```

---

## ✨ What You Get

### Smart Features:
- 🧠 **Context-aware responses** - Knows about yourPrompty platform
- 🎯 **Prompt suggestions** - Helps find prompts
- 🎨 **Category recommendations** - Suggests categories
- 📝 **Action triggers** - Opens modals, filters prompts
- ⚡ **Real-time AI responses** - Powered by Google Gemini
- 🛡️ **Rate limiting** - 10 messages per minute per user
- 💾 **Conversation memory** - Remembers context

### Example Conversations:

**User:** "I need a prompt for creating a sunset landscape"  
**Prompty:** "Perfect! 🌅 I can help you find landscape prompts. Try searching for 'sunset' in the search bar, or browse the Landscape category. Want me to show you some tips for creating stunning landscape prompts?"

**User:** "How do I upload my prompt?"  
**Prompty:** "Easy! 🚀 Click the 'Upload Prompt' button in the header. You'll be able to add your prompt text, upload an image, choose a category, and share it with the community!"

---

## 🧪 Testing the Chatbot

1. Open your app: `http://localhost:5173`
2. Click the chatbot icon (bottom right)
3. Type a message like:
   - "Help me find prompts"
   - "How do I upload?"
   - "Show me landscape prompts"

---

## 📊 API Usage (FREE Tier)

**Gemini 1.5 Flash Free Tier:**
- ✅ 15 requests per minute
- ✅ 1 million tokens per day
- ✅ **100% FREE** for moderate usage

**Average conversation:** ~100-300 tokens per message
**Can handle:** 3,000+ conversations per day FREE!

---

## 🔧 Files Created

### Backend:
- ✅ `server/src/routes/chat.js` - Chat API endpoint
- ✅ `server/src/services/gemini.js` - Gemini AI integration
- ✅ `server/src/middleware/rateLimiter.js` - Rate limiting
- ✅ `server/src/app.js` - Updated with chat routes

### Frontend:
- ✅ `src/components/Chatbot.tsx` - Updated with API integration

### Config:
- ✅ `server/.env` - Added Gemini configuration

---

## 🐛 Troubleshooting

### "Chatbot will use fallback responses"
- Your API key is not set or invalid
- Check `server/.env` file
- Make sure you copied the key correctly

### Rate Limit Errors
- You're sending messages too fast
- Wait 1 minute and try again
- Default: 10 messages per minute

### "Failed to get response"
- Check if server is running
- Check browser console for errors
- Verify API key is valid

---

## 🎉 You're All Set!

Once you add your API key and restart the server, your chatbot will be **PRODUCTION READY** with real AI responses!

**Need help?** The chatbot will work even without an API key (using fallback responses), but you won't get the smart AI features.

---

## 📝 Environment Variables

Your `server/.env` should have these chatbot variables:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Chatbot Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=10
```

---

Happy chatting! 🚀✨
