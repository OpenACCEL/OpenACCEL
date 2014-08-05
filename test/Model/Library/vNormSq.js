suite("vNormSq Library", function() {
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
            fileLoader.load("vNormSq", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vNormSq", function() {

        /**
         * Test case for vNormSq.
         *
         * @input:vNormSq([1,2,3,4])
         * @expected: 30
         */
        test("| vNormSq([1,2,3,4]) = 30", function() {
            eval(fileLoader.getContent());

            var expected = 30;
            var result = vNormSq([1, 2, 3, 4]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormSq.
         *
         * @input:vNormSq(5)
         * @expected: 25
         */
        test("| vNormSq(5) = 25", function() {
            eval(fileLoader.getContent());

            var expected = 25;
            var result = vNormSq(5);

            assert.deepEqual(result, expected);
        });

    });

    suite("| Units", function() {
        test("| Equal dimensions", function() {
            compiler.setUnits(true);
            var input = 
            "a = [-3, 4, 5]; [kg, kg, 1]\n" +
            "b = [-3, 4, 5]; [kg, 1, kg]\n" +
            "d = [-3, 4, 5]; [1, kg, kg]\n" +
            "e = [-3, 4, 5]; [kg, 1, 1]\n" +
            "f = [-3, 4, 5]; [1, kg, 1]\n" +
            "g = [-3, 4, 5]; [1, 1, kg]\n" +
            "h = [-3, 4, 5]; [kg, kg, kg]\n" +
            "i = [-3, 4, 5]; [1, 1, 1]\n" +

            "k = vNormSq(a)\n" + 
            "l = vNormSq(b)\n" + 
            "m = vNormSq(d)\n" + 
            "n = vNormSq(e)\n" + 
            "o = vNormSq(f)\n" + 
            "p = vNormSq(g)\n" + 
            "q = vNormSq(h)\n" + 
            "r = vNormSq(i)\n";
            var output = compiler.compile(new script(input));

            assert.ok(output.__k__().error);
            assert.ok(output.__l__().error);
            assert.ok(output.__m__().error);
            assert.ok(output.__n__().error);
            assert.ok(output.__o__().error);
            assert.ok(output.__p__().error);
            assert.ifError(output.__q__().error);
            assert.ifError(output.__r__().error);

            assert.equal(true, output.__q__().equals(new UnitObject(0, {'kg': 2})));
            assert.equal(true, output.__r__().isNormal());

            assert.equal(50, output.__k__().value);
            assert.equal(50, output.__l__().value);
            assert.equal(50, output.__m__().value);
            assert.equal(50, output.__n__().value);
            assert.equal(50, output.__o__().value);
            assert.equal(50, output.__p__().value);
            assert.equal(50, output.__q__().value);
            assert.equal(50, output.__r__().value);
        });
    });
});
