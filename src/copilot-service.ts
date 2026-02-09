import { CopilotClient } from '@github/copilot-sdk';

/**
 * Service wrapper for GitHub Copilot SDK
 * Manages Copilot client lifecycle and session handling
 */
export class CopilotService {
  private client: CopilotClient | null = null;
  private isInitialized = false;

  /**
   * Initializes the Copilot client
   * @throws Error if initialization fails
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.client = new CopilotClient();
      await this.client.start();
      this.isInitialized = true;
      // eslint-disable-next-line no-console
      console.log('Copilot client initialized successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Copilot client:', error);
      throw new Error('Failed to initialize Copilot client. Ensure GitHub Copilot is configured.');
    }
  }

  /**
   * Sends a prompt to Copilot and receives a streaming response
   * @param prompt - The user's question or prompt
   * @param context - Optional context from knowledge base to enhance the response
   * @returns Promise resolving to the AI response
   */
  async getResponse(prompt: string, context?: string): Promise<string> {
    if (!this.client || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('Copilot client is not initialized');
    }

    try {
      // Build enhanced prompt with knowledge base context if available
      const enhancedPrompt = context
        ? `Using the following context from the knowledge base:\n\n${context}\n\nPlease answer this question: ${prompt}`
        : prompt;

      // Create a session with GPT-4
      const session = await this.client.createSession({ model: 'gpt-4.1' });

      // Send prompt and wait for response
      const response = await session.sendAndWait({ prompt: enhancedPrompt });

      // Extract content from response
      if (response?.data?.content) {
        return response.data.content;
      }

      return 'I apologize, but I was unable to generate a response. Please try again.';
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting Copilot response:', error);
      throw new Error('Failed to get response from Copilot');
    }
  }

  /**
   * Streams a response from Copilot
   * @param prompt - The user's question or prompt
   * @param context - Optional context from knowledge base
   * @param onChunk - Callback function called for each chunk of the response
   * @returns Promise that resolves when streaming is complete
   */
  async streamResponse(
    prompt: string,
    context: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('Copilot client is not initialized');
    }

    try {
      // Build enhanced prompt with knowledge base context if available
      const enhancedPrompt = context
        ? `Using the following context from the knowledge base:\n\n${context}\n\nPlease answer this question: ${prompt}`
        : prompt;

      // Create a session with GPT-4
      const session = await this.client.createSession({ model: 'gpt-4.1' });

      // For now, use sendAndWait and send the full response at once
      // The SDK's streaming API may differ from our assumption
      const response = await session.sendAndWait({ prompt: enhancedPrompt });

      // Send the full response as one chunk
      if (response?.data?.content) {
        onChunk(response.data.content);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error streaming Copilot response:', error);
      throw new Error('Failed to stream response from Copilot');
    }
  }

  /**
   * Shuts down the Copilot client
   */
  async shutdown(): Promise<void> {
    if (this.client && this.isInitialized) {
      try {
        await this.client.stop();
        this.isInitialized = false;
        // eslint-disable-next-line no-console
        console.log('Copilot client shut down successfully');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error shutting down Copilot client:', error);
      }
    }
  }
}
