suite("paretoMax Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            console.log("Loaded 'paretoMax' module.");
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("paretoMax", "library");
            done();
        });
    });

    suite("paretoMax", function() {

        /**
         * Test case for paretoMax.
         *
         * input:paretoMax(42)
         * expected: 42
         */
        test("paretoMax(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result =paretoMax(42);

            assert.deepEqual(result, expected);
        });

    });
});
