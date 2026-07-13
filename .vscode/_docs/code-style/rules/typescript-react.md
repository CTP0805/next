## TypeScript and React

- Avoid `any`; prefer explicit types.
- Use `interface` for component props.
- Add `"use client"` only to interactive components.
- Prefer named exports for non-page components.

## TypeScript Strict Type Safety and Anti-Hallucination Guidelines

1. **Strictly follow Type/Interface definitions**:
   - Only use properties and methods that are explicitly declared on `type`, `interface`, or `class` definitions available in the current context.
   - **Never fabricate object properties, optional fields, method names, function parameters or types, package APIs, third-party service endpoints, or response fields.**

2. **Do not bypass the type system**:
   - Never use `as any` or fabricated concrete type assertions such as `as MyMadeUpType`.
   - Never use the non-null assertion operator (`obj!.property`) to bypass null checks.
   - Never suppress errors with `// @ts-ignore` or `// @ts-expect-error`.
   - **`unknown` is allowed**: external or untrusted input may start as `unknown`, but it must be narrowed with type guards, `in`, `Array.isArray`, `satisfies`, or similar techniques before use. Do not force-cast with `as SomeType` just to skip checks.
   - If the current context lacks a type definition for a specific object, keep it as `unknown` or ask the user to provide an interface. Do not guess and fill in fabricated field names.

3. **Safely handle missing properties**:
   - If the code logic needs a property that does not exist in the current type definitions, you **must not** invent it.
   - Use one of the following approaches instead:
     1. Add a nearby comment: `// TODO: ensure the actual type includes this property`.
     2. Or use a generic/placeholder type and clearly warn the user in your response.
