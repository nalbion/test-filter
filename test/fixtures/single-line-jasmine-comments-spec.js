/** @issue 1 2 */
describe("inline javadoc", function () {
  /** @issue 3   @tag XYZ */
  describe('with nested describes', function () {
    /** @issue 4 5 */
    it("should process 'it's also", function() {
    })
  })
});