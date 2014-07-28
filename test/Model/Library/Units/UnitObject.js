suite("Unit Object", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("UnitObject", "unitlibrary");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    suite("| Function", function() {
        /**
         * Two UnitObject with the same units should be equal.
         *
         * @input:      a = new UnitObject(5, {'kg': 1})
         *              b = new UnitObject(5, {'kg': 1})
         *              c = new UnitObject(10, {'kg': 1})
         *              d = new UnitObject(5, {'kg': 2})
         *              e = new UnitObject(5, {})
         * @expected:   a.equals(b) == true
         *              b.equals(a) == true
         *              a.equals(c) == true
         *              c.equals(a) == true
         *              a.equals(d) == false
         *              d.equals(a) == false
         *              a.equals(e) == false
         *              e.equals(a) == false
         */
        test("| Equality", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var a = new UnitObject(5, {'kg': 1});
            var b = new UnitObject(5, {'kg': 1});
            var c = new UnitObject(10, {'kg': 1});
            var d = new UnitObject(5, {'kg': 2});
            var e = new UnitObject(5, { });
            assert.equal(a.equals(b), true);
            assert.equal(b.equals(a), true);
            assert.equal(a.equals(c), true);
            assert.equal(c.equals(a), true);
            assert.equal(a.equals(d), false);
            assert.equal(d.equals(a), false);
            assert.equal(a.equals(e), false);
            assert.equal(e.equals(a), false);
        });

        /**
         * Detect whether a unit is in normal form.
         *
         * @input:      a = new UnitObject(5, {'kg': 1})
         *              b = new UnitObject(5, {})
         * @expected:   a.hasUnit()  == true
         *              a.isNormal() == false
         *              b.hasUnit()  == false
         *              b.isNormal() == true
         */
        test("| Has Units and Is Normal", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var a = new UnitObject(5, {'kg': 1});
            var b = new UnitObject(5, { });
            assert.equal(a.hasUnit() , true);
            assert.equal(a.isNormal(), false);
            assert.equal(b.hasUnit() , false);
            assert.equal(b.isNormal(), true);
        });

        /**
         * The multiplication of two UnitObjects.
         *
         * @input:      a = new UnitObject(5, {'kg': 1, 'm': 0, 'lum': 0})
         *              b = new UnitObject(6, {'s': -2})
         * @expected:   a.multiply(b) == new UnitObject(30, {'kg': 1, 'm': 1, 's': -2})
         */
        test("| Multiplication", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var a = new UnitObject(5, {'kg': 1, 'm': 0, 'lum': 0});
            var b = new UnitObject(6, {'m': 1, 's': -2});
            var ans = new UnitObject(30, {'kg': 1, 'm': 1, 's': -2});

            var c = a.multiply(b);
            assert.equal(c.equals(ans), true);
            assert.equal(c.error, ans.error);

            // Commutativity.
            var d = b.multiply(a);
            assert.equal(d.equals(ans), true);
            assert.equal(d.error, ans.error);
        });

        /**
         * The division of two UnitObjects.
         *
         * @input:      a = new UnitObject(5, {'kg': 1, 'm': 3, 'lum': 0})
         *              b = new UnitObject(6, {'s': -2, 'm': 4})
         * @expected:   a.divide(b) == new UnitObject(1, {'kg': 1, 'm': -1, 's': 2})
         */
        test("| Division", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var a = new UnitObject(5, {'kg': 1, 'm': 3, 'lum': 0});
            var b = new UnitObject(6, {'s': -2, 'm': 4});
            var ans = new UnitObject(30, {'kg': 1, 'm': -1, 's': 2});

            var c = a.divide(b);
            assert.equal(c.equals(ans), true);
            assert.equal(c.error, ans.error);

            // Non-Commutativity.
            var d = b.multiply(a);
            assert.equal(d.equals(ans), false);
            assert.equal(d.error, ans.error);
        });

        /**
         * The exponentiation of a UnitObject.
         *
         * @input:      a = new UnitObject(5, {'kg': 1, 'm': 0, 'lum': 0})
         *              b = new UnitObject(5, {'s': -2})
         * @expected:   a.multiply(b) == new UnitObject(25, {'kg': 1, 'm': 1, 's': -2})
         */
        test("| Exponentiation", function() {
            // TODO.
        });

        /**
         * The creation (zipping) of UnitObjects.
         *
         * @input:      values = [10, [20, 30], UnitObject(4, {'s': 2})]
         *              units = [{'kg': 1}, [{}, {'m': -2}]]
         * @expected:   UnitObject.prototype.zip(values, units) ==
         * 				[new UnitObject(10, {'kg': 1}),
         * 				[new UnitObject(20, {}),
         * 				 new UnitObject(30, {'m': -2})]]
         */
        test("| Creation", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var values = [10, [20, 30], new UnitObject(4, {'s': 2})];
            var units = [{'kg': 1}, [{}, {'m': -2}], {'lum': 1}];
            var ans = UnitObject.prototype.create(values, units);

            var first = new UnitObject(10, {'kg': 1});
            var second = new UnitObject(20, {});
            var third = new UnitObject(30, {'m': -2});
            var fourth = new UnitObject(4, {'lum': 1});

            assert.equal(ans[0].equals(first), true);
            assert.equal(ans[0].value, first.value);
            assert.equal(ans[0].error, first.error);

            assert.equal(ans[1][0].equals(second), true);
            assert.equal(ans[1][0].value, second.value);
            assert.equal(ans[1][0].error, second.error);

            assert.equal(ans[1][1].equals(third), true);
            assert.equal(ans[1][1].value, third.value);
            assert.equal(ans[1][1].error, third.error);

            assert.equal(ans[2].equals(fourth), true);
            assert.equal(ans[2].value, fourth.value);
            assert.equal(ans[2].error, fourth.error);
        });

        /**
         * Getting the nominator of a unit.
         *
         * @input:      a = new UnitObject(5, {'kg': 1, 'm': 1, 's': -2})
         * @expected:   a.getNominator == {'kg': 1, 'm': 1};
         */
        test("| Nominator", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var a = new UnitObject(5, {'kg': 1, 'm': 1, 's': -2});
            var b = new UnitObject(6, a.getNominator());
            var expected = new UnitObject(11, {'kg': 1, 'm': 1});
            assert.equal(b.equals(expected), true);
        });

        /**
         * Getting the denominator of a unit.
         *
         * @input:      a = new UnitObject(5, {'kg': 1, 'm': 1, 's': -2})
         * @expected:   a.getDenominator == {'s': -2};
         */
        test("| Denominator", function() {
            eval(fileLoader.getLibrary("unitlibrary"));
            var a = new UnitObject(5, {'kg': 1, 'm': 1, 's': -2});
            var b = new UnitObject(5, a.getDenominator());
            var expected = new UnitObject(5, {'s': -2});
            assert.equal(b.equals(expected), true);
        });
    });
});
