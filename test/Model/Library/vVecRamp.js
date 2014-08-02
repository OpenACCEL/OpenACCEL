suite("vVecRamp Library", function() {
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
            fileLoader.load("vVecRamp", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("vVecRamp", function() {
        /**
         * Test case for vVecRamp.
         *
         * @input: vVecRamp([10,20,30,40],[0,100,150,0],30)
         * @expected: 150
         */
        test("vVecRamp([10,20,30,40],[0,100,150,0],30) = 150", function() {
            eval(fileLoader.getContent());

            var expected = 150;
            var result = vVecRamp([10, 20, 30, 40], [0, 100, 150, 0], 30);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vVecRamp.
         *
         * @input: vVecRamp([100,80,60,40],[0,5,10,0],90)
         * @expected: 2.5
         */
        test("vVecRamp([100,80,60,40],[0,5,10,0],90) = 2.5", function() {
            eval(fileLoader.getContent());

            var expected = 2.5;
            var result = vVecRamp([100, 80, 60, 40], [0, 5, 10, 0], 90);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vVecRamp.
         *
         * @input: vVecRamp([24,16,28,9,16,36],[14,7,28,4,4,0],30)
         * @expected: 21
         */
        test("vVecRamp([24,16,28,9,16,36],[14,7,28,4,4,0],30) = 21", function() {
            eval(fileLoader.getContent());

            var expected = 21;
            var result = vVecRamp([24, 16, 28, 9, 16, 36], [14, 7, 28, 4, 4, 0], 30);

            assert.deepEqual(result, expected);
        });
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.loadUnitsLib();
            var input =
            "a = [10,20,30,40] ; [kg, kg, kg, kg]\n" +
            "b = [0,100,150,0] ; [m,m,m,m]\n" +
            "c = 30 ; kg\n" +
            "z = vVecRamp(a,b,c)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            var expected = UnitObject.prototype.create(150, {'m':1});
            assert.equal(true, output.__z__().equals(expected));
            assert.equal(150, output.__z__().value);
            assert.ifError(output.__z__().error);
        });

        test("| Error handling", function() {
            compiler.loadUnitsLib();
            var input =
            "a = [10,20,30,40] ; [kg, p, kg, kg]\n" +
            "b = [0,100,150,0] ; [m,m,m,m]\n" +
            "c = 30 ; kg\n" +
            "z = vVecRamp(a,b,c)\n" +
            "d = [10,20,30,40] ; [kg, kg, kg, kg]\n" +
            "e = [0,100,150,0] ; [m,m,m,m]\n" +
            "f = 30 ; d\n" +
            "y = vVecRamp(a,b,c)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(150, output.__z__().value);
            assert.equal(output.__z__().error, "unitError");
            assert.ok(output.__z__().isNormal());

            assert.equal(150, output.__y__().value);
            assert.equal(output.__y__().error, "unitError");
            assert.ok(output.__y__().isNormal());
        });
    });
});
