# Tool Calling & Rate Limits 🔧

**Vigtigt:** Tool/Function calling påvirker rate limits anderledes end normale requests!

---

## 📊 Hvordan Tool Calling Fungerer

### Normal Request (UDEN tools)

```
User: "Hvad koster rengøring?"
  ↓
1 API Call → LiteLLM → OpenRouter
  ↓
Response: "Det koster 500kr"

Total API Calls: 1 ✅
```

### Tool Calling Request (MED tools)

```
User: "Book rengøring til i morgen kl 10"
  ↓
1. API Call: AI vurderer hvilke tools at bruge
  ↓
2. AI caller: checkAvailability(date, time)
  ↓
3. Server eksekverer tool lokalt (IKKE API call)
  ↓
4. API Call: AI får tool result, beslutter næste skridt
  ↓
5. AI caller: createBooking(...)
  ↓
6. Server eksekverer tool lokalt (IKKE API call)
  ↓
7. API Call: AI laver final response med confirmation

Total API Calls: 3 ⚠️
```

---

## ⚠️ Rate Limit Impact

### OpenRouter FREE Tier

```
Limit: 16 API calls per minut

UDEN Tools:
- 16 simple requests OK ✅

MED Tools (average 3 API calls per conversation):
- Kun 5 conversations per minut! ⚠️
- 16 ÷ 3 = ~5 conversations
```

### Real-World Example

```
10 leads med tool calling på 2 minutter:
  ↓
10 conversations × 3 API calls = 30 API calls
  ↓
30 calls / 2 min = 15 calls/min
  ↓
Under limit (16/min) ✅

15 leads med tool calling på 1 minut:
  ↓
15 conversations × 3 API calls = 45 API calls
  ↓
45 calls / 1 min = 45 calls/min
  ↓
OVER LIMIT! ❌ (kun 16/min tilladt)
```

---

## 🔧 Vores Optimizations

### 1. Conservative Rate Limit

```typescript
// rate-limiter.ts
maxRequestsPerMinute: 12; // Was 14, now 12 for tool safety
maxConcurrent: 2; // Was 3, now 2 (tools spawn multiple calls)
```

**Hvorfor?**

- Giver buffer for uventede tool calls
- 12/min = ~4 safe tool conversations/min
- Mindre risk for hitting limit

### 2. Tool Call Batching

```typescript
// tool-optimizer.ts
// Execute multiple tools in parallel, not sequential
// Reduces: 3 tool calls × 2 API each = 6 API calls
// To:      1 API call + batch + 1 API call = 2 API calls
```

### 3. Smart Priority

```typescript
// Conversations with tools get higher priority
conversation.hasTools && toolCount >= 3
  ? (priority = "high")
  : (priority = "medium");
```

---

## 💡 Best Practices

### ✅ DO's

1. **Batch tool calls** når muligt

   ```typescript
   // God praksis: Parallel tool execution
   const [availability, pricing] = await Promise.all([
     checkAvailability(),
     getPricing(),
   ]);
   ```

2. **Cache tool results** for stabile data

   ```typescript
   // Pricing ændrer sig ikke hvert minut
   const pricing = await getCachedPricing(); // ✅
   ```

3. **Brug priority** for tool-heavy requests
   ```typescript
   await litellmClient.chatCompletion({
     messages,
     tools,
     priority: "high", // Tool calls får priority
   });
   ```

### ❌ DON'Ts

1. **Undgå sekventielle tool calls**

   ```typescript
   // Dårlig praksis: Sequential
   const avail = await checkAvailability();
   const price = await getPricing();
   const booking = await createBooking();
   // = Slow + many API calls ❌
   ```

2. **Undgå redundante tool calls**
   ```typescript
   // Dårlig: Kalder samme tool flere gange
   await getBusinessHours(); // Call 1
   await getBusinessHours(); // Call 2 (WASTE!)
   // Brug cache i stedet! ✅
   ```

---

## 📊 Monitoring Tool Usage

### Check Stats

```typescript
import { rateLimiter, toolOptimizer } from "./integrations/litellm";

// Se hvor mange requests bruger tools
const stats = rateLimiter.getStats();
console.log(`
Queue: ${stats.queueLength}
Requests last min: ${stats.requestsInLastMinute}/12
Available slots: ${stats.availableSlots}
`);

// Estimate tool impact
const estimatedCalls = toolOptimizer.estimateApiCalls(3); // 3 tools
console.log(`3 tools = ~${estimatedCalls} API calls`);
```

---

## 🎯 Recommendations

### For Din Use Case (Rengøring/Booking)

**Typiske Tools:**

1. `checkAvailability` - Tjek kalender
2. `getPricing` - Få priser
3. `createBooking` - Book opgave
4. `sendConfirmation` - Send bekræftelse

**Expected API Calls per Lead:**

```
Lead UDEN booking: 1 API call ✅
Lead MED booking:  3-4 API calls ⚠️

Average: ~2 API calls per lead

Safe rate: 12 calls/min = 6 leads/min ✅
```

### Anbefalet Setup

```typescript
// For batch processing af leads med tools
const leads = await getNewLeads();

for (const lead of leads) {
  // Process med automatic rate limiting
  await processLeadWithTools(lead, {
    priority: "medium", // Let queue handle it
    maxTools: 3, // Limit tool sprawl
  });

  // Queue handles waiting automatically! ✅
}
```

---

## ✅ Conclusion

**Tool calling bruger flere API calls, MEN:**

1. ✅ Vores rate limiter er justeret (12/min i stedet for 14)
2. ✅ Tool optimizer batches calls intelligent
3. ✅ Priority queue håndterer tool-heavy requests
4. ✅ Automatic retry hvis rate limit hit

**Du behøver IKKE bekymre dig!**

Systemet håndterer det automatisk! 🎉

---

**Anbefalinger:**

- Normal brug: Ingen ændringer nødvendige ✅
- Batch operations: Brug priority levels
- Monitor: Check `rateLimiter.getStats()` periodisk

**Safe Throughput:**

- UDEN tools: ~12 leads/min
- MED tools (avg 2.5 API calls): ~5 leads/min
- Stadig hurtigere end manual processing! ✅

---

**Last Updated:** November 9, 2025 11:40 AM
