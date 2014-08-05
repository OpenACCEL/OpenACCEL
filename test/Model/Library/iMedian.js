suite("iMedian Library", function() {
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
            fileLoader.load("iMedian", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    /**
     * Test case for iMedian.
     *
     * @input       iMedian([[1,2,3,4],[1,2,3,4]],5,0)
     * @expected    [[2,2,3,3],[2,2,3,3]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[2,2,3,3],[2,2,3,3]];
        var result =iMedian([[1,2,3,4],[1,2,3,4]],5,0);

        assert.deepEqual(result, expected);
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = iMedian([[1,2,3,4],[1,2,3,4]],5,0)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, UnitObject.prototype.isNormal(output.__a__()));
            assert.deepEqual([[2,2,3,3],[2,2,3,3]], output.__a__().value);
            assert.ifError(output.__a__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = 5 ; kg\n" +
            "b = iMedian([[1,2,3,4],[1,2,3,4]],a,0)\n" +
            "c = iMedian([[1,2,3,4],[1,2,3,4]],x,0)\n" +
            "x = 5 ; [d,m2]\n";
            var output = compiler.compile(new script(input));

            assert.deepEqual([[2,2,3,3],[2,2,3,3]], output.__b__().value);
            assert.equal(output.__b__().error, "unitError");

            assert.deepEqual([[2,2,3,3],[2,2,3,3]], output.__c__().value);
            assert.equal(output.__c__().error, "uncheckedUnit");
            assert.ok(output.__c__().isNormal());
        });
    });
});
