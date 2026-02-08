import express, { Request, Response } from 'express';
import path from 'path';
import { KnowledgeService } from './knowledge-service';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize knowledge service
const knowledgeService = new KnowledgeService(
  path.join(__dirname, '../data')
);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Interface for chat message
 */
interface ChatMessage {
  message: string;
}

/**
 * Interface for chat response
 */
interface ChatResponse {
  response: string;
}

/**
 * Mock AI response handler with knowledge base integration
 * This is a placeholder for future GitHub Copilot SDK integration
 * When a user asks a question, the system first searches the knowledge base
 * for relevant context before generating a response
 * @param message - The user's input message
 * @param context - Additional context from knowledge base
 * @returns A mock AI response with context awareness
 */
function getMockAIResponse(message: string, context: string): string {
  const hasContext = context.length > 0;

  if (hasContext) {
    return `I found relevant information in the knowledge base about "${message}". ${context.substring(0, 200)}... (This is a mock response. The GitHub Copilot SDK integration will use this context to provide detailed answers.)`;
  }

  const responses = [
    `You asked: "${message}". This is a mock response. The GitHub Copilot SDK integration will be added here.`,
    `Interesting question about "${message}"! I'm a placeholder response for now.`,
    `I received your message: "${message}". Real AI responses coming soon!`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * POST endpoint to handle chat messages
 * Pre-answer step: Search knowledge base for relevant context
 * @param req - Express request with chat message
 * @param res - Express response with AI response
 */
app.post('/api/chat', async (req: Request<object, ChatResponse, ChatMessage>, res: Response<ChatResponse>) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ response: 'Invalid message format' });
    return;
  }

  try {
    // Pre-answer step: Search knowledge base for relevant documents
    const relevantDocs = await knowledgeService.search(message);

    // Build context from knowledge base to enhance AI response
    const context = relevantDocs.length > 0
      ? relevantDocs.map(doc => `${doc.title}: ${doc.snippet}`).join('\n\n')
      : '';

    // TODO: Replace with GitHub Copilot SDK integration
    // The context will be passed to the AI to provide more accurate answers
    const aiResponse = getMockAIResponse(message, context);

    res.json({ response: aiResponse });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error processing chat message:', error);
    res.status(500).json({ response: 'An error occurred processing your request' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

/**
 * Start the Express server
 */
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${PORT}`);
});
