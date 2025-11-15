# 008. Bun as Runtime and Package Manager

**Status:** Accepted

**Date:** 2024-11-15

**Deciders:** jbru (project creator)

## Context

We need to choose a JavaScript runtime and package manager for development and testing. The traditional choices are:
- **Node.js** with npm/yarn/pnpm
- **Deno** 
- **Bun** (newer, all-in-one runtime)

Key requirements:
1. **TypeScript Support** - First-class TypeScript without additional tooling
2. **Fast Development** - Quick iteration cycles
3. **Testing Framework** - Built-in test runner
4. **Package Management** - Fast dependency installation
5. **Future-Proof** - Active development and community

The project is already initialized with Bun (`bun init`), but we should validate this choice.

## Decision

We will use **Bun** as the primary runtime, package manager, and test framework.

Specifically:
- **Runtime:** Bun for executing TypeScript directly
- **Package Manager:** `bun install` for dependencies
- **Test Runner:** `bun test` for testing
- **Bundler:** `bun build` for creating distribution bundles
- **Development:** `bun run` for development scripts

However, the library will be **compatible with Node.js** - users can consume it in Node.js projects.

## Consequences

### Positive Consequences

- **No Build Step for Development:** TypeScript runs directly without compilation
- **Extremely Fast:** Bun is significantly faster than Node.js for many operations
- **Built-in Test Runner:** No need for Jest, Vitest, or other test frameworks
- **Fast Package Installation:** Dependencies install much faster than npm
- **Single Tool:** Runtime, package manager, bundler, and test runner in one
- **Modern by Default:** Web APIs, ESM, and TypeScript out of the box
- **Great DX:** Fast feedback loops during development
- **Active Development:** Bun is actively developed and improving rapidly

### Negative Consequences

- **Newer Ecosystem:** Less mature than Node.js, potential compatibility issues
- **Smaller Community:** Fewer resources and examples than Node.js
- **Potential Breaking Changes:** Bun is pre-1.0, API might change
- **Library Compatibility:** Some npm packages might not work perfectly with Bun
- **Deployment Considerations:** Production environments might not have Bun installed

### Neutral Consequences

- **Learning Curve:** Developers need to learn Bun-specific APIs (though minimal)
- **CI/CD Setup:** Need to install Bun in CI pipelines
- **Docker Images:** Need Bun-compatible Docker images if containerizing

## Alternatives Considered

### Alternative 1: Node.js with tsx/ts-node

**Description:** Use Node.js as runtime with tsx or ts-node for TypeScript execution

**Pros:**
- Most mature and stable ecosystem
- Maximum compatibility
- Largest community
- Well-established in production
- Most CI/CD platforms support it natively

**Cons:**
- Slower than Bun
- Requires additional tooling for TypeScript (tsx, ts-node)
- Slower package installation (even with pnpm)
- Need separate test framework (Jest, Vitest)
- More configuration required

**Why Not Chosen:** While Node.js is more mature, Bun's speed and DX improvements are significant. Since we're building a library (not deploying a service), runtime maturity is less critical. Users can still consume our library in Node.js.

### Alternative 2: Deno

**Description:** Use Deno as an alternative modern runtime

**Pros:**
- Built-in TypeScript support
- Secure by default
- Modern standard library
- Built-in test runner
- Fast package management

**Cons:**
- Smaller ecosystem than Node.js
- Different module system (URL imports)
- Less npm compatibility (though improving)
- Smaller community than Node.js or Bun
- Different deployment story

**Why Not Chosen:** Deno's focus on security and URL imports doesn't align well with building an npm library. Bun has better npm compatibility.

### Alternative 3: Node.js with native TypeScript support

**Description:** Wait for Node.js to add native TypeScript support (experimental in v20)

**Pros:**
- Best of both worlds eventually
- Node.js maturity + TypeScript support
- No additional runtime needed

**Cons:**
- Still experimental/incomplete
- Slower than Bun
- Still need package manager decisions
- Still need test framework

**Why Not Chosen:** Too far off from production-ready. Bun is available and stable enough today.

## References

- [Bun Documentation](https://bun.sh/docs)
- [Bun vs Node.js Performance](https://bun.sh/docs/runtime/benchmarks)
- [Bun Test Runner](https://bun.sh/docs/cli/test)
- [TypeScript in Bun](https://bun.sh/docs/runtime/typescript)

## Notes

### Node.js Compatibility

While we develop with Bun, the library will work in Node.js environments:

1. We'll build the library to standard JavaScript
2. Users import from npm like any other package
3. Only developers need Bun for development

### Migration Path

If Bun proves problematic, we can migrate to Node.js relatively easily:
- The code is standard TypeScript
- Tests can be migrated to Vitest/Jest
- Package management can switch to pnpm
- Build process can use tsc or esbuild

### CI/CD Setup

We'll need to install Bun in GitHub Actions:

```yaml
- uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest
```

### Performance Benefits

Bun's speed helps in several areas:
- **Test execution** - Faster feedback during development
- **Dependency installation** - Faster CI/CD pipelines
- **Development iteration** - No compilation wait times

The speed improvements add up over the course of development and significantly improve DX.
