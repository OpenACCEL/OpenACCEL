suite("vLen Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(assertModule, module, FileLoader, scriptModule) {
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vLen", "library");
            done();
        });
    });

    suite("| vLen", function() {

        /**
         * Test case for vLen, numeric indices.
         *
         * @input vLen([1,2,3])
         * @expected 3
         */
        test("| Get the domain of an array with only numeric indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x[0] = 1;
            x[1] = 2;
            x[2] = 3;
            output = vLen(x);
            assert.deepEqual(output, 3);
        });

        /**
         * Test case for vLen, mixed indices.
         *
         * @input vLen([1,2,a:3])
         * @expected 2
         */
        test("| Get the domain of an array with mixed indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x[0] = 1;
            x[1] = 2;
            x["a"] = 3;
            output = vLen(x);
            assert.deepEqual(output, 2);
        });

        /**
         * Test case for vLen, named vector.
         *
         * @input vLen([a:1, b:2, c:3])
         * @expected 0
         */
        test("| Get the domain of an array with only non-numeric indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x["a"] = 1;
            x["b"] = 2;
            x["c"] = 3;
            output = vLen(x);
            assert.deepEqual(output, 0);
        });

        /**
         * Test case for vLen, high index.
         *
         * @input vLen({'5': 1})
         * @expected 6
         */
        test("| Get the domain of an array with a high number index", function() {
            eval(fileLoader.getContent());
            x = [];
            x[5] = 1;
            output = vLen(x);
            assert.deepEqual(output, 6);
        });

        /**
         * Test case for vLen, high index and named indices.
         *
         * @input vLen(2)
         * @expected 0
         */
        test("| Get the domain of an array with a high number index and named indices", function() {
            eval(fileLoader.getContent());
            x = 2;
            output = vLen(x);
            assert.deepEqual(output, 0);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of vLen.
         *
         * @input x = vLen(y)
         *        y = [1,0,0]
         * @expected x = 3
         */
        test("| Should expand for 'x = vLen(y), y = [1,0,0]'", function() {
            compiler.setUnits(false);
            var input = "x = vLen(y)\ny = [1,0,0]";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), 3);
        });
    });

    suite("| Units", function() {
        test("| Answer should always be unitless", function() {
            compiler.setUnits(true);
            var input = 
            "x = [1, 2, [3, 4]] ; [kg, s, [1, m]]\n" +
            "y = vLen(x)";
            var output = compiler.compile(new Script(input));

            assert.ifError(output.__y__().error);
            assert.equal(true, output.__y__().isNormal());
            assert.equal(3, output.__y__().value);
        });
    });
});
