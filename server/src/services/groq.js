import Groq from 'groq-sdk';

class ChatService {
  constructor() {
    const apiKey = process.env.GROQ_API_KEY;


      console.log('Groq key found:', !!apiKey); // ← add this
      console.log('Key starts with:', apiKey?.substring(0, 8)); // ← and this
    if (!apiKey) {
      console.warn('⚠️ GROQ_API_KEY not set! Using fallback responses.');
      this.isConfigured = false;
      return;
    }
    this.client = new Groq({ apiKey });
    this.isConfigured = true;
    console.log('✅ Groq AI initialized successfully');
  }

  async chat(message, user = null, context = null, conversationHistory = []) {
    if (!this.isConfigured) return { success: false, message: this.getFallbackResponse(message), actions: [] };

    try {
      const systemPrompt = `You are Prompty, creative AI assistant for YourPrompty! 🎨
YourPrompty = Platform for sharing AI prompts.
Your main job: give creative prompt ideas when asked!
Keep responses SHORT (1-2 sentences).
Only refuse: politics, math, history, news.
${user ? `User: ${user.name}` : 'User: Guest'}`;

      // Build messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        { role: 'user', content: message },
      ];

      const response = await this.client.chat.completions.create({
        model:       'llama-3.1-8b-instant', // free + fast
        messages,
        max_tokens:  150,
        temperature: 0.8,
      });

      const reply = response.choices[0]?.message?.content || this.getFallbackResponse(message);
      const actions = this.detectActions(message, reply);

      return { success: true, message: reply, actions };

    } catch (error) {
      console.error('Groq API Error:', error);
      return { success: false, message: this.getFallbackResponse(message), actions: [] };
    }
  }

  detectActions(userMessage, botResponse) {
    const actions = [];
    const lower = userMessage.toLowerCase();

    const categories = ['photography', 'digital art', 'character', 'landscape', 'abstract', 'product', 'anime', '3d render', 'illustration'];
    for (const cat of categories) {
      if (lower.includes(cat)) {
        actions.push({ type: 'FILTER_CATEGORY', category: cat.charAt(0).toUpperCase() + cat.slice(1) });
        break;
      }
    }
    if (lower.includes('upload') || lower.includes('share'))
      actions.push({ type: 'OPEN_UPLOAD' });
    if (lower.includes('sign up') || lower.includes('register'))
      actions.push({ type: 'SHOW_AUTH', mode: 'signup' });
    if (lower.includes('sign in') || lower.includes('login'))
      actions.push({ type: 'SHOW_AUTH', mode: 'signin' });

    return actions;
  }

  getFallbackResponse(message) {
    const lower = message.toLowerCase();
    if (['hi','hello','hey'].some(g => lower.startsWith(g)))
      return "Hey there! 😊 Need prompt ideas or help with YourPrompty?";
    if (['prompt','photo','art','design'].some(k => lower.includes(k)))
      return "I can help with prompt ideas! Browse our categories for inspiration! 🎨";
    if (lower.includes('upload'))
      return "Click Upload Prompt in the header! 🚀";
    return "I help with YourPrompty! Ask for prompt ideas or help using the site! 😊";
  }
}

const chatService = new ChatService();
export default chatService;