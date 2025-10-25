# Debug Test for AI Summary Generation

## Test Steps:

1. **Start the application**:
   ```bash
   # Terminal 1: Backend
   cd backend && python app.py
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   
   # Terminal 3: Ollama
   ollama serve
   ```

2. **Create a long conversation**:
   - Open WorldBuilderChat
   - Send 12+ messages to trigger sliding window
   - Check browser console for debug logs

3. **Look for these debug logs**:
   ```
   AI Summary Result: { success: true, response: "actual summary text" }
   AI Generated Summary: actual summary text
   ```

## Expected Behavior:

- When conversation exceeds 10 messages, sliding window should activate
- AI should be called to generate summary of older messages
- Summary should contain actual content, not generic fallback

## Potential Issues:

1. **AI Service Response Format**: Check if `result.response` contains the actual summary
2. **Empty Response**: AI might be returning empty string
3. **API Error**: Backend might not be processing the summary request correctly
4. **Model Issue**: Local model might not be generating summaries properly

## Debug Commands:

```javascript
// In browser console, test AI service directly:
await aiService.chat([
  { role: 'user', content: 'Hello world' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'Summarize our conversation' }
], { model: 'llama3.2', temperature: 0.1 });
```

## Expected vs Actual:

**Expected**: 
```
[Previous conversation summary (8 messages): Discussed fantasy world creation with elves in Rivendell and dwarves in mountains. Key characters mentioned: Aragorn, Legolas. Magic system uses ancient artifacts. Current conversation continues below...]
```

**If getting fallback**:
```
[Previous conversation summary (8 messages): World building discussion covering characters, locations, and world details. Current conversation continues below...]
```