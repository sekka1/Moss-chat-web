# GitHub Copilot Instructions for TypeScript Web Application

This file provides TypeScript-specific coding standards and best practices for GitHub Copilot when working on the Moss-chat-web project.

## General TypeScript Standards

### Type Safety
- **Always use strict mode**: No `any` types without explicit justification
- **Prefer explicit types** for function parameters and return values
- **Use type inference** where the type is obvious from the assigned value
- **Use interfaces or type aliases** for complex object shapes
- **Avoid type assertions** unless absolutely necessary

### Code Style
- Use arrow functions for components, utilities, and callbacks
- Prefer `const` over `let`; avoid `var` entirely
- Use template literals for string interpolation
- Prefer destructuring for objects and arrays
- Keep functions small and single-purpose (ideally under 50 lines)

### File Conventions
- One main export per file (component, utility, class, etc.)
- File names should match their primary export
- Use descriptive, intention-revealing names
- Group related functionality in the same directory

## React/Frontend Best Practices (if applicable)

### Components
- Use functional components with hooks (no class components)
- Define prop types using TypeScript interfaces
- Use `React.FC<PropsInterface>` or explicit typing
- Memoize expensive computations with `useMemo`
- Avoid inline object/array creation in props to prevent unnecessary re-renders

### Example: Good React Component
```tsx
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onSelect?: (userId: string) => void;
}

/**
 * Displays a user card with basic information
 * @param props UserCardProps containing user data and optional callback
 * @returns JSX.Element representing the user card
 */
const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  const handleClick = () => {
    onSelect?.(user.id);
  };

  return (
    <div className="user-card" onClick={handleClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

export default UserCard;
```

## Documentation Standards

### JSDoc Comments
- **All exported functions** must include JSDoc comments
- Include `@param` for each parameter with description
- Include `@returns` with description of return value
- Document edge cases and important behavior
- Explain "why" not just "what" for complex logic

### Example: Good Function Documentation
```typescript
/**
 * Validates user email address format
 * @param email - The email address to validate
 * @returns true if email format is valid, false otherwise
 * @throws Never throws - returns false for invalid input
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

## Testing Requirements

### Test Standards
- Write tests for all new features and bug fixes
- Use descriptive test names: `it('should return error when email is invalid', ...)`
- Test happy paths and error cases
- Mock external dependencies
- Aim for meaningful coverage, not just high percentage

### Example: Good Test Structure
```typescript
describe('validateEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for email without @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

## Error Handling

### Best Practices
- Use custom error types for different error categories
- Provide meaningful error messages
- Handle errors at appropriate levels
- Don't swallow errors silently
- Log errors with sufficient context

### Example: Good Error Handling
```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function processUserData(data: unknown): User {
  if (!isValidUserData(data)) {
    throw new ValidationError('Invalid user data format');
  }
  // Process data...
}
```

## Code Quality Checklist

Before suggesting code changes, ensure:
- [ ] TypeScript strict mode compliance (no `any` without justification)
- [ ] All exported functions have JSDoc comments
- [ ] Functions are focused and single-purpose
- [ ] Proper error handling is in place
- [ ] Tests are included for new functionality
- [ ] Code follows existing patterns in the project
- [ ] No hardcoded values (use constants or configuration)
- [ ] Meaningful variable and function names

## Prohibited Actions

### NEVER
- Use `any` type without explicit justification in comments
- Ignore TypeScript errors or use `@ts-ignore` without explanation
- Create functions longer than 100 lines without good reason
- Skip writing tests for new features
- Commit code that doesn't pass linting
- Use deprecated APIs or patterns
- Introduce console.log statements (use proper logging)
- Store secrets or API keys in code

### AVOID
- Deep nesting (more than 3 levels)
- Global variables or mutable state
- Magic numbers or strings (use named constants)
- Overly complex conditionals (extract to named functions)
- Mutation of function parameters
- Side effects in utility functions

## Git and Version Control

### Commit Standards
- **ALWAYS run linting before committing**: `npm run lint`
- **ALWAYS run tests before committing**: `npm test`
- Write clear, descriptive commit messages
- Keep commits focused on single concerns
- Don't commit commented-out code
- Don't commit debugging code or console.logs

### PR Standards
- Ensure all CI/CD checks pass
- Include tests with code changes
- Update documentation for API changes
- Respond to code review feedback
- Keep PRs reasonably sized (under 500 lines when possible)

## Performance Considerations

- Avoid unnecessary re-renders in React components
- Use lazy loading for heavy components or routes
- Memoize expensive computations
- Debounce/throttle event handlers when appropriate
- Optimize bundle size (check imports, avoid unnecessary dependencies)

## Accessibility (if applicable for web app)

- Use semantic HTML elements
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers when adding UI components

## Dependencies

- Only add new dependencies when necessary
- Prefer well-maintained, popular libraries
- Check bundle size impact before adding dependencies
- Keep dependencies up to date (but test thoroughly after updates)
- Document why non-obvious dependencies are needed

---

## Quick Reference

**Before every commit:**
1. Run `npm run lint` (or project-specific linting command)
2. Run `npm test` (or project-specific test command)
3. Ensure all checks pass

**When writing code:**
- Use TypeScript strict mode
- Add JSDoc to exported functions
- Write tests for new features
- Follow existing patterns
- Keep it simple and maintainable
