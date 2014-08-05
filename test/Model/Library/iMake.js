suite("iMake Library", function() {
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
            fileLoader.load("iMake", "library");
            fileLoader.load("objecttoarray", "library");
            fileLoader.load("UnitObject", "unitlibrary");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library")
;            script = Script;
            done();
        });
    });

    /**
     * Test case for iMake.
     *
     * @input       iMake(3,2,2)
     * @expected    [[3,3],[3,3]]
     */
    test("| Test #1", function() {
        eval(fileLoader.getContent());

        var expected = [[3,3],[3,3]];
        var result =iMake(3,2,2);

        assert.deepEqual(result, expected);
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = iMake(7,2,3)\n" +
            "b = 25 ; kg\n" +
            "c = iMake(b,2,2)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, UnitObject.prototype.isNormal(output.__a__()));
            assert.deepEqual(UnitObject.prototype.create([[7,7,7],[7,7,7]]), output.__a__());
            assert.ifError(output.__a__().error);

            assert.deepEqual(UnitObject.prototype.create([[25,25],[25,25]], {'kg':1}), output.__c__());
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
