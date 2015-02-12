/** @issue 1 2 
 * @status open
 * @release 1.0.0
 */
describe("inline javadoc", function () {
  /** @issue 3   @tag XYZ 
   * @status open
   * @release 2.0.0
   */
  describe('with nested describes', function () {
    /** @issue 4 5 
     * @status closed
     */
    it("should process 'it's also", function () {
    })
  })
});
