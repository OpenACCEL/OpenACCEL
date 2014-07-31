suite("vSequence Library", function() {
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
            fileLoader.load("vSequence", "library");
            fileLoader.load("vSeq", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("| vSequence", function() {

        /**
         * Test case for vSequence.
         *
         * @input vSequence(2, 5)
         * @expected [2,3,4]
         */
        test("| Create a sequence from 2 through 5", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = 5;
            expected = [2, 3, 4];
            output = vSequence(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vSequence.
         *
         * @input vSequence(5, 2)
         * @expected []
         */
        test("| Create an empty sequence from 5 through 2", function() {
            eval(fileLoader.getContent());
            x = 5;
            y = 2;
            expected = [];
            output = vSequence(x, y);
            assert.deepEqual(output, expected);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of vSequence.
         *
         * @input x = vSequence(3, 7)
         * @expected  x = [3,4,5,6]
         */
        test("| Should expand for 'x = vSequence(3, 7)'", function() {
            var input = "x = vSequence(3, 7)";
            expected = [3, 4, 5, 6];
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });

    suite("| Units", function() {
        test("| Argument should be unitless", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = 1\n" +
            "b = 5\n" +
            "c = 1; kg\n" +
            "d = 5; kg\n" +
            "w = vSeq(a, b)\n" +
            "x = vSeq(a, d)\n" +
            "y = vSeq(c, b)\n" +
            "z = vSeq(c, d)\n";
            var output = compiler.compile(new Script(input));
            output.setUnits(true);

            for (var i = 0; i < 4; i++) {
                assert.ifError(output.__w__()[i].error);
                assert.ok(output.__x__()[i].error);
                assert.ok(output.__y__()[i].error);
                assert.ok(output.__z__()[i].error);

                assert.equal(true, output.__w__()[i].isNormal());
                assert.equal(true, output.__x__()[i].isNormal());
                assert.equal(true, output.__y__()[i].isNormal());
                assert.equal(true, output.__z__()[i].isNormal());
                assert.equal(i + 1, output.__w__()[i].value);
                assert.equal(i + 1, output.__x__()[i].value);
                assert.equal(i + 1, output.__y__()[i].value);
                assert.equal(i + 1, output.__z__()[i].value);
            }
        });
    });
});
