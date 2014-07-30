suite("iConvolve Library", function() {
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
            fileLoader.load("iConvolve", "library");
            fileLoader.load("objecttoarray", "library");
            fileLoader.load("UnitObject", "unitlibrary");
            script = Script;
            done();
        });
    });

    /**
     * Test case for iConvolve.
     *
     * @input       iConvolve([[1,2,3],[1,2,3]],[[4,5,6],[4,5,6]],5,5,0)
     * @expected    [[58,58,64],[58,58,64]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[58,58,64],[58,58,64]];
        var result =iConvolve([[1,2,3],[1,2,3]],[[4,5,6],[4,5,6]],5,5,0);

        assert.deepEqual(result, expected);
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.loadUnitsLib();
            var input =
            "a = iConvolve([[1,2,3],[1,2,3]],[[4,5,6],[4,5,6]],5,5,0)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(true, UnitObject.prototype.isNormal(output.__a__()));
            assert.deepEqual([[58,58,64],[58,58,64]], output.__a__().value);
            assert.ifError(output.__a__().error);
        });

        test("| Error handling", function() {
            compiler.loadUnitsLib();
            var input =
            "a = [1,2,3] ; [kg,kg,kg]\n" +
            "b = iConvolve([a,[1,2,3]],[[4,5,6],[4,5,6]],5,5,0)\n" +
            "c = iConvolve([x,[1,2,3]],[[4,5,6],[4,5,6]],5,5,0)\n" +
            "x = [1,2,3] ; d\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.deepEqual([[58,58,64],[58,58,64]], output.__b__().value);
            assert.equal(output.__b__().error, "unitError");

            assert.deepEqual([[58,58,64],[58,58,64]], output.__c__().value);
            assert.equal(output.__c__().error, "uncheckedUnit");
            assert.ok(output.__c__().isNormal());
        });
    });
});
