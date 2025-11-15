# 001. TypeScript Over JavaScript

**Status:** Accepted

**Date:** 2024-11-15

**Deciders:** jbru (project creator)

## Context

We need to choose a language for implementing the Yahoo Fantasy Sports API wrapper. The primary goals are:

1. **Developer Experience (DX)** - The library should be self-documenting and provide excellent IDE support
2. **Type Safety** - Reduce runtime errors by catching issues at compile time
3. **API Complexity** - Yahoo's API has many resources, sub-resources, filters, and sport-specific variations
4. **Maintainability** - The codebase should be easy to understand and extend

JavaScript is the standard for Node.js packages, but TypeScript offers static typing and better tooling support. Given that this library wraps a complex external API with many variations, type safety becomes critical.

## Decision

We will implement the entire library in **TypeScript** with strict type checking enabled.

Specific TypeScript configuration:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Key aspects:
- **Every response** will be fully typed
- **Every parameter** will have type constraints
- **Every error** will be typed
- **Sport-specific variations** will use TypeScript's type system (generics, discriminated unions)
- **Full JSDoc comments** on all public APIs with examples

## Consequences

### Positive Consequences

- **Self-Documenting API:** Developers get inline documentation via IntelliSense without leaving their IDE
- **Compile-Time Safety:** Many errors caught before runtime (invalid keys, wrong parameter types, etc.)
- **Better Refactoring:** TypeScript's compiler helps with safe refactoring
- **IDE Support:** Autocomplete for resource methods, filters, and properties
- **Type Inference:** Smart type narrowing based on sport/context (e.g., NHL vs NFL positions)
- **Reduced Documentation Burden:** Types serve as living documentation

### Negative Consequences

- **Compilation Step:** Additional build step compared to pure JavaScript
- **Learning Curve:** Contributors need TypeScript knowledge
- **Type Complexity:** Some advanced types may be complex (especially generics for sport variations)
- **Build Time:** TypeScript compilation adds to build time (though minimal with Bun)

### Neutral Consequences

- **Bundle Size:** TypeScript compiles to JavaScript, so runtime size is the same
- **Tooling Requirements:** Developers need TypeScript-aware editors (most modern editors support this)

## Alternatives Considered

### Alternative 1: JavaScript with JSDoc Type Annotations

**Description:** Use plain JavaScript but add JSDoc comments with type information for IDE support

**Pros:**
- No compilation step
- No TypeScript learning curve
- Can still get some IDE support

**Cons:**
- JSDoc types are less powerful than TypeScript
- No compile-time type checking
- Type errors only caught at runtime or by linters
- Harder to maintain type accuracy
- No type inference or advanced type features

**Why Not Chosen:** Insufficient type safety for the complexity of Yahoo's API. JSDoc is great for simple projects but falls short for complex type relationships.

### Alternative 2: JavaScript with Separate Type Definitions

**Description:** Write implementation in JavaScript, maintain separate `.d.ts` files

**Pros:**
- Separation of implementation and types
- Familiar JavaScript syntax for implementation

**Cons:**
- Types and implementation can drift out of sync
- Duplicate effort maintaining both
- Harder to refactor safely
- No type checking during development

**Why Not Chosen:** Too much maintenance burden and risk of types not matching implementation.

### Alternative 3: Flow

**Description:** Use Flow instead of TypeScript for static typing

**Pros:**
- Static type checking like TypeScript
- Less verbose type syntax in some cases

**Cons:**
- Much smaller ecosystem than TypeScript
- Less IDE support
- Declining popularity and support
- Fewer developers familiar with it
- Less powerful type inference

**Why Not Chosen:** TypeScript has won the static typing war in the JavaScript ecosystem. Flow is declining in adoption.

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive - Why TypeScript](https://basarat.gitbook.io/typescript/getting-started/why-typescript)
- [Bun TypeScript Support](https://bun.sh/docs/runtime/typescript)

## Notes

The choice of TypeScript aligns perfectly with the project's core philosophy: **the library should be fully self-documenting and provide a quality DX**. TypeScript's type system allows us to encode Yahoo's API structure, constraints, and variations directly into the type system, making it impossible to misuse the API in many cases.

Examples of how TypeScript helps:
- Can't pass an NFL position to an NHL league
- Can't use week-based methods on date-based sports
- Can't access properties that don't exist on a resource
- Can't pass invalid filter parameters

This is exactly the kind of guardrails that make for excellent DX.
