/** @issue ABC_123 ABC_456 */
describe("inline javadoc", function () {
  /** @issue ABC_789   @tag XYZ */
  describe('with nested describes', function () {
    /** @issue ABC_987 ABC_654 */
    it("should process 'it's also", function() {
    })
  })
});
