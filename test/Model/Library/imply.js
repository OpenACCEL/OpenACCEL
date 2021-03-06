suite("Imply Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("imply", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    suite("| Imply", function() {

        /**
         * Test case for imply.
         *
         * @input   imply(true, true)
         * @expected true
         */
        test("| Imply function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = true;
            output = imply(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Test case for imply.
         *
         * @input   imply(true, false)
         * @expected false
         */
        test("| Imply function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = true;
            var y = false;
            output = imply(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Test case for imply.
         *
         * @input   imply([true,false], 1)
         * @expected [1,true]
         */
        test("| Imply function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = 1;
            output = imply(x, y);
            assert.deepEqual(output, [1, true]);
        });

        /**
         * Test case for imply.
         *
         * @input   imply([true, true, false, false], [true, false, true, false])
         * @expected [true, false, true, true]
         */
        test("| Imply function with array's", function() {
            eval(fileLoader.getContent());
            var x = [true, true, false, false];
            var y = [true, false, true, false];
            output = imply(x, y);
            assert.deepEqual(output, [true, false, true, true]);
        });

        /**
         * Test case for imply.
         *
         * @input   imply([true, false], [true, [true, false]])
         * @expected [true, [true, true]]
         */
        test("| Imply function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [true, false];
            var y = [true, [true, false]];
            output = imply(x, y);
            assert.deepEqual(output, [true, [true, true]]);
        });

        /**
         * Test case for imply.
         *
         * @input   imply([[true, false], false], [true, [true, false]])
         * @expected [[true,true], [true, true]]
         */
        test("| Imply function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [
                [true, false], false
            ];
            var y = [true, [true, false]];
            output = imply(x, y);
            assert.deepEqual(output, [
                [true, true],
                [true, true]
            ]);
        });

    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of imply.
         *
         * @input   x = 5
         *          y = imply(x,4)
         * @expected y = 4
         */
        test("| Should expand for 'x = 5, y = imply(x, 4)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = imply(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), 4);
        });

        /**
         * Test case for expansion of imply.
         *
         * @input   x = 5
         *          y = imply(x,5)
         *          z = imply(x, imply(4, y))
         * @expected y = 5
         *           z = 5
         */
        test("| Should expand for 'x = 5, y = imply(x, 5), z = imply(x, imply(4, y))'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = imply(x, 5) \nz = imply(x, imply(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), 5);
            assert.equal(output.__z__(), 5);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = true\n" +
            "b = 25\n" +
            "c = imply(a,b)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__c__().isNormal());
            assert.equal(25, output.__c__().value);
            assert.ifError(output.__c__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = true ; d\n" +
            "b = false ; kg\n" +
            "c = imply(a,b)\n" +
            "z = imply(c, false)\n";
            var output = compiler.compile(new script(input));

            assert.equal(false, output.__c__().value);
            assert.equal(output.__c__().error, "unitError");

            assert.equal(true, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});
