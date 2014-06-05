suite("vNormEuclid Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            console.log("Loaded 'vNormEuclid' module.");
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("vNormEuclid", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vNormEuclid", function() {

        /**
         * Test case for vNormEuclid.
         * Based on an example of the help documentation
         *
         * input:vNormEuclid([2,2,2])
         * expected: 2 sqrt(3)
         */
        test("vNormEuclid([2,2,2]) = 2 sqrt(3)", function() {
            eval(fileLoader.getContent());

            var expected = 2 * Math.sqrt(3);
            var result =vNormEuclid([2,2,2]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormEuclid.
         *
         * input:vNormEuclid(42)
         * expected: 42
         */
        test("vNormEuclid(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result =vNormEuclid(42);

            assert.deepEqual(result, expected);
        });
    });
});
