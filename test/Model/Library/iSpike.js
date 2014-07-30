suite("iSpike Library", function() {
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
            fileLoader.load("iSpike", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    /**
     * Test case for iSpike.
     *
     * @input       iSpike(0,0,3,3)
     * @expected    [[1,0,0],[0,0,0],[0,0,0]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[1,0,0],[0,0,0],[0,0,0]];
        var result =iSpike(0,0,3,3);

        assert.deepEqual(result, expected);
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.loadUnitsLib();
            var input =
            "a = iSpike(0,0,3,3)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(true, UnitObject.prototype.isNormal(output.__a__()));
            assert.deepEqual([[1,0,0],[0,0,0],[0,0,0]], output.__a__().value);
            assert.ifError(output.__a__().error);
        });

        test("| Error handling", function() {
            compiler.loadUnitsLib();
            var input =
            "a = 0 ; kg\n" +
            "b = iSpike(a,0,3,3)\n" +
            "c = iSpike(0,0,z,3)\n" +
            "x = 3 ; d\n" +
            "y = 3 ; kg\n" +
            "z = and(x,y)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.deepEqual([[1,0,0],[0,0,0],[0,0,0]], output.__b__().value);
            assert.equal(output.__b__().error, "unitError");

            assert.deepEqual([[1,0,0],[0,0,0],[0,0,0]], output.__c__().value);
            assert.equal(output.__c__().error, "uncheckedUnit");
            assert.ok(output.__c__().isNormal());
        });
    });
});
