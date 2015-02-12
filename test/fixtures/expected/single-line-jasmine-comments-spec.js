/** @issue ABC_123 ABC_456 
 * @status open
 * @release 1.0.0
 */
describe("inline javadoc", function () {
  /** @issue ABC_789   @tag XYZ 
   * @status open
   * @release 2.0.0
   */
  describe('with nested describes', function () {
    /** @issue ABC_987 ABC_654 
     * @status closed
     */
    it("should process 'it's also", function() {
    })
  })
});
