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
            compiler.setUnits(false);
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
            compiler.setUnits(false);
            var input = "x = 5\ny = and(x, true) \nz = and(y, and(x, false))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), true);
            assert.equal(output.__z__(), false);
        });
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = true\n" +
            "b = 25\n" +
            "c = and(a,b)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().isNormal());
            assert.equal(25, output.__c__().value);
            assert.ifError(output.__c__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = false ; d\n" +
            "b = 40 ; kg\n" +
            "c = and(a,b)\n" +
            "z = and(c, true)\n";
            var output = compiler.compile(new script(input));

            assert.equal(false, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(false, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});
