suite("vMatSolve Library", function() {
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
            fileLoader.load("Functions", "library");
            script = Script;
            done();
        });
    });

    suite("vMatSolve", function() {

        /**
         * Test case for vMatSolve.
         *
         * @input:vMatSolve([[1,2],[3,4]],[1,2])
         * @expected: [0,0.50]
         */
        test("m=vMatSolve([[1,2],[3,4]],[1,2]) = [0,0.50]", function() {
            eval(fileLoader.getContent());

            var expected = [0, 0.50];
            var result = vMatSolve([
                [1, 2],
                [3, 4]
            ], [1, 2]);

            assert.deepEqual(result, expected);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.loadUnitsLib();
            var input =
            "a = [[1,2],[3,4]] ; [[kg, kg], [kg, kg]]\n" +
            "b = [1,2] ; [kg2, kg2]\n" +
            "z = vMatSolve(a,b)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            var expected = UnitObject.prototype.create([0, 0.50], {'kg':1});
            assert.deepEqual(output.__z__(), expected);
            assert.ifError(output.__z__().error);
        });
    });
});
