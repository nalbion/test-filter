/**
 * Testing multi-line javadoc comments
 * @issue 1 2
 */
describe("multi-line javadoc", function () {
  /**
   * @issue 3
   * @tag XYZ
   */
  describe('with nested describes', function () {
    /**
     * @issue 4 5
     * @skip
     */
    it('should process "its" also', function () {
    })
  })
});
