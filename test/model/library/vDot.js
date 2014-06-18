suite("vDot Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vDot", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vDot", function() {

        /**
         * Test case for vDot, two vectors.
         *
         * @input vDot([2,5], [3,7])
         * @expected 41
         */
        test("dot product of two vectors", function() {
            eval(fileLoader.getContent());
            x = [2, 5];
            y = [3, 7];
            expected = 41;
            output = vDot(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vDot, two named vectors.
         *
         * @input vDot([a: 2,b: 3, c: 4], [a:2, b: 3, d :4])
         * @expected 13
         */
        test("dot product of two named vectors", function() {
            eval(fileLoader.getContent());
            x = {};
            x['a'] = 2;
            x['b'] = 3;
            x['c'] = 4;
            y = {};
            y['a'] = 2;
            y['b'] = 3;
            y['d'] = 4;
            expected = 13;
            output = vDot(x, y);
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        /**
         * Test case for expansion of vDot.
         *
         * @input x = vDot(z, y)
         *        y = [[1, 1],[0, -1]]
         *        z = [[2, 4],[3, 5]]
         * @expected 6
         */
        test("should expand for 'x = vDot(z, y), y = [[1, 1],[0, -1]], z = [[2, 4],[3, 5]]'", function() {
            var input = "x = vDot(z, y)\ny = [1, 1]\nz = [2, 4]";
            expected = 6;
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });
});
