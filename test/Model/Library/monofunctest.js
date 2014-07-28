suite("Monofunc", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/Script"], function(Assert, Compiler, Script) {
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    suite("| Calling functions with single argument", function() {

        /**
         * Test case for sin.
         *
         * @input y = sin(5)
         * @expected Math.sin(5)
         */
        test("| Sin | Scalar value", function() {
            var input = "y = sin(5)";
            var output = compiler.compile(new script(input)).__y__();
            assert.equal(output, Math.sin(5));
        });

        /**
         * Test case for sin.
         *
         * @input x = 5
         *        y = sin(x) + 2
         *        z = sin(sin(x + sin(y)))
         * @expected Math.sin(Math.sin(5 + Math.sin(Math.sin(5) + 2)))
         */
        test("| Sin | Nested function calls", function() {
            var input = "x = 5\ny = sin(x) + 2\nz = sin(sin(x + sin(y)))";
            var output = compiler.compile(new script(input)).__z__();
            assert.equal(output, Math.sin(Math.sin(5 + Math.sin(Math.sin(5) + 2))));
        });

        /**
         * Test case for sin.
         *
         * @input x = sin([1,2,3])
         * @expected [Math.sin(1), Math.sin(2), Math.sin(3)]
         */
        test("| Sin | Simple function #1", function() {
            var input = "x = sin([1,2,3])";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [Math.sin(1), Math.sin(2), Math.sin(3)];
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for sin.
         *
         * @input x = sin([1,[2,[3,4]],5])
         * @expected [Math.sin(1), [Math.sin(2), [Math.sin(3),Math.sin(4)]], Math.sin(5)]
         */
        test("| Sin | Simple function #2", function() {
            var input = "x = sin([1,[2,[3,4]],5])";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [Math.sin(1), [Math.sin(2), [Math.sin(3), Math.sin(4)]], Math.sin(5)];
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for sin.
         *
         * @input x = 1 + sin([1,[2,[3,4]],5]) * 2
         * @expected [1 + Math.sin(1) * 2, [1 + Math.sin(2) * 2, [1 + Math.sin(3) * 2, 1 + Math.sin(4) * 2]], 1 + Math.sin(5) * 2]
         */
        test("| Sin | Simple function #3", function() {
            var input = "x = 1 + sin([1,[2,[3,4]],5]) * 2";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [1 + Math.sin(1) * 2, [1 + Math.sin(2) * 2, [1 + Math.sin(3) * 2, 1 + Math.sin(4) * 2]], 1 + Math.sin(5) * 2];
            assert.deepEqual(output, expected);
        });
    });

    suite("| Units", function() {
        test("| Dimension", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 0.5; kg\n" +
            "a = sin(x)\n" +
            "b = cos(x)\n" +
            "c = tan(x)\n" +
            "d = asin(x)\n" +
            "e = acos(x)\n" +
            "f = atan(x)\n" +
            "g = exp(x)\n" +
            "h = ln(x)\n" +
            "i = log(x)\n" +

            "j = uniminus(x)\n" +
            "k = ceil(x)\n" +
            "l = floor(x)\n" +
            "m = round(x)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.ok(output.__a__().error);
            assert.ok(output.__b__().error);
            assert.ok(output.__c__().error);
            assert.ok(output.__d__().error);
            assert.ok(output.__e__().error);
            assert.ok(output.__f__().error);
            assert.ok(output.__g__().error);
            assert.ok(output.__h__().error);
            assert.ok(output.__i__().error);

            assert.equal(true, output.__j__().equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, output.__k__().equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, output.__l__().equals(new UnitObject(0, {'kg': 1})));
            assert.equal(true, output.__m__().equals(new UnitObject(0, {'kg': 1})));

            assert.equal(-0.5, output.__j__().value);
            assert.equal(1, output.__k__().value);
            assert.equal(0, output.__l__().value);
            assert.equal(1, output.__m__().value);
        });

        test("| Dimensionless", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 0.5\n" +
            "a = sin(x)\n" +
            "b = cos(x)\n" +
            "c = tan(x)\n" +
            "d = asin(x)\n" +
            "e = acos(x)\n" +
            "f = atan(x)\n" +
            "g = exp(x)\n" +
            "h = ln(x)\n" +
            "i = log(x)\n" +

            "j = uniminus(x)\n" +
            "k = ceil(x)\n" +
            "l = floor(x)\n" +
            "m = round(x)\n";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            assert.equal(true, output.__a__().isNormal());
            assert.equal(true, output.__b__().isNormal());
            assert.equal(true, output.__c__().isNormal());
            assert.equal(true, output.__d__().isNormal());
            assert.equal(true, output.__e__().isNormal());
            assert.equal(true, output.__f__().isNormal());
            assert.equal(true, output.__g__().isNormal());
            assert.equal(true, output.__h__().isNormal());
            assert.equal(true, output.__i__().isNormal());
            assert.equal(true, output.__j__().isNormal());
            assert.equal(true, output.__k__().isNormal());
            assert.equal(true, output.__l__().isNormal());
            assert.equal(true, output.__m__().isNormal());

            assert.equal(Math.sin(0.5), output.__a__().value);
            assert.equal(Math.cos(0.5), output.__b__().value);
            assert.equal(Math.tan(0.5), output.__c__().value);
            assert.equal(Math.asin(0.5), output.__d__().value);
            assert.equal(Math.acos(0.5), output.__e__().value);
            assert.equal(Math.atan(0.5), output.__f__().value);
            assert.equal(Math.exp(0.5), output.__g__().value);
            assert.equal(Math.log(0.5), output.__h__().value);
            assert.equal(Math.log(0.5) / Math.log(10), output.__i__().value);
            assert.equal(-0.5, output.__j__().value);
            assert.equal(1, output.__k__().value);
            assert.equal(0, output.__l__().value);
            assert.equal(1, output.__m__().value);

            assert.ifError(output.__a__().error);
            assert.ifError(output.__b__().error);
            assert.ifError(output.__c__().error);
            assert.ifError(output.__d__().error);
            assert.ifError(output.__e__().error);
            assert.ifError(output.__f__().error);
            assert.ifError(output.__g__().error);
            assert.ifError(output.__h__().error);
            assert.ifError(output.__i__().error);
            assert.ifError(output.__j__().error);
            assert.ifError(output.__k__().error);
            assert.ifError(output.__l__().error);
            assert.ifError(output.__m__().error);
        });
    });
});
