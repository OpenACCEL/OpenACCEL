suite("iGaussian Library", function() {
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
            fileLoader.load("iGaussian", "library");
            fileLoader.load("and", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    /**
     * Test case for iGaussian.
     *
     * @input       iGaussian(2,2,1,4)
     * @expected    [[0.25,0.25],[0.25,0.25]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[0.25,0.25],[0.25,0.25]];
        var result = iGaussian(2,2,1,4);

        assert.deepEqual(result, expected);
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = iGaussian(2,2,1,4)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, UnitObject.prototype.isNormal(output.__a__()));
            assert.deepEqual([[0.25,0.25],[0.25,0.25]], output.__a__().value);
            assert.ifError(output.__a__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = 2 ; kg\n" +
            "b = iGaussian(a,2,1,4)\n" +
            "c = iGaussian(z,2,1,4)\n" +
            "x = 2 ; d\n" +
            "y = 2 ; kg\n" +
            "z = and(x,y)\n";
            var output = compiler.compile(new script(input));

            assert.deepEqual([[0.25,0.25],[0.25,0.25]], output.__b__().value);
            assert.equal(output.__b__().error, "unitError");

            assert.deepEqual([[0.25,0.25],[0.25,0.25]], output.__c__().value);
            assert.equal(output.__c__().error, "uncheckedUnit");
            assert.ok(output.__c__().isNormal());
        });
    });
});
