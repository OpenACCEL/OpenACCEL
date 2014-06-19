suite("vMatInverse Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("functions", "library");
            done();
        });
    });

    suite("vMatInverse", function() {

        /**
         * Test case for vMatInverse.
         *
         * @input: vMatInverse(vMatInverse([[3,4,5],[23,56,67],[1,8,7]]))
         * @expected: [[3.0,4.0,5.0],[23,56,67],[1.0,8,7]]
         */
        test("vMatInverse(vMatInverse([[3,4,5],[23,56,67],[1,8,7]])) = [[3.0,4.0,5.0],[23,56,67],[1.0,8,7]]", function() {
            eval(fileLoader.getContent());

            var expected = [[3.0,4.0,5.0],[23,56,67],[1.0,8,7]];
            var result = vMatInverse(vMatInverse([[3,4,5],[23,56,67],[1,8,7]]));
            var delta = 0.1;
            function checkIt(actual, exp) {
                if (actual instanceof Object) {
                    for (var key in actual) {
                        checkIt(actual[key], exp[key]);
                    }
                } else {
                    assert(Math.abs(actual - exp) < delta );
                }
            }

            checkIt(result, expected);
        });

    });
});
