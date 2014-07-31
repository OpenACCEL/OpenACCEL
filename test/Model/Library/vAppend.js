suite("vAppend Library", function() {
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
            fileLoader.load("vAppend", "library");
            fileLoader.load("vLen", "library");
            done();
        });
    });

    suite("| vAppend", function() {

        /**
         * Test case for vAppend, scalar.
         *
         * @input vAppend(1, 2)
         * @expected [1, 2]
         */
        test("| Append a scalar to a scalar", function() {
            eval(fileLoader.getContent());
            x = 1;
            y = 2;
            output = vAppend(x, y);
            assert.deepEqual(output, [1, 2]);
        });

        /**
         * Test case for vAppend, vector.
         *
         * @input vAppend([1, 2], 4)
         * @expected [1,2,4]
         */
        test("| Append a scalar to a vector", function() {
            eval(fileLoader.getContent());
            x = [];
            x[0] = 1;
            x[1] = 2;
            y = 4;
            output = vAppend(x, y);
            expected = [];
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = 4;
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vAppend, 2 vectors.
         *
         * @input vAppend([1, 2], [4,5])
         * @expected [1,2, [4,5]]
         */
        test("| Append a vector to a vector", function() {
            eval(fileLoader.getContent());
            x = [];
            x[0] = 1;
            x[1] = 2;
            y = [4, 5];
            output = vAppend(x, y);
            expected = [];
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = [4, 5];
            assert.deepEqual(output, expected);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of vAppend.
         *
         * @input x = vAppend(y, z)
         *        y = [1,0]
         *        z = 3
         * @expected x = [1,0,3]
         */
        test("| Should expand for 'x = vAppend(y, z), y = [1,0], z = 3'", function() {
            var input = "x = vAppend(y, z)\ny = [1,0]\nz = 3";
            var output = compiler.compile(new Script(input));
            expected = [];
            expected[0] = 1;
            expected[1] = 0;
            expected[2] = 3;
            assert.deepEqual(output.__x__(), expected);
        });
    });

    suite("| Units", function() {
        test("| Concatenation of units", function() {
            compiler.loadUnitsLib();
            var input = 
            "a=[1,2,3,x:4]; [1,kg,1,x:s]\n" +
            "b=[[5,6]]; [[lum,1]]\n" +
            "c=vAppend(a,b)";
            var output = compiler.compile(new Script(input));
            output.setUnits(true);

            var c = output.__c__();
            assert.equal(true, c[0].isNormal());
            assert.equal(true, c[1].equals(new UnitObject(0, { 'kg': 1})));
            assert.equal(true, c[2].isNormal());
            assert.equal(true, c.x.equals(new UnitObject(0, { 's': 1})));
            assert.equal(true, c[3][0][0].equals(new UnitObject(0, { 'lum': 1})));
            assert.equal(true, c[3][0][1].isNormal());

            assert.equal(1, c[0].value);
            assert.equal(2, c[1].value);
            assert.equal(3, c[2].value);
            assert.equal(4, c.x.value);
            assert.equal(5, c[3][0][0].value);
            assert.equal(6, c[3][0][1].value);
        });
    });
});
