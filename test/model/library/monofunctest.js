suite("Monofunc", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            console.log("Loaded 'Monofunc' module.");
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    suite("Calling functions with single argument", function() {
        test("Sin: scalar value", function() {
            var input = "y = sin(5)";
            var output = compiler.compile(new script(input)).__y__();
            assert.equal(output, Math.sin(5));
        });

        test("Sin: nested function calls", function() {
            var input = "x = 5\ny = sin(x) + 2\nz = sin(sin(x + sin(y)))";
            var output = compiler.compile(new script(input)).__z__();
            assert.equal(output, Math.sin(Math.sin(5 + Math.sin(Math.sin(5) + 2))));
        });

        test("Sin: simple function", function() {
            var input = "x = sin([1,2,3])";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [Math.sin(1), Math.sin(2), Math.sin(3)];
            assert.deepEqual(output, expected);
        });

        test("Sin: simple function", function() {
            var input = "x = sin([1,[2,[3,4]],5])";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [Math.sin(1), [Math.sin(2), [Math.sin(3),Math.sin(4)]], Math.sin(5)];
            assert.deepEqual(output, expected);
        });

        test("Sin: simple function", function() {
            var input = "x = 1 + sin([1,[2,[3,4]],5]) * 2";
            var output = compiler.compile(new script(input)).__x__();
            var expected = [1 + Math.sin(1) * 2, [1 + Math.sin(2) * 2, [1 + Math.sin(3) * 2, 1 + Math.sin(4) * 2]], 1 + Math.sin(5) * 2];
            assert.deepEqual(output, expected);
        });
    });
});
