import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Interface for knowledge documents
 */
interface KnowledgeDocument {
  path: string;
  title: string;
  content: string;
  snippet?: string;
}

/**
 * Service for searching and loading knowledge from the /data directory
 * This service provides context for AI responses by searching relevant documents
 */
export class KnowledgeService {
  private dataDirectory: string;
  private documentCache: Map<string, KnowledgeDocument> = new Map();

  constructor(dataDirectory: string) {
    this.dataDirectory = dataDirectory;
  }

  /**
   * Search the knowledge base for relevant documents
   * @param query - The user's question or search terms
   * @returns Array of relevant documents sorted by relevance
   */
  async search(query: string): Promise<KnowledgeDocument[]> {
    const results: KnowledgeDocument[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);

    try {
      const documents = await this.getAllDocuments();

      for (const doc of documents) {
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.title.toLowerCase();

        // Simple relevance scoring based on term matches
        let score = 0;
        for (const term of queryTerms) {
          if (term.length < 3) continue; // Skip short words

          if (titleLower.includes(term)) score += 10;
          if (contentLower.includes(term)) {
            // Count occurrences
            const matches = (contentLower.match(new RegExp(term, 'g')) ?? []).length;
            score += Math.min(matches, 5); // Cap at 5 matches
          }
        }

        if (score > 0) {
          results.push({
            ...doc,
            snippet: this.extractSnippet(doc.content, queryTerms),
          });
        }
      }

      // Sort by relevance (highest first) and return top results
      return results
        .sort((a, b) => this.scoreDocument(b, queryTerms) - this.scoreDocument(a, queryTerms))
        .slice(0, 3);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  /**
   * Load a specific document by path
   * @param relativePath - Path relative to data directory
   * @returns The document or null if not found
   */
  async loadDocument(relativePath: string): Promise<KnowledgeDocument | null> {
    // Security: Prevent path traversal
    const normalizedPath = path.normalize(relativePath);
    if (normalizedPath.includes('..')) {
      throw new Error('Invalid path');
    }

    const fullPath = path.join(this.dataDirectory, normalizedPath);

    // Ensure path is within data directory
    if (!fullPath.startsWith(this.dataDirectory)) {
      throw new Error('Invalid path');
    }

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const title = this.extractTitle(content, relativePath);

      return {
        path: relativePath,
        title,
        content,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error loading document: ${relativePath}`, error);
      return null;
    }
  }

  /**
   * Get all documents from the knowledge base
   * @returns Array of all knowledge documents
   */
  private async getAllDocuments(): Promise<KnowledgeDocument[]> {
    const documents: KnowledgeDocument[] = [];

    try {
      await this.walkDirectory(this.dataDirectory, async (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.md' || ext === '.yaml' || ext === '.yml') {
          const relativePath = path.relative(this.dataDirectory, filePath);

          // Check cache first
          if (this.documentCache.has(relativePath)) {
            documents.push(this.documentCache.get(relativePath)!);
            return;
          }

          try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Skip .gitkeep and empty files
            if (content.trim().length < 10) return;

            const doc: KnowledgeDocument = {
              path: relativePath,
              title: this.extractTitle(content, relativePath),
              content,
            };

            this.documentCache.set(relativePath, doc);
            documents.push(doc);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error reading file: ${filePath}`, error);
          }
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error walking data directory:', error);
    }

    return documents;
  }

  /**
   * Recursively walk a directory
   * @param dir - Directory to walk
   * @param callback - Function to call for each file
   */
  private async walkDirectory(
    dir: string,
    callback: (filePath: string) => Promise<void>
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await this.walkDirectory(fullPath, callback);
        } else if (entry.isFile()) {
          await callback(fullPath);
        }
      }
    } catch {
      // Directory might not exist yet
      // eslint-disable-next-line no-console
      console.warn(`Directory not accessible: ${dir}`);
    }
  }

  /**
   * Extract title from document content or filename
   * @param content - Document content
   * @param filePath - Path to the file
   * @returns Extracted or generated title
   */
  private extractTitle(content: string, filePath: string): string {
    // Try to extract from markdown heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Try to extract from YAML name field
    const yamlMatch = content.match(/^name:\s*["']?(.+?)["']?\s*$/m);
    if (yamlMatch) {
      return yamlMatch[1].trim();
    }

    // Fall back to filename
    return path.basename(filePath, path.extname(filePath))
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Extract a relevant snippet from content
   * @param content - Document content
   * @param queryTerms - Search terms
   * @returns Relevant snippet
   */
  private extractSnippet(content: string, queryTerms: string[]): string {
    const lines = content.split('\n');

    for (const term of queryTerms) {
      if (term.length < 3) continue;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(term)) {
          // Return a few lines around the match
          const start = Math.max(0, i - 1);
          const end = Math.min(lines.length, i + 3);
          const snippet = lines.slice(start, end).join('\n').trim();

          if (snippet.length > 20) {
            return snippet.length > 300
              ? snippet.substring(0, 300) + '...'
              : snippet;
          }
        }
      }
    }

    // Fall back to first meaningful content
    const firstContent = lines
      .filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'))
      .slice(0, 3)
      .join('\n');

    return firstContent.length > 300
      ? firstContent.substring(0, 300) + '...'
      : firstContent;
  }

  /**
   * Score a document for relevance
   * @param doc - Document to score
   * @param queryTerms - Search terms
   * @returns Relevance score
   */
  private scoreDocument(doc: KnowledgeDocument, queryTerms: string[]): number {
    let score = 0;
    const contentLower = doc.content.toLowerCase();
    const titleLower = doc.title.toLowerCase();

    for (const term of queryTerms) {
      if (term.length < 3) continue;
      if (titleLower.includes(term)) score += 10;
      const matches = (contentLower.match(new RegExp(term, 'g')) ?? []).length;
      score += Math.min(matches, 5);
    }

    return score;
  }

  /**
   * Clear the document cache
   */
  clearCache(): void {
    this.documentCache.clear();
  }
}
