/**
 * Testing multi-line javadoc comments
 * @issue ABC_123 ABC_456
 * @status open
 * @release 1.0.0
 */
describe("inline javadoc", function () {
  /**
   * @issue ABC_789
   * @tag XYZ
   * @status open
   * @release 2.0.0
   */
  describe('with nested describes', function () {
    /**
     * @release 2.0.0
     * @issue ABC_987 ABC_654
     * @skip
     * @status closed
     */
    it('should process "its" also', function() {
    })
  })
});
