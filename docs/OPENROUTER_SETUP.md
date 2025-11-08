# 🚀 OpenRouter + Gemma 3 27B Free Setup

## 📋 QUICK SETUP

### 1. Get OpenRouter API Key
1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up/login
3. Go to API Keys → Create new key
4. Copy your key: `sk-or-v1-...`

### 2. Update .env.dev
```bash
# Copy template
cp .env.dev.template .env.dev

# Edit and add your key
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### 3. Start Development
```bash
pnpm dev
```

## 🎯 WHAT'S ENABLED

### ✅ FRIDAY AI FEATURES
- **Danish responses** - Friday speaks Danish
- **Business context** - Email, calendar, Billy integration
- **Gemma 3 27B Free** - Fast, capable model
- **Error handling** - Graceful failures
- **Loading states** - Visual feedback

### ✅ UI FEATURES
- **20% panel optimized** - Fits perfectly in side panel
- **Shortwave design** - Clean, minimal interface
- **Modular architecture** - Professional TSX structure
- **Type safety** - Full TypeScript support

## 🧪 TESTING

### Test Basic Chat
1. Open Friday AI panel (left side)
2. Type: "Hej Friday, hvad kan du hjælpe med?"
3. Should get Danish response

### Test Context
1. Select some emails in inbox
2. Ask: "Opsummer de valgte emails"
3. Friday should use email context

### Test Business Features
1. Try: "Tjek min kalender i dag"
2. Try: "Vis ubetalte fakturaer"  
3. Try: "Find nye leads"

## 🔧 TROUBLESHOOTING

### API Key Issues
```bash
# Check if key is set
echo $NEXT_PUBLIC_OPENROUTER_API_KEY

# Should start with: sk-or-v1-
```

### Network Issues
- Check firewall allows `openrouter.ai`
- Verify CORS settings in browser
- Check browser console for errors

### Response Issues
- Model: `google/gemma-3-27b-it:free`
- Temperature: 0.7 (balanced)
- Max tokens: 2000 (good length)

## 📊 MONITORING

### Check Usage
- Go to [OpenRouter Dashboard](https://openrouter.ai/dashboard)
- Monitor token usage
- Check costs (free tier available)

### Debug Mode
```typescript
// In browser console:
localStorage.setItem('friday-debug', 'true')
// Reload to see detailed logs
```

## 🚀 NEXT STEPS

### Phase 2.1: Enhanced Context
- Calendar integration
- Billy API integration  
- Real-time data fetching

### Phase 2.2: Streaming
- Real-time response streaming
- Better UX for long responses
- Interrupt capability

### Phase 2.3: Advanced Features
- Saved prompts
- Conversation history
- Multi-language support

---

## 🎉 READY TO GO!

Your Friday AI is now powered by:
- 🤖 **Gemma 3 27B Free** via OpenRouter
- 🇩🇰 **Danish business assistant**
- 📧 **Email + Calendar + Billy context**
- 🎨 **Shortwave-inspired design**
- 🏗️ **Professional TSX architecture**

**Start chatting with Friday!** 🚀