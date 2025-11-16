# Contributing to yfs-api

Thank you for your interest in contributing to yfs-api! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, professional, and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/spiflicate/yfs-api.git
   cd yfs-api
   ```
3. **Install dependencies**:
   ```bash
   bun install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or later
- Yahoo Developer [Application](https://developer.yahoo.com/apps/create/) (for API testing)

### Running Tests

```bash
# Unit tests
bun test tests/unit

# Integration tests (requires .env.test setup)
bun test tests/integration

# Type checking
bun run type-check

# Lint
bun run lint

# Format
bun run format
```

### Code Style

- Use **TypeScript** for all code
- Follow existing code patterns and naming conventions
- Add **comprehensive JSDoc comments** with examples
- Use **descriptive variable names**
- Keep functions focused and single-purpose

### Type Definitions

When adding or modifying types:

1. Add JSDoc comments with:

   - Clear description
   - `@example` with code samples
   - Links to Yahoo API docs if applicable

2. Mark optional fields with `?`

3. Use unions for known values:
   ```typescript
   type Status = "active" | "inactive" | "suspended";
   ```

### Adding New Resources

If adding a new Yahoo API resource:

1. Create type definitions in `src/types/resources/`
2. Create resource client in `src/resources/`
3. Add resource to main client in `src/client/YahooFantasyClient.ts`
4. Export types from `src/types/index.ts`
5. Add unit tests in `tests/unit/resources/`
6. Add integration tests in `tests/integration/resources/`
7. Add examples in `examples/`
8. Update documentation

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add team matchup support`
- `fix: handle nested arrays in player parsing`
- `docs: update README with OAuth examples`
- `test: add integration tests for league resource`
- `refactor: simplify token refresh logic`

## Testing

### Unit Tests

- Test individual functions and classes
- Mock external dependencies
- Focus on edge cases and error handling

### Integration Tests

- Test real API interactions
- Require valid Yahoo API credentials
- See `docs/INTEGRATION_TEST_SETUP.md` for setup

### Adding Tests

When adding functionality:

1. Write unit tests for core logic
2. Add integration tests if touching API calls
3. Ensure all tests pass before submitting PR

## Documentation

### Code Documentation

- Every exported type, interface, and function needs JSDoc
- Include `@example` blocks showing usage
- Explain "why" not just "what" in comments

### README Updates

Update README.md if you:

- Add new features
- Change API surface
- Add new examples

### Design Documentation

For architectural changes, add or update:

- Architecture Decision Records (ADRs) in `design/decisions/`
- Plans in `design/plans/`

## Pull Request Process

1. **Update tests** - All tests should pass
2. **Update documentation** - README, JSDoc, examples
3. **Run linting** - `bun run lint:fix`
4. **Build successfully** - `bun run build`
5. **Create PR** with clear description:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Any breaking changes

### PR Title Format

- `feat: description` - New features
- `fix: description` - Bug fixes
- `docs: description` - Documentation only
- `test: description` - Test updates
- `refactor: description` - Code refactoring
- `chore: description` - Maintenance tasks

## Areas for Contribution

### High Priority

- [ ] NFL/MLB/NBA sport-specific types refinement
- [ ] Transaction API testing and validation
- [ ] Performance optimizations
- [ ] Additional examples for different sports

### Medium Priority

- [ ] Caching layer for repeated requests
- [ ] Rate limiting improvements
- [ ] Better error messages
- [ ] TypeScript strict mode compliance

### Documentation

- [ ] Video tutorials
- [ ] More code examples
- [ ] Migration guides
- [ ] API comparison with other libraries

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to yfs-api! 🎉
