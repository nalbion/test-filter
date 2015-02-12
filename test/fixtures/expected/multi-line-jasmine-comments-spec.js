/**
 * Testing multi-line javadoc comments
 * @issue 1 2
 * @status open
 * @release 1.0.0
 */
describe("inline javadoc", function () {
  /**
   * @issue 3
   * @tag XYZ
   * @status open
   * @release 2.0.0
   */
  describe('with nested describes', function () {
    /**
     * @release 2.0.0
     * @issue 4 5
     * @skip
     * @status closed
     */
    it('should process "its" also', function() {
    })
  })
});
