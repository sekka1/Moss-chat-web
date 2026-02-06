# AGENTS.md

This file provides context and instructions for AI coding agents working on the Moss-chat-web project.

## Project Overview

Moss-chat-web is a TypeScript web application.

## Development Environment

### Prerequisites
- Node.js and npm/pnpm/yarn (check package.json for specific versions)
- TypeScript
- Git

### Setup
1. Clone the repository
2. Install dependencies: `npm install` (or `pnpm install`/`yarn install`)
3. Review configuration files (tsconfig.json, package.json) for project setup

## Testing Instructions

**IMPORTANT**: Always run linting and unit tests before committing and in pull requests.

### Before Every Commit
1. Run linting: `npm run lint` (or equivalent command from package.json)
2. Run unit tests: `npm test` (or equivalent command from package.json)
3. Ensure all tests pass before committing

### In Pull Requests
- All linting checks must pass
- All unit tests must pass
- Add or update tests for any code changes
- Ensure test coverage is maintained or improved

## Code Quality Standards

### TypeScript
- Use strict mode (no `any` types without justification)
- Prefer explicit types for function parameters and return values
- Use type inference where appropriate
- Document exported functions with JSDoc comments

### Testing
- Write unit tests for new features and bug fixes
- Maintain existing test patterns and conventions
- Test edge cases and error conditions
- Use descriptive test names that explain the expected behavior

## PR Workflow

### Pull Request Requirements
1. **Pre-commit checks**:
   - Linting must pass
   - All unit tests must pass
2. **Code review**: PRs require review before merging
3. **Commit messages**: Use clear, descriptive commit messages
4. **Testing**: Include tests with code changes

### Best Practices
- Keep PRs focused on a single concern
- Update documentation if changing functionality
- Respond to review comments promptly
- Ensure CI/CD checks pass before requesting review

## Boundaries and Restrictions

### DO NOT
- Commit code without running linting and tests
- Skip tests when making code changes
- Ignore TypeScript errors or warnings
- Commit secrets, API keys, or sensitive data
- Modify dependencies without justification
- Make changes to generated or vendored files without proper understanding

### DO
- Follow existing code patterns and conventions
- Write clean, maintainable code
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

## Project Structure

The project structure will be established as development progresses. Key directories and their purposes will be documented here.

## Additional Notes

- This is a TypeScript web application
- Code quality is enforced through linting and testing
- All contributions must maintain or improve code quality standards
