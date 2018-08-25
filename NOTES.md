TODO:
  - [x] arr.0 = arr[0] syntax (test with BigInts, numericSeparators)
  - [x] commaOrLineBreak syntax
  - [x] for
  - [x] for/in idx/elem/key/val
  - [x] try/catch
  - [x] class body
  - [x] Flow and JSX `readToken` extensions
  - [x] `export` autoconst
  - [x] arrows
  - [x] `export` arrows
  - [x] Named arrows should be banned in paren-free and ternary consequent except in parens.
  - [x] `<-`
  - [x] Spread loops
  - [ ] Bang calls
  - [ ] Better safecalls `?(` instead of `?.()`
  - [ ] Existentials
  - [ ] Syntactic placeholders
  - [x] TypeScript + auto-const: make sure variable declarator is an id or pattern (typescript/cast/multiple-assert-and-assign)
  - [ ] Fix all GH bugs

BREAKING CHANGES:
  - Removed scientific notation from dot property access (x.1e3 is no longer valid)
  - Parens around an auto-const no longer work: `a=b` is OK -- `(a=b)` is not
  - `enhancedTry` removed. `try x` illegal. `try` without `catch` legal.
  - "Safe await" `<!-` removed. (Use `try: <- x`) instead
  - Named arrow declarations without parenthesis are banned in paren-free contexts and in ternary consequents. Wrapping in parens fixes. (should be very rare)
  - Named arrow declarations with type parameters `f<T>(x) -> y` must have no space between the name and the `<` (`f<T>` is OK, `f <T>` is not)

OTHER CHANGES:
  - Anonymous arrow flow types are banned in methods. This was always true in LSC but not explicity documented.

MISC IDEAS:
  - Pattern matching: remove implicit dependency on runtime. require an import of the runtime; fail if not present. add compiler option to overrule and pull runtime from a specified global var.
  - Stdlib change: require lodash to be explicitly specified so it isn't silently added as s dependency
