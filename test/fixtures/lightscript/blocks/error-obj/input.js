// This example disambiguates between the object and whiteblock errors.
// If this were parsed as a whiteblock, it should give the "leading
// decorators must be attached to classes" error, otherwise it should give
// the "empty function body" error.
f() -> {
  @decorator
  g() ->
}
