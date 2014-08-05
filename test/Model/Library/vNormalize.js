suite("vNormalize Library", function() {
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
            fileLoader.load("vNormalize", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vNormalize", function() {

        /**
         * Test case for vNormalize.
         * Based on an example of the help documentation
         *
         * @input: vNormalize([1,1,1])
         * @expected: [0.58,0.58,0.58]
         */
        test("| vNormalize([1,1,1]) = [0.58,0.58,0.58]", function() {
            eval(fileLoader.getContent());

            var expected = [0.58, 0.58, 0.58];
            var result = vNormalize([1, 1, 1]);

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
         * @input: vNormalize([])
         * @expected: []
         */
        test("| vNormalize([]) = []", function() {
            eval(fileLoader.getContent());

            var expected = [];
            var result = vNormalize([]);

            assert.deepEqual(result, expected);
        });


        /**
         * Test case for vNormalize.
         *
         * @input: vNormalize(5)
         * @expected: 1
         */
        test("| vNormalize(5) = 1", function() {
            eval(fileLoader.getContent());

            var expected = 1;
            var result = vNormalize(5);

            assert.deepEqual(result, expected);
        });
    });

    suite("| Units", function() {
        test("| Equal dimensions", function() {
            compiler.setUnits(true);
            var input = 
            "a = [10, 10, 10]; [kg, kg, 1]\n" +
            "b = [10, 10, 10]; [kg, 1, kg]\n" +
            "d = [10, 10, 10]; [1, kg, kg]\n" +
            "e = [10, 10, 10]; [kg, 1, 1]\n" +
            "f = [10, 10, 10]; [1, kg, 1]\n" +
            "g = [10, 10, 10]; [1, 1, kg]\n" +
            "h = [10, 10, 10]; [kg, kg, kg]\n" +
            "i = [10, 10, 10]; [1, 1, 1]\n" +

            "k = vNormalize(a)\n" + 
            "l = vNormalize(b)\n" + 
            "m = vNormalize(d)\n" + 
            "n = vNormalize(e)\n" + 
            "o = vNormalize(f)\n" + 
            "p = vNormalize(g)\n" + 
            "q = vNormalize(h)\n" + 
            "r = vNormalize(i)\n";
            var output = compiler.compile(new script(input));

            for (var i = 0; i < 3; i++) {
                assert.ok(output.__k__()[i].error);
                assert.ok(output.__l__()[i].error);
                assert.ok(output.__m__()[i].error);
                assert.ok(output.__n__()[i].error);
                assert.ok(output.__o__()[i].error);
                assert.ok(output.__p__()[i].error);
                assert.ifError(output.__q__()[i].error);
                assert.ifError(output.__r__()[i].error);

                assert.equal(true, output.__q__()[i].isNormal());
                assert.equal(true, output.__r__()[i].isNormal());

                assert.equal(0.58, Math.round(output.__k__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__l__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__m__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__n__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__o__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__p__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__q__()[i].value * 100) / 100);
                assert.equal(0.58, Math.round(output.__r__()[i].value * 100) / 100);
           }
        });
    });
});
