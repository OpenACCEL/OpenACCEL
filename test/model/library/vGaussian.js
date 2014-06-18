suite("vGaussian Library", function() {
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
            fileLoader.load("vGaussian", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vGaussian", function() {

        /**
         * Test case for vGuassian.
         * Based on an example of the help documentation
         * 
         * input: vGaussian(6,3)
         * expected: [0.14,0.17,0.19,0.19,0.17,0.14]
         */
        test("Example from help vGaussian(6,3)=[0.14,0.17,0.19,0.19,0.17,0.14]", function() {
            eval(fileLoader.getContent());
            var expected = [0.14, 0.17, 0.19, 0.19, 0.17, 0.14];
            var result = vGaussian(6, 3);

            // round all the results to two decimals
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
         * Test case for vGuassian.
         * Based on an example of the help documentation
         * 
         * input: vGaussian(10,3)
         * expected: [0.048, 0.074, 0.10, 0.13, 0.14, 0.14, 0.13, 0.10, 0.074, 0.048]
         */
        test("Example from help vGaussian(8,3)=[0.048,0.074,0.10,0.13,0.14,0.14,0.13,0.10,0.074,0.048]", function() {
            eval(fileLoader.getContent());

            var expected = [0.048, 0.074, 0.10, 0.13, 0.14, 0.14, 0.13, 0.10, 0.074, 0.048];
            var result = vGaussian(10, 3);

            // round all the results to two decimals
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

    });
});
