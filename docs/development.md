# 🧪 Development Guide

Complete guide for developers who want to contribute to Swinelink or extend its capabilities.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- TypeScript knowledge
- Git
- Porkbun API account (for testing)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd swinelink

# Install dependencies
npm install

# Install globally for CLI testing
npm link

# Build TypeScript
npm run build
```

## Project Structure

```
swinelink/
├── cli.js                   # CLI entry point stub
├── src/                     # TypeScript source files
│   ├── index.ts            # MCP server implementation
│   ├── cli.ts              # CLI implementation  
│   ├── config.ts           # Configuration management
│   └── porkbunClient.ts    # Porkbun API client
├── dist/                   # Compiled JavaScript output
│   ├── index.js            # Compiled MCP server
│   ├── cli.js              # Compiled CLI
│   ├── config.js           # Compiled config
│   └── porkbunClient.js    # Compiled API client
├── docs/                   # Documentation
│   ├── configuration.md    # Configuration guide
│   ├── cli-usage.md        # CLI usage guide
│   ├── mcp-integration.md  # MCP integration guide
│   └── development.md      # This file
├── tests/                  # Test files
│   └── mcp-server.test.js  # MCP server tests
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── README.md               # Project Readme
```

## Available Scripts

### Build and Run

```bash
npm run build              # Build TypeScript to JavaScript
npm run mcp                # Build and start MCP server
npm run mcp:dev            # Start MCP server in development mode
```

### CLI Usage

```bash
swinelink <command>        # Use CLI globally (after npm link)
./cli.js <command>         # Run CLI directly from project
```

### Testing

```bash
npm test                   # Run test suite
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
```

## Development Workflow

### 1. Code Organization

#### TypeScript Source (`src/`)

- **`index.ts`**: MCP server implementation with all 25 tools
- **`cli.ts`**: Command-line interface with yargs configuration
- **`config.ts`**: Configuration loading and management
- **`porkbunClient.ts`**: Porkbun API client with rate limiting

#### Key Design Principles

- **Shared client**: Both CLI and MCP use the same `porkbunClient.ts`
- **Configuration consistency**: Same config system for CLI and MCP
- **Error handling**: Consistent error handling across all interfaces
- **Rate limiting**: Built-in rate limiting respects API limits

### 2. Adding New Features

#### Adding a New CLI Command

1. **Add to `cli.ts`**:
```typescript
.command(['new-command <param>', 'nc <param>'], 'Description', (yargs) => {
  yargs.options({
    'option': { type: 'string', description: 'Option description' }
  });
}, safeExecuteCLI((argv) => {
  return pbClient.newFunction(argv.param, argv.option);
}, 'new-command'))
```

2. **Add to `porkbunClient.ts`**:
```typescript
async newFunction(param: string, option?: string): Promise<any> {
  return await this.makeRequest('/api/json/v3/new-endpoint', {
    domain: param,
    option: option
  });
}
```

3. **Add to MCP server in `index.ts`**:
```typescript
// Add to tools list
{
  name: "newFunction",
  description: "Description of new function",
  inputSchema: {
    type: "object",
    properties: {
      param: { type: "string", description: "Parameter description" },
      option: { type: "string", description: "Option description" }
    },
    required: ["param"]
  }
}

// Add tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "newFunction") {
    const { param, option } = request.params.arguments;
    const result = await pbClient.newFunction(param, option);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
  // ... other handlers
});
```

#### Adding Configuration Options

1. **Add to `config.ts`**:
```typescript
// Add environment variable loading
SWINELINK_NEW_OPTION: process.env.SWINELINK_NEW_OPTION || 'default_value',

// Add to user config template
SWINELINK_NEW_OPTION=default_value
```

2. **Add CLI option in `cli.ts`**:
```typescript
.option('new-option', {
  alias: 'n',
  type: 'string',
  description: 'New option description',
  global: true
})
```

3. **Add to middleware logic**:
```typescript
global.newOption = argv.newOption || config.NEW_OPTION;
```

### 3. Testing

#### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/mcp-server.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode during development
npm run test:watch
```

#### Test Structure

Tests are organized by component:

- **MCP Server Tests**: `tests/mcp-server.test.js`
- **CLI Tests**: `tests/cli.test.js` (to be added)
- **Config Tests**: `tests/config.test.js` (to be added)
- **API Client Tests**: `tests/porkbunClient.test.js` (to be added)

#### Writing Tests

Example test structure:

```javascript
const { describe, it, expect } = require('@jest/globals');

describe('Feature Name', () => {
  it('should do something specific', async () => {
    // Arrange
    const input = 'test-input';
    
    // Act
    const result = await functionUnderTest(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe('SUCCESS');
  });
});
```

