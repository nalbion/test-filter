/**
 * Testing multi-line javadoc comments
 * @issue ABC_123 ABC_456
 */
describe("inline javadoc", function () {
  /**
   * @issue ABC_789
   * @tag XYZ
   */
  describe('with nested describes', function () {
    /**
     * @release 2.0.0
     * @issue ABC_987 ABC_654
     * @skip
     */
    it('should process its also', function() {
    })
  })
});