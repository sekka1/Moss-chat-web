/**
 * Unit tests for CopilotService
 * These tests use mocks and don't require actual GitHub Copilot authentication
 */

import { CopilotService } from './copilot-service';

// Mock the @github/copilot-sdk module
jest.mock('@github/copilot-sdk', () => {
  return {
    CopilotClient: jest.fn().mockImplementation(() => {
      return {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        createSession: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            sendAndWait: jest.fn().mockImplementation(({ prompt }) => {
              // Mock different responses based on prompt content
              if (prompt.includes('rank documents') || prompt.includes('identify which documents')) {
                // Mock ranking response
                return Promise.resolve({
                  data: {
                    content: '1,0,2',
                  },
                });
              }
              // Default mock response for chat
              return Promise.resolve({
                data: {
                  content: 'A live moss wall is a vertical garden featuring living moss plants attached to a wall or panel structure. These green installations bring natural beauty indoors while improving air quality and providing sound insulation.',
                },
              });
            }),
          });
        }),
      };
    }),
  };
});

describe('CopilotService Unit Tests', () => {
  let copilotService: CopilotService;

  beforeEach(() => {
    copilotService = new CopilotService();
  });

  afterEach(async () => {
    await copilotService.shutdown();
  });

  /**
   * Test initialization
   */
  it('should initialize successfully', async () => {
    await expect(copilotService.initialize()).resolves.not.toThrow();
  });

  /**
   * Test case requested by user: Ask "what is a live moss wall?" and verify response
   * This test uses mocks to verify the service works without requiring Copilot auth
   */
  it('should get a response for "what is a live moss wall?"', async () => {
    const question = 'what is a live moss wall?';

    const response = await copilotService.getResponse(question);

    // Verify we got a response
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);

    // The mocked response should contain relevant information about moss walls
    const lowerResponse = response.toLowerCase();
    expect(lowerResponse).toContain('moss');
    expect(lowerResponse).toContain('wall');
  });

  /**
   * Test with knowledge base context
   */
  it('should get a response with knowledge base context', async () => {
    const question = 'How do I maintain a moss wall?';
    const context = 'Moss walls require regular misting and proper lighting conditions.';

    const response = await copilotService.getResponse(question, context);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  /**
   * Test streaming functionality
   */
  it('should stream a response', async () => {
    const question = 'What are the benefits of moss walls?';
    const chunks: string[] = [];

    await copilotService.streamResponse(question, undefined, (chunk: string) => {
      chunks.push(chunk);
    });

    expect(chunks.length).toBeGreaterThan(0);
    const fullResponse = chunks.join('');
    expect(fullResponse.length).toBeGreaterThan(0);
  });

  /**
   * Test shutdown
   */
  it('should shutdown gracefully', async () => {
    await copilotService.initialize();
    await expect(copilotService.shutdown()).resolves.not.toThrow();
  });

  /**
   * Test document ranking by relevance
   */
  it('should rank documents by relevance', async () => {
    const query = 'How do I water my moss?';
    const documents = [
      { title: 'Moss Care Guide', snippet: 'General care information for moss plants' },
      { title: 'Watering Schedule', snippet: 'Best practices for watering moss walls' },
      { title: 'Light Requirements', snippet: 'Proper lighting for moss growth' },
    ];

    const ranking = await copilotService.rankDocumentsByRelevance(query, documents);

    // Verify we got a ranking
    expect(ranking).toBeDefined();
    expect(Array.isArray(ranking)).toBe(true);
    expect(ranking.length).toBe(documents.length);

    // All indices should be present
    expect(ranking.sort()).toEqual([0, 1, 2]);
  });

  /**
   * Test document ranking with empty documents
   */
  it('should handle empty document list', async () => {
    const query = 'How do I water my moss?';
    const documents: Array<{ title: string; snippet: string }> = [];

    const ranking = await copilotService.rankDocumentsByRelevance(query, documents);

    expect(ranking).toBeDefined();
    expect(ranking.length).toBe(0);
  });

  /**
   * Test document ranking with single document
   */
  it('should handle single document', async () => {
    const query = 'How do I water my moss?';
    const documents = [
      { title: 'Moss Care Guide', snippet: 'General care information for moss plants' },
    ];

    const ranking = await copilotService.rankDocumentsByRelevance(query, documents);

    expect(ranking).toBeDefined();
    expect(ranking).toEqual([0]);
  });
});
