import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

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
 * Mock AI response handler
 * This is a placeholder for future GitHub Copilot SDK integration
 * @param message - The user's input message
 * @returns A mock AI response
 */
function getMockAIResponse(message: string): string {
  const responses = [
    `You asked: "${message}". This is a mock response. The GitHub Copilot SDK integration will be added here.`,
    `Interesting question about "${message}"! I'm a placeholder response for now.`,
    `I received your message: "${message}". Real AI responses coming soon!`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * POST endpoint to handle chat messages
 * @param req - Express request with chat message
 * @param res - Express response with AI response
 */
app.post('/api/chat', (req: Request<object, ChatResponse, ChatMessage>, res: Response<ChatResponse>) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ response: 'Invalid message format' });
    return;
  }

  // TODO: Replace with GitHub Copilot SDK integration
  const aiResponse = getMockAIResponse(message);

  res.json({ response: aiResponse });
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
