import express from 'express';
import chatService from '../services/groq.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';  
const router = express.Router();


const conversations = new Map();

router.post('/message', chatLimiter, optionalAuth, async (req, res) => {

 try {
    const { message, context, conversationId } = req.body;

    // Validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Please keep it under 500 characters.'
      });
    }

    // Get or create conversation history
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let history = conversations.get(convId) || [];

    // Get user info if authenticated
    const user = req.user ? {
      id: req.user.id,
      name: req.user.name,
      userId: req.user.userId
    } : null;

    // Call Gemini AI
    const response = await chatService.chat(
      message,
      user,
      context,
      history
    );

    // Update conversation history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response.message });

    // Keep only last 10 messages to prevent memory issues
    if (history.length > 20) {
      history = history.slice(-20);
    }

    conversations.set(convId, history);

    // Clean up old conversations (older than 1 hour)
    setTimeout(() => {
      conversations.delete(convId);
    }, 3600000);

    res.json({
      success: true,
      message: response.message,
      conversationId: convId,
      actions: response.actions || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Sorry, I encountered an error. Please try again! 😊',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Clear conversation history
router.delete('/conversation/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  conversations.delete(conversationId);
  res.json({
    success: true,
    message: 'Conversation cleared'
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Chatbot is running! 🤖',
    geminiConfigured: chatService.isConfigured,
    conversationsActive: conversations.size
  });
});

export default router;
