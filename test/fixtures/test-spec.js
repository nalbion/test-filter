describe('karma test', function () {
    it('should say "Hello world!"', function () {
        expect(helloWorld()).toEqual('Hello world!');
    });

    /**
     * @issue 1
     * @status open
     */
    it('should skip open issues', function () {
        expect('this test').toBe('skipped because issue #1 is open');
    });

    /** @release 100.0.0 */
    it('should say "Hello dude!" - but not until release 100.0.0', function () {
        expect(hello('dude')).toEqual('yet to be determined');
    });
});

/**
 * @release 1.0.0
 */
describe('other test', function () {
    /**
     * @release 1.1.0
     */
    describe('with nested describe', function () {
        /**
         * @release 1.1.1
         * @status open
         */
        it('has one "it"', function () {
        })

        /**
         * @release 1.1.2
         * @issue 1
         */
        it('has another "it"', function () {
        })
    })

    /**
     * @release 1.2.0
     */
    describe('and another nested describe', function () {
        /**
         * @release 1.2.1
         * @issue 1
         */
        it('also has one "it"', function () {
        })

        /**
         * @release 1.2.2
         * @status open
         */
        it('also has another "it"', function () {
        })
    })
})

describe('specs without annotations', function () {
    describe('at any level', function () {
        it('should evaluate without annotations', function () {
        })
    })

    /**
     * @issue 2
     */
    describe('except here', function () {
        describe('and with extra level', function () {
            it('should evaluate with an issue annotation', function () {
            })
        })

        it('should still evaluate with issue annotation', function () {
        })
    })
})