suite("vNormEuclid Library", function() {
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
            fileLoader.load("vNormEuclid", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vNormEuclid", function() {

        /**
         * Test case for vNormEuclid.
         * Based on an example of the help documentation
         *
         * @input:vNormEuclid([2,2,2])
         * @expected: 2 sqrt(3)
         */
        test("| vNormEuclid([2,2,2]) = 2 sqrt(3)", function() {
            eval(fileLoader.getContent());

            var expected = 2 * Math.sqrt(3);
            var result = vNormEuclid([2, 2, 2]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormEuclid.
         *
         * @input:vNormEuclid(42)
         * @expected: 42
         */
        test("| vNormEuclid(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result = vNormEuclid(42);

            assert.deepEqual(result, expected);
        });
    });

    suite("| Units", function() {
        test("| Equal dimensions", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = [-3, 4, 5]; [kg, kg, 1]\n" +
            "b = [-3, 4, 5]; [kg, 1, kg]\n" +
            "d = [-3, 4, 5]; [1, kg, kg]\n" +
            "e = [-3, 4, 5]; [kg, 1, 1]\n" +
            "f = [-3, 4, 5]; [1, kg, 1]\n" +
            "g = [-3, 4, 5]; [1, 1, kg]\n" +
            "h = [-3, 4, 5]; [kg, kg, kg]\n" +
            "i = [-3, 4, 5]; [1, 1, 1]\n" +

            "k = vNormEuclid(a)\n" + 
            "l = vNormEuclid(b)\n" + 
            "m = vNormEuclid(d)\n" + 
            "n = vNormEuclid(e)\n" + 
            "o = vNormEuclid(f)\n" + 
            "p = vNormEuclid(g)\n" + 
            "q = vNormEuclid(h)\n" + 
            "r = vNormEuclid(i)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.ok(output.__k__().error);
            assert.ok(output.__l__().error);
            assert.ok(output.__m__().error);
            assert.ok(output.__n__().error);
            assert.ok(output.__o__().error);
            assert.ok(output.__p__().error);
            assert.ifError(output.__q__().error);
            assert.ifError(output.__r__().error);

            assert.equal(true, output.__q__().equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, output.__r__().isNormal());

            assert.equal(Math.sqrt(50), output.__k__().value);
            assert.equal(Math.sqrt(50), output.__l__().value);
            assert.equal(Math.sqrt(50), output.__m__().value);
            assert.equal(Math.sqrt(50), output.__n__().value);
            assert.equal(Math.sqrt(50), output.__o__().value);
            assert.equal(Math.sqrt(50), output.__p__().value);
            assert.equal(Math.sqrt(50), output.__q__().value);
            assert.equal(Math.sqrt(50), output.__r__().value);
        });
    });
});
