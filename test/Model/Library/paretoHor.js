suite("paretoHor Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader) {
            console.log("Loaded 'paretoHor' module.");
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("paretoHor", "library");
            done();
        });
    });

    suite("paretoHor", function() {

        /**
         * Test case for paretoHor.
         *
         * input:paretoHor(42)
         * expected: 42
         */
        test("paretoHor(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result =paretoHor(42);

            assert.deepEqual(result, expected);
        });

    });
});
