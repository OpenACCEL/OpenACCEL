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

    suite("expansion", function() {

        /**
         * Test case for min.
         *
         * @input x = 5
         *        y = max(x,4) + 2
         *        z = max(max(x,2),y)
         * @expected z = Math.max(Math.max(5, 2), Math.max(5, 4) + 2)
         */
        test("should expand for 'x = 5, y = max(x,4) + 2, z = max(max(x,2),y)'", function() {
            var input = "x = 5\ny = max(x,4) + 2\nz = max(max(x,2),y)";
            var output = compiler.compile(new script(input));
            assert.equal(Math.max(Math.max(5, 2), Math.max(5, 4) + 2), output.__z__());
        });
    });
});
