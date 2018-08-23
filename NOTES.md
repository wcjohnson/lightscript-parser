TODO:
  - [x] arr.0 = arr[0] syntax (test with BigInts, numericSeparators)
  - [x] commaOrLineBreak syntax
  - [x] for
  - [ ] for/in
  - [x] try/catch
  - [x] class body
  - [x] Flow and JSX `readToken` extensions
  - [x] `export` autoconst
  - [x] arrows
  - [ ] `export` arrows
  - [x] Named arrows should be banned in paren-free and ternary consequent except in parens.

BREAKING CHANGES:
  - Removed scientific notation from dot property access (x.1e3 is no longer valid)
  - Parens around an auto-const no longer work: `a=b` is OK -- `(a=b)` is not
  - `enhancedTry` removed. `try x` illegal. `try` without `catch` legal.
  - "Safe await" `<!-` removed. (Use `try: <- x`) instead
  - Named arrow declarations without parenthesis are banned in paren-free contexts and in ternary consequents. Wrapping in parens fixes. (should be very rare)
