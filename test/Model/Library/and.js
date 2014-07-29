suite("And Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("and", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    suite("| Function", function() {
        /**
         * true AND true == true
         *
         * @input:      x = true
         *              y = true
         * @expected:   and(x, y) == true
         */
        test("| And function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = true;
            output = and(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * true AND false == false
         *
         * @input:      x = true
         *              y = false
         * @expected:   and(x, y) == false
         */
        test("| And function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = false;
            output = and(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * true AND [true, false] == [true, false]
         *
         * @input:      x = true
         *              y = [true, false]
         * @expected:   and(x, y) == [true, false]
         */
        test("| And function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = [true, false];
            output = and(x, y);
            assert.deepEqual(output, [true, false]);
        });

        /**
         * [true, true, false, false] AND [true, false, true, false] == [true, false, false, false]
         *
         * @input:      x = [true, true, false, false]
         *              y = [true, false, true, false]
         * @expected:   and(x, y) == [true, false, true, false]
         */
        test("| And function with array's", function() {
            eval(fileLoader.getContent());
            var x = [true, true, false, false];
            var y = [true, false, true, false];
            output = and(x, y);
            assert.deepEqual(output, [true, false, false, false]);
        });

        /**
         * [true, false] AND [true, [true, false]] == [true, [false, false]]
         *
         * @input:      x = [true, false]
         *              y = [true, [true, false]]
         * @expected:   and(x, y) == [true, [false, false]]
         */
        test("| And function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = [true, [true, false]];
            output = and(x, y);
            assert.deepEqual(output, [true, [false, false]]);
        });

        /**
         * [[true, false], false] AND [true, [true, false]] == [[true, false], [false, false]]
         *
         * @input:      x = [[true, false], false]
         *              y = [true, [true, false]]
         * @expected:   and(x, y) == [[true, false], [false, false]]
         */
        test("and function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [
                [true, false], false
            ];
            var y = [true, [true, false]];
            output = and(x, y);
            assert.deepEqual(output, [
                [true, false],
                [false, false]
            ]);
        });
    });

    suite("| Compiled", function() {
        /**
         * And function should work from the executable.
         *
         * @input:      x = 5
         *              y = and(x, true)
         * @expected:   y = true
         */
        test("| Should expand for 'x = 5, y = and(x, true)'", function() {
            var input = "x = 5\ny = and(x, true)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
        });

        /**
         * And function should work from the executable.
         *
         * @input:      x = 5
         *              y = and(x, true)
         *              z = and(y, and(x, false))
         * @expected:   y = true
         *              z = false
         */
        test("| Should expand for 'x = 5, y = and(x, true), z = and(y, and(x, false))'", function() {
            var input = "x = 5\ny = and(x, true) \nz = and(y, and(x, false))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
            assert.equal(output.__z__(), false);
        });
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.loadUnitsLib();
            var input =
            "x = true\n" +
            "y = false\n" +
            "z = and(x, y)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(true, output.__z__().isNormal());
            assert.equal(false, output.__z__().value);
            assert.ifError(output.__z__().error);
        });

        test("| Error handling", function() {
            compiler.loadUnitsLib();
            var input =
            "a = 25; kg\n" +
            "b = 24\n" +
            "z = and(a,b)\n" +
            "y = and(z,b)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(24, output.__z__().value);
            assert.equal(output.__z__().error, "unitError");

            assert.equal(24, output.__y__().value);
            assert.equal(output.__y__().error, "uncheckedUnit");
            assert.ok(output.__y__().isNormal());
        });
    });
});
