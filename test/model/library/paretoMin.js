suite("paretoMin Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            console.log("Loaded 'paretoMin' module.");
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("paretoMin", "library");
            done();
        });
    });

    suite("paretoMin", function() {

        /**
         * Test case for paretoMin.
         *
         * input:paretoMin(42)
         * expected: 42
         */
        test("paretoMin(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result =paretoMin(42);

            assert.deepEqual(result, expected);
        });

    });
});
