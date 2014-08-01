suite("vSpike Library", function() {
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
            fileLoader.load("vSpike", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vSpike", function() {

        /**
         * Test case for vSpike.
         *
         * @input:vSpike(0,5)
         * @expected: [1,0,0,0,0]
         */
        test("| vSpike(0,5) = [1,0,0,0,0]", function() {
            eval(fileLoader.getContent());

            var expected = [1, 0, 0, 0, 0];
            var result = vSpike(0, 5);

            assert.deepEqual(result, expected);
        });
    });

    suite("| Units", function() {
        test("| Argument should be unitless", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = 0\n" +
            "b = 5\n" +
            "c = 0; kg\n" +
            "d = 5; kg\n" +
            "w = vSpike(a, b)\n" +
            "x = vSpike(a, d)\n" +
            "y = vSpike(c, b)\n" +
            "z = vSpike(c, d)\n";
            var expected = [1, 0, 0, 0, 0];
            var output = compiler.compile(new script(input));
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
                assert.equal(expected[i], output.__x__()[i].value);
                assert.equal(expected[i], output.__y__()[i].value);
                assert.equal(expected[i], output.__z__()[i].value);
                assert.equal(expected[i], output.__w__()[i].value);
            }
        });
    });
});
