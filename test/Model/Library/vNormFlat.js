suite("vNormFlat Library", function() {
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
            fileLoader.load("vNormFlat", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vNormFlat", function() {

        /**
         * Test case for vNormFlat.
         * Based on an example of the help documentation
         *
         * @input:vNormFlat([1,-1,1,-1,1,-1])
         * @expected: 0
         */
        test("| vNormFlat([1,-1,1,-1,1,-1]) = 0", function() {
            eval(fileLoader.getContent());

            var expected = 0;
            var result = vNormFlat([1, -1, 1, -1, 1, -1]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormFlat.
         *
         * @input:vNormFlat(42)
         * @expected: 42
         */
        test("| vNormFlat(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result = vNormFlat(42);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormFlat.
         *
         * @input:vNormFlat(['a', 'b', 'c'])
         * @expected: 'abc'
         */
        test("| vNormFlat(['a', 'b', 'c']) = 'abc'", function() {
            eval(fileLoader.getContent());

            var expected = 'abc';
            var result = vNormFlat(['a', 'b', 'c']);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormFlat.
         *
         * @input:vNormFlat([y:'a', x:'b', 'c'])
         * @expected: 'cba'
         */
        test("| vNormFlat([y:'a', x:'b', 'c']) = 'cba'", function() {
            eval(fileLoader.getContent());

            var expected = 'cab';
            var input = [];
            input.y = 'a';
            input.x = 'b';
            input[0] = 'c';
            var result = vNormFlat(input);

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

            "k = vNormFlat(a)\n" + 
            "l = vNormFlat(b)\n" + 
            "m = vNormFlat(d)\n" + 
            "n = vNormFlat(e)\n" + 
            "o = vNormFlat(f)\n" + 
            "p = vNormFlat(g)\n" + 
            "q = vNormFlat(h)\n" + 
            "r = vNormFlat(i)\n";
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

            assert.equal(4, output.__k__().value);
            assert.equal(4, output.__l__().value);
            assert.equal(4, output.__m__().value);
            assert.equal(4, output.__n__().value);
            assert.equal(4, output.__o__().value);
            assert.equal(4, output.__p__().value);
            assert.equal(4, output.__q__().value);
            assert.equal(4, output.__r__().value);
        });
    });
});
