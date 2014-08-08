suite("vConvolve Library", function() {
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
            fileLoader.load("vConvolve", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vConvolve", function() {

        /**
         * Test case for vConvolve.
         *
         * @input: vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 0)
         * @expected: [-2, -1, 1, 2, 0]
         */
        test("| vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 0) = [-2, -1, 1, 2, 0]", function() {
            eval(fileLoader.getContent());

            var expected = [-2, -1, 1, 2, 0];
            var result = vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 0);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vConvolve.
         *
         * @input: vConvolve([1,2,3,2,1],[-1,0,1],3,1)
         * @expected: [0,1,2,2,0]
         */
        test("| vConvolve([1,2,3,2,1],[-1,0,1],3,1) = [0,1,2,2,0]", function() {
            eval(fileLoader.getContent());

            var expected = [0, 1, 2, 2, 0];
            var result = vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 1);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vConvolve.
         *
         * @input: vConvolve([1,2,3,2,1],[-1,0,1],3,2)
         * @expected: value=[0,0,1,2,0]
         */
        test("| vConvolve([1,2,3,2,1],[-1,0,1],3,2) = value=[0,0,1,2,0]", function() {
            eval(fileLoader.getContent());

            var expected = value = [0, 0, 1, 2, 0];
            var result = vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 2);

            assert.deepEqual(result, expected);
        });
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "x = vConvolve(y, z, 3, 0)\n" +
            "y = [1, 2, 3, 2, 1] ; [kg,kg,kg,kg,kg]\n" +
            "z = [-1, 0, 1] ; [d,d,d]\n" +
            "u = vConvolve([1,2,3,2,1],[-1,0,1],3,1)\n";
            var output = compiler.compile(new script(input));

            var expected1 = UnitObject.prototype.create([-2, -1, 1, 2, 0], {'kg':1, 'd':1});
            assert.deepEqual(output.__x__(), expected1);
            assert.ifError(output.__x__().error);

            var expected2 = UnitObject.prototype.create([0,1,2,2,0], {});
            assert.deepEqual(output.__u__(), expected2);
            assert.equal(true, UnitObject.prototype.isNormal(output.__u__()));
            assert.ifError(output.__u__().error);
        });

        test("| Error Handling", function() {
            compiler.setUnits(true);
            var input =
            "x = vConvolve(y, z, w, 0)\n" +
            "y = [1, 2, 3, 2, 1] ; [kg,kg,kg,kg,kg]\n" +
            "z = [-1, 0, 1] ; [d,d,d]\n" +
            "w = 3 ; m2\n";
            var output = compiler.compile(new script(input));

            var expected1 = [-2, -1, 1, 2, 0];
            assert.deepEqual(output.__x__().value, expected1);
            assert.equal(output.__x__().error, "unitError");
        });
    });
});
