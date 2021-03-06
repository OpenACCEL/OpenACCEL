suite("vDom Library", function() {
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
            fileLoader.load("vDom", "library");
            done();
        });
    });

    suite("| vDom", function() {

        /**
         * Test case for vDom, numerical indices.
         *
         * @input vDom([1,2,3])
         * @expected [0,1,2]
         */
        test("| Get the domain of an array with only numeric indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x[0] = 1;
            x[1] = 2;
            x[2] = 3;
            output = vDom(x);
            expected = [0, 1, 2];
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vDom, mixed indices.
         *
         * @input vDom([1,2,a:3])
         * @expected [0,1,"a"]
         */
        test("| Get the domain of an array with mixed indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x[0] = 1;
            x[1] = 2;
            x["a"] = 3;
            output = vDom(x);
            expected = [0, 1, "a"];
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vDom, mixed indices.
         *
         * @input vDom([a:1,b:2,c:3])
         * @expected ["a","b","c"]
         */
        test("| Get the domain of an array with only non-numeric indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x["a"] = 1;
            x["b"] = 2;
            x["c"] = 3;
            output = vDom(x);
            expected = ["a", "b", "c"];
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vDom, mixed indices.
         *
         * @input vDom({'5' : 1})
         * @expected [0, 1, 2, 3, 4, 5]
         */
        test("| Get the domain of an array with a high number index", function() {
            eval(fileLoader.getContent());
            x = [];
            x[5] = 1;
            output = vDom(x);
            expected = [0, 1, 2, 3, 4, 5];
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vDom, mixed indices.
         *
         * @input vDom({'5' : 1, 'a': 1, 'b': 2})
         * @expected [0, 1, 2, 3, 4, 5, "a", "b"];
         */
        test("| Get the domain of an array with a high number index and named indices", function() {
            eval(fileLoader.getContent());
            x = [];
            x[5] = 1;
            x["a"] = 1;
            x["b"] = 2;
            output = vDom(x);
            expected = [0, 1, 2, 3, 4, 5, "a", "b"];
            assert.deepEqual(output, expected);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion for vDom.
         *
         * @input x = vDom(y)
         *        y = [1,0,0]
         * @expected x = [0,1,2]
         */
        test("| Should expand for 'x = vDom(y), y = [1,0,0]'", function() {
            compiler.setUnits(false);
            var input = "x = vDom(y)\ny = [1,0,0]";
            expected = [0, 1, 2];
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });

    suite("| Units", function() {
        test("| All returned values should be normal", function() {
            compiler.setUnits(true);
            var input = 
            "x = [5, ['x': 6], 7, y: 10] ; [kg, [x: s], m, y: lum]\n" +
            "y = vDom(x)";
            var output = compiler.compile(new Script(input));

            var y = output.__y__();
            assert.ifError(y.error);
            assert.equal(true, y[0].isNormal());
            assert.equal(true, y[1].isNormal());
            assert.equal(true, y[2].isNormal());
            assert.equal(true, y[3].isNormal());

            assert.equal(0, y[0].value);
            assert.equal(1, y[1].value);
            assert.equal(2, y[2].value);
            assert.equal('y', y[3].value);
        });
    });
});
