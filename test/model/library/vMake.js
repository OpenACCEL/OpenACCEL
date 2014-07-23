suite("vMake Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vMake", "library");
            done();
        });
    });

    suite("| vMake", function() {

        /**
         * Test case for vMake.
         *
         * @input vMake(2,3)
         * @expected [2,2,2]
         */
        test("| Create an array with 3 times the number 2", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = 3;
            output = vMake(x, y);
            expected = [];
            expected[0] = 2;
            expected[1] = 2;
            expected[2] = 2;
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMake.
         *
         * @input vMake("bla",3)
         * @expected ["bla", "bla", "bla"]
         */
        test("| Create an array with 3 times the string 'bla'", function() {
            eval(fileLoader.getContent());
            x = "bla";
            y = 3;
            output = vMake(x, y);
            expected = [];
            expected[0] = "bla";
            expected[1] = "bla";
            expected[2] = "bla";
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMake.
         *
         * @input vMake(2,-3)
         * @expected {}
         */
        test("| Create an empty array with attempted negative number of elements", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = -3;
            output = vMake(x, y);
            expected = {};
            assert.deepEqual(output, expected);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of vMake.
         *
         * @input x = vMake('stuff', 2)
         * @expected x = ["stuff", "stuff"]
         */
        test("| Should expand for 'x = vMake('stuff', 2)'", function() {
            var input = "x = vMake('stuff', 2)";
            expected = [];
            expected[0] = "stuff";
            expected[1] = "stuff";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });

    suite("| Units", function() {
        test("| Dimensions", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = 5; kg\n" +
            "b = [3,4];[kg,s]\n" +
            "x = vMake(a, 3)\n" +
            "y = vMake(a, a)\n" +
            "z = vMake(b, 3)";
            var output = compiler.compile(new Script(input));
            output.setUnits(true);

            //assert.ok(output.__y__().error);
            assert.ifError(output.__x__().error);

            var x = output.__x__();
            var y = output.__y__();
            var z = output.__z__();
            assert.equal(true, x[0].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, x[1].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, x[2].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(5, x[0].value);
            assert.equal(5, x[1].value);
            assert.equal(5, x[2].value);

            assert.equal(5, y[0].value);
            assert.equal(5, y[1].value);
            assert.equal(5, y[2].value);
            assert.equal(5, y[3].value);
            assert.equal(5, y[4].value);

            assert.equal(true, z[0][0].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, z[0][1].equals(new UnitObject(0, {'s': 1})));
            assert.equal(true, z[1][0].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, z[1][1].equals(new UnitObject(0, {'s': 1})));
            assert.equal(true, z[2][0].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, z[2][1].equals(new UnitObject(0, {'s': 1})));

            assert.equal(3, z[0][0].value);
            assert.equal(4, z[0][1].value);
            assert.equal(3, z[1][0].value);
            assert.equal(4, z[1][1].value);
            assert.equal(3, z[2][0].value);
            assert.equal(4, z[2][1].value);
        });
    });
});
