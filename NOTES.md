TODO:
  - [x] arr.0 = arr[0] syntax (test with BigInts, numericSeparators)
  - [x] commaOrLineBreak syntax
  - [x] for
  - [ ] for/in
  - [x] try/catch
  - [x] class body
  - [x] Flow and JSX `readToken` extensions
  - [x] `export` autoconst
  - [ ] arrows
  - [ ] `export` arrows

BREAKING CHANGES:
  - Removed scientific notation from dot property access (x.1e3 is no longer valid)
  - Parens around an auto-const no longer work: `a=b` is OK -- `(a=b)` is not
  - `enhancedTry` removed. `try x` illegal. `try` without `catch` legal.
