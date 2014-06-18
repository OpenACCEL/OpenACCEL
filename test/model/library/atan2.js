// Example - atan2(y,x)
// Assume you had a point with the (x,y) coordinates of (4,8), you could calculate the angle in radians between that point and the positive X axis as follows:
// Math.atan2(8, 4);

suite("Atan2 Library", function() {

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

    /**
     * Quick atan2 test.
     *
     * @input       y = atan2(4, 8)
     * @expected    y = Math.atan2(8, 4)
     */
    test("| Atan2(4,8)", function() {
        var input = "y = atan2(4,8)";
        var output = compiler.compile(new script(input)).__y__();
        assert.equal(output, Math.atan2(8, 4));
    });

    /**
     * Atan2 chaining.
     *
     * @input       x = 5
     *              y = atan2(x, 7) + 2
     *              z = atan2(3, atan2(x, y))
     * @expected    z = Math.atan2(Math.atan2(Math.atan2(7, 5) + 2, 5), 3)
     */
    test("| Atan2 chaining", function() {
        var input = 
        "x = 5\n" + 
        "y = atan2(x, 7) + 2\n" +
        "z = atan2(3, atan2(x, y))";
        var output = compiler.compile(new script(input)).__z__();
        assert.equal(output, Math.atan2(Math.atan2(Math.atan2(7, 5) + 2, 5), 3));
    });
});
