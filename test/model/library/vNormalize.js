suite("vNormalize Library", function() {
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
            fileLoader.load("vNormalize", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vNormalize", function() {

        /**
         * Test case for vNormalize.
         * Based on an example of the help documentation
         *
         * input: vNormalize([1,1,1])
         * expected: [0.58,0.58,0.58]
         */
        test("vNormalize([1,1,1]) = [0.58,0.58,0.58]", function() {
            eval(fileLoader.getContent());

            var expected = [0.58,0.58,0.58];
            var result = vNormalize([1,1,1]);

            result = result.map(function(num) {
                var i = 1;
                while (num < 10) {
                    num *= 10;
                    i /= 10;
                }
                return Math.round(num) * i;
            });

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormalize.
         *
         * input: vNormalize([])
         * expected: []
         */
        test("vNormalize([]]) = []", function() {
            eval(fileLoader.getContent());

            var expected = [];
            var result = vNormalize([]);

            assert.deepEqual(result, expected);
        });

        
        /**
         * Test case for vNormalize.
         *
         * input: vNormalize(5)
         * expected: 1
         */
        test("vNormalize(5) = 1", function() {
            eval(fileLoader.getContent());

            var expected = 1;
            var result = vNormalize(5);

            assert.deepEqual(result, expected);
        });


    });
});
