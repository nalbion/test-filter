describe('web test', function () {
    it('should say "Hello world!"', function () {
        expect(helloWorld()).toEqual('Hello world!');
    });

    /** @release 100.0.0 */
    it('should say "Hello dude!" - but not until release 100.0.0', function () {
        expect(hello('dude')).toEqual('yet to be determined');
    });
});