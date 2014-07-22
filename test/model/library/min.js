suite("Min Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
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
         *        y = min(x,4) + 2
         *        z = min(min(x,2), y)
         * @expected z = Math.min(Math.min(5, 2), Math.min(5, 4) + 2)
         */
        test("should expand for 'x = 5, y = min(x,4) + 2, z = min(min(x,2),y)'", function() {
            var input = "x = 5\ny = min(x,4) + 2\nz = min(min(x,2),y)";
            var output = compiler.compile(new script(input));
            assert.equal(Math.min(Math.min(5, 2), Math.min(5, 4) + 2), output.__z__());
        });

        /**
         * Test case for min.
         * @input x = min([1,2], [3,4])
         * @expected x = [Math.min(1, 3), Math.min(2, 4)]
         */
        test("should expand for 'x = min([1,2], [3,4])'", function() {
            var input = "x = min([1,2], [3,4])";
            var output = compiler.compile(new script(input));
            assert.deepEqual([Math.min(1, 3), Math.min(2, 4)], output.__x__());
        });
    });

    suite("| Units", function() {
        test("| Non-equal units", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 5; kg\n" +
            "y = 6; s\n" +
            "z = atan2(x, y)";
            var output = compiler.compile(new script(input));
            output.setUnits(true);
            assert.throws(output.__z__());
        });

        test("| Equal units", function() {
            compiler.loadUnitsLib();
            var input = 
            "x = 5; kg\n" +
            "y = 6; kg\n" +
            "z = atan2(x, y)";
            var output = compiler.compile(new script(input));
            output.setUnits(true);
            var z = output.__z__();
            assert.equal(z.value, Math.atan2(5, 6));
            assert.equal(true, z.equals(new UnitObject(0, {'kg': 1})));
        });
    });
});
