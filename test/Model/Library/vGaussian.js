suite("vGaussian Library", function() {
    var compiler;
    var macros;
    var assert;
    var script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader, Script) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("vGaussian", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vGaussian", function() {

        /**
         * Test case for vGuassian.
         * Based on an example of the help documentation
         *
         * @input: vGaussian(6,3)
         * @expected: [0.14,0.17,0.19,0.19,0.17,0.14]
         */
        test("| Example from help vGaussian(6,3)=[0.14,0.17,0.19,0.19,0.17,0.14]", function() {
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
         * @input: vGaussian(10,3)
         * @expected: [0.048, 0.074, 0.10, 0.13, 0.14, 0.14, 0.13, 0.10, 0.074, 0.048]
         */
        test("| Example from help vGaussian(8,3)=[0.048,0.074,0.10,0.13,0.14,0.14,0.13,0.10,0.074,0.048]", function() {
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

    suite("| Units", function() {
        test("| Argument should be unitless", function() {
            compiler.setUnits(true);
            var input = 
            "a = 6\n" +
            "b = 3\n" +
            "c = 6; kg\n" +
            "d = 3; kg\n" +
            "w = vGaussian(a, b)\n" +
            "x = vGaussian(a, d)\n" +
            "y = vGaussian(c, b)\n" +
            "z = vGaussian(c, d)\n";
            var expected = [0.14,0.17,0.19,0.19,0.17,0.14];
            var output = compiler.compile(new script(input));

            // round all the results to two decimals

            for (var i = 0; i < 5; i++) {
                assert.ifError(output.__w__()[i].error);
                assert.ok(output.__x__()[i].error);
                assert.ok(output.__y__()[i].error);
                assert.ok(output.__z__()[i].error);

                assert.equal(true, output.__w__()[i].isNormal());
                assert.equal(true, output.__x__()[i].isNormal());
                assert.equal(true, output.__y__()[i].isNormal());
                assert.equal(true, output.__z__()[i].isNormal());
                assert.equal(expected[i], Math.round(output.__x__()[i].value * 100) / 100);
                assert.equal(expected[i], Math.round(output.__y__()[i].value * 100) / 100);
                assert.equal(expected[i], Math.round(output.__z__()[i].value * 100) / 100);
                assert.equal(expected[i], Math.round(output.__w__()[i].value * 100) / 100);
            }
        });
    });
});
