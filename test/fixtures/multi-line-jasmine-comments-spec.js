/**
 * Testing multi-line javadoc comments
 * @issue 1 2
 */
describe("inline javadoc", function () {
  /**
   * @issue 3
   * @tag XYZ
   */
  describe('with nested describes', function () {
    /**
     * @release 2.0.0
     * @issue 4 5
     * @skip
     */
    it('should process "its" also', function() {
    })
  })
});