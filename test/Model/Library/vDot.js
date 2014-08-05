suite("vDot Library", function() {
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
            fileLoader.load("Functions", "library");
            done();
        });
    });

    suite("| vDot", function() {

        /**
         * Test case for vDot, two vectors.
         *
         * @input vDot([2,5], [3,7])
         * @expected 41
         */
        test("| Dot product of two vectors", function() {
            eval(fileLoader.getContent());
            x = [2, 5];
            y = [3, 7];
            expected = 41;
            output = vDot(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vDot, two named vectors.
         *
         * @input vDot([a: 2,b: 3, c: 4], [a:2, b: 3, d :4])
         * @expected 13
         */
        test("| Dot product of two named vectors", function() {
            eval(fileLoader.getContent());
            x = [];
            x['a'] = 2;
            x['b'] = 3;
            x['c'] = 4;
            y = [];
            y['a'] = 2;
            y['b'] = 3;
            y['d'] = 4;
            expected = 13;
            output = vDot(x, y);
            assert.deepEqual(output, expected);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of vDot.
         *
         * @input x = vDot(z, y)
         *        y = [[1, 1],[0, -1]]
         *        z = [[2, 4],[3, 5]]
         * @expected 6
         */
        test("| Should expand for 'x = vDot(z, y), y = [[1, 1],[0, -1]], z = [[2, 4],[3, 5]]'", function() {
            compiler.setUnits(false);
            var input = "x = vDot(z, y)\ny = [1, 1]\nz = [2, 4]";
            expected = 6;
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });

    suite("| Units", function() {
        test("| Homogenous units", function() {
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

            "k = vDot(a, a)\n" + 
            "l = vDot(b, b)\n" + 
            "m = vDot(d, d)\n" + 
            "n = vDot(e, e)\n" + 
            "o = vDot(f, f)\n" + 
            "p = vDot(g, g)\n" + 
            "q = vDot(h, h)\n" + 
            "r = vDot(i, i)\n";
            var output = compiler.compile(new Script(input));

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

            assert.equal(14, output.__k__().value);
            assert.equal(14, output.__l__().value);
            assert.equal(14, output.__m__().value);
            assert.equal(14, output.__n__().value);
            assert.equal(14, output.__o__().value);
            assert.equal(14, output.__p__().value);
            assert.equal(14, output.__q__().value);
            assert.equal(14, output.__r__().value);
        });
    });
});
