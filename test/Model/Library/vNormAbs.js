suite("vNormAbs Library", function() {
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
            fileLoader.load("vNormAbs", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vNormAbs", function() {

        /**
         * Test case for vNormAbs.
         * Based on an example of the help documentation
         *
         * @input: vNormAbs([1,-1,1,-1,1,-1])
         * @expected: 6
         */
        test("| vNormAbs([1,-1,1,-1,1,-1]) = 6", function() {
            eval(fileLoader.getContent());

            var expected = 6;
            var result = vNormAbs([1, -1, 1, -1, 1, -1]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormAbs.
         *
         * @input: vNormAbs([1, -1, x:1, y: -1])
         * @expected: 4
         */
        test("| vNormAbs([1, -1, x:1, y: -1]) = 4", function() {
            eval(fileLoader.getContent());

            var expected = 4;
            var input = [1, -1];
            input.x = 1;
            input.y = -1;
            var result = vNormAbs(input);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormAbs.
         *
         * @input: vNormAbs(-42)
         * @expected: 42
         */
        test("| vNormAbs(-42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result = vNormAbs(-42);

            assert.deepEqual(result, expected);
        });

    });

    suite("| Units", function() {
        test("| Equal dimensions", function() {
            compiler.setUnits(true);
            var input = 
            "a = [-1, 2, 3]; [kg, kg, 1]\n" +
            "b = [-1, 2, 3]; [kg, 1, kg]\n" +
            "d = [-1, 2, 3]; [1, kg, kg]\n" +
            "e = [-1, 2, 3]; [kg, 1, 1]\n" +
            "f = [-1, 2, 3]; [1, kg, 1]\n" +
            "g = [-1, 2, 3]; [1, 1, kg]\n" +
            "h = [-1, 2, 3]; [kg, kg, kg]\n" +
            "i = [-1, 2, 3]; [1, 1, 1]\n" +

            "k = vNormAbs(a)\n" + 
            "l = vNormAbs(b)\n" + 
            "m = vNormAbs(d)\n" + 
            "n = vNormAbs(e)\n" + 
            "o = vNormAbs(f)\n" + 
            "p = vNormAbs(g)\n" + 
            "q = vNormAbs(h)\n" + 
            "r = vNormAbs(i)\n";
            var output = compiler.compile(new script(input));

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

            assert.equal(6, output.__k__().value);
            assert.equal(6, output.__l__().value);
            assert.equal(6, output.__m__().value);
            assert.equal(6, output.__n__().value);
            assert.equal(6, output.__o__().value);
            assert.equal(6, output.__p__().value);
            assert.equal(6, output.__q__().value);
            assert.equal(6, output.__r__().value);
        });
    });
});
