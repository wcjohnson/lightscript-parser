TODO:
  - [x] arr.0 = arr[0] syntax (test with BigInts, numericSeparators)
  - [ ] commaOrLineBreak syntax
  - [x] for
  - [x] for/in
  - [x] try/catch
  - [x] class body
  - [ ] Flow and JSX `readToken` extensions

BREAKING CHANGES:
  - Removed scientific notation from dot property access (x.1e3 is no longer valid)
  - Parens around an auto-const no longer work: `a=b` is OK -- `(a=b)` is not