#### Test Configuration

Create test environment files in `tests/`:

```bash
# tests/.env.test
PORKBUN_API_KEY=test_key
PORKBUN_SECRET_KEY=test_secret
SWINELINK_FRIENDLY_TEXT=true
SWINELINK_BASIC_TEXT=true
SWINELINK_HIDE_RATELIMIT_INFO=true
SWINELINK_HIDE_LINKS=true
```

### 4. Code Quality

#### TypeScript Configuration

The project uses strict TypeScript settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

#### Linting and Formatting

```bash
# Run ESLint (if configured)
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier (if configured)
npm run format
```

#### Best Practices

1. **Type Safety**: Use TypeScript interfaces for all data structures
2. **Error Handling**: Use try-catch blocks and proper error messages
3. **Rate Limiting**: Respect API rate limits in all client methods
4. **Configuration**: Make features configurable when possible
5. **Documentation**: Include JSDoc comments for public functions
6. **Testing**: Write tests for new features and bug fixes

## Debugging

### Debug Mode

Enable debug mode for detailed logging:

```bash
# CLI debug mode
swinelink -d ping
SWINE_DEBUG=1 swinelink ping

# MCP server debug mode
SWINE_DEBUG=1 npm run mcp
SWINE_DEBUG=1 node dist/index.js
```

### Debug Information Includes

- Configuration loading details
- API request/response details  
- Rate limiting information
- Error details and stack traces
- MCP protocol message details

### Common Debug Scenarios

#### API Issues

```bash
# Test API connectivity
SWINE_DEBUG=1 swinelink ping

# Check specific API calls
SWINE_DEBUG=1 swinelink domain check example.com
```

#### Configuration Issues

```bash
# Debug configuration loading
SWINE_DEBUG=1 swinelink config show

# Test different config sources
SWINE_DEBUG=1 swinelink ping -b -r
```

#### MCP Issues

```bash
# Debug MCP server startup
SWINE_DEBUG=1 node dist/index.js

# Test MCP protocol directly
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | SWINE_DEBUG=1 node dist/index.js
```

## Contributing

### Contribution Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Test thoroughly**:
   ```bash
   npm run build
   npm test
   ./cli.js ping  # Test CLI
   npm run mcp    # Test MCP server
   ```
7. **Commit your changes**: `git commit -m 'Add amazing feature'`
8. **Push to the branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

### Commit Message Guidelines

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(cli): add domain availability check command
fix(mcp): resolve rate limiting issue in MCP server
docs(readme): update installation instructions
```

### Pull Request Guidelines

1. **Clear description**: Explain what the PR does and why
2. **Test evidence**: Include test results or screenshots
3. **Documentation**: Update relevant documentation
4. **Breaking changes**: Clearly mark any breaking changes
5. **Related issues**: Reference any related GitHub issues

## Release Process

### Versioning

The project follows Semantic Versioning (semver):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Checklist

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with new features and fixes
3. **Test thoroughly**:
   ```bash
   npm run build
   npm test
   # Test CLI commands
   # Test MCP server
   ```
4. **Update documentation** if needed
5. **Create release commit**: `git commit -m "chore: release v1.2.3"`
6. **Create git tag**: `git tag v1.2.3`
7. **Push changes**: `git push origin main --tags`
8. **Create GitHub release** with changelog

### Deployment

```bash
# Build for production
npm run build

# Test the build
node dist/index.js --help
./cli.js --help

# Publish to npm (if applicable)
npm publish
```

## Troubleshooting Development Issues

### Common Issues

1. **TypeScript compilation errors**: Check `tsconfig.json` and dependencies
2. **Module resolution issues**: Ensure imports use correct paths
3. **API testing failures**: Verify API keys and network connectivity
4. **CLI linking issues**: Run `npm unlink && npm link` to refresh

### Getting Help

1. **Check existing issues** on GitHub
2. **Review documentation** in `docs/`
3. **Run with debug mode** for detailed information
4. **Create minimal reproduction** for bug reports

## Project Roadmap

### Planned Features

- [ ] Enhanced error handling, debugging detail, and recovery automation
- [ ] Add performance optimizations and spinner while CLI is waiting for results
- [ ] Auto-retry or wait for rate-limited commands
- [ ] Local audit log for command history
- [ ] Automatic configuration backup when making changes (modifying/deleting records)
- [ ] Improved test coverage
- [ ] Future Porkbun API endpoints

### Community

- [ ] Translation and I18n
- [ ] Contribution guidelines refinement
- [ ] Issue templates
- [ ] Code of conduct
- [ ] Community examples and integrations

---

**Happy coding! 🐷** Remember: "Some pig" is what we're aiming for with every contribution!