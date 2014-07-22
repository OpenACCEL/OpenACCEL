suite("Max Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for min.
         *
         * @input x = 5
         *        y = max(x,4) + 2
         *        z = max(max(x,2),y)
         * @expected z = Math.max(Math.max(5, 2), Math.max(5, 4) + 2)
         */
        test("| Should expand for 'x = 5, y = max(x,4) + 2, z = max(max(x,2),y)'", function() {
            var input = "x = 5\ny = max(x,4) + 2\nz = max(max(x,2),y)";
            var output = compiler.compile(new script(input));
            assert.equal(Math.max(Math.max(5, 2), Math.max(5, 4) + 2), output.__z__());
        });
    });

    suite("| Units", function() {
        test("| Non-equal units", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 5; kg\n" +
            "y = 6; s\n" +
            "z = min(x, y)";
            var output = compiler.compile(new script(input));
            output.setUnits(true);
            assert.throws(output.__z__());
        });

        test("| Equal units", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 5; kg\n" +
            "y = 6; kg\n" +
            "z = min(x, y)";
            var output = compiler.compile(new script(input));
            output.setUnits(true);
            var z = output.__z__();
            assert.equal(z.value, Math.min(5, 6));
            assert.equal(true, z.equals(new UnitObject(0, {'kg': 1})));
        });
    });
});
