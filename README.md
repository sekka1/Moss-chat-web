# Moss-chat-web

A minimal TypeScript web application built with Express.js that provides an AI chat interface. This application serves as a foundation for integrating AI chat capabilities, currently using mock responses with plans to integrate the GitHub Copilot SDK.

## Features

- **Express.js Server**: Minimal TypeScript-based Express.js server
- **AI Chat Interface**: Clean, dark-themed chat interface
- **Mock AI Responses**: Placeholder responses ready for GitHub Copilot SDK integration
- **TypeScript**: Strict type safety throughout the application
- **Linting**: ESLint configured for TypeScript
- **CI/CD**: GitHub Actions workflow for automated testing and building

## Project Structure

```
moss-chat-web/
├── src/
│   └── server.ts          # Express server with API endpoints
├── public/
│   └── index.html         # Chat interface UI
├── .github/
│   └── workflows/
│       └── lint-and-build.yml  # CI/CD pipeline
├── dist/                  # Compiled JavaScript (generated)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration
└── README.md              # This file
```

## Prerequisites

- Node.js >= 18.0.0
- npm, pnpm, or yarn

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/sekka1/Moss-chat-web.git
cd Moss-chat-web
```

### 2. Install dependencies

```bash
npm install
```

## Development

### Run in development mode

```bash
npm run dev
```

This starts the server using `ts-node` in development mode.

### Build the application

```bash
npm run build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/`.

### Run in production mode

```bash
npm start
```

This runs the compiled JavaScript from the `dist/` folder.

### Lint the code

```bash
npm run lint
```

To automatically fix linting issues:

```bash
npm run lint:fix
```

### Run tests

```bash
npm test
```

Note: Test infrastructure is minimal at this stage. Tests will be expanded as the application grows.

## Application Usage

1. Start the server using one of the methods above
2. Open your browser to `http://localhost:3000`
3. You'll see the Moss Chat interface with:
   - **Top area**: Displays AI responses and chat history
   - **Bottom area**: Input box for typing questions
4. Type a question and press Enter or click Send
5. The application will display a mock AI response

## API Endpoints

### POST /api/chat

Send a message to the AI assistant.

**Request:**
```json
{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "response": "AI response here"
}
```

### GET /api/health

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

## Future Integration: GitHub Copilot SDK

The application is structured to easily integrate the GitHub Copilot SDK. The mock response handler in `src/server.ts` (function `getMockAIResponse`) is the designated place for this integration:

```typescript
// Current mock implementation
function getMockAIResponse(message: string): string {
  // TODO: Replace with GitHub Copilot SDK integration
  return "Mock response";
}
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow that automatically runs on every pull request:

- **Linting**: Ensures code quality and TypeScript standards
- **Building**: Verifies the application compiles successfully
- **Testing**: Runs the test suite
- **Multi-version**: Tests against Node.js 18.x and 20.x

The workflow is defined in `.github/workflows/lint-and-build.yml`.

## Code Quality Standards

This project follows strict TypeScript and code quality standards:

- **TypeScript Strict Mode**: No `any` types without justification
- **ESLint**: Configured for TypeScript with recommended rules
- **JSDoc Comments**: All exported functions include documentation
- **Security**: Input validation and sanitization for user inputs

See [AGENTS.md](./AGENTS.md) and [.github/copilot-instructions.md](./.github/copilot-instructions.md) for detailed coding standards.

## Development Workflow

### Before Every Commit

1. Run linting: `npm run lint`
2. Run build: `npm run build`
3. Run tests: `npm test`
4. Ensure all checks pass

### Pull Request Guidelines

- Include screenshots for any GUI changes
- Ensure CI/CD pipeline passes
- Keep PRs focused on a single concern
- Update documentation for any API changes

## Contributing

1. Follow the TypeScript coding standards in `.github/copilot-instructions.md`
2. Run linting and tests before committing
3. Keep functions small and focused
4. Document exported functions with JSDoc
5. For GUI changes, include screenshots in the PR

## License

MIT

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Linting**: ESLint
- **CI/CD**: GitHub Actions

## Environment Variables

- `PORT`: Server port (default: 3000)

## Security

This application implements security best practices:

- Input validation on API endpoints
- No hardcoded secrets
- Content Security Policy headers ready for implementation
- Safe HTML rendering (no XSS vulnerabilities)

For detailed security guidelines, see [AGENTS.md](./AGENTS.md).
