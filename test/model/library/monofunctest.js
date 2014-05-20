suite("Monofunc", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler"], function(assertModule, module) {
            console.log("Loaded 'compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            done();
        });
    });

    suite("Calling functions with single argument", function() {
        test("Sin: scalar value", function() {
            var input = "y = sin(5)";
            var output = compiler.compile(input).exe.y();
            assert.equal(output, Math.sin(5));
        });

        test("Sin: nested function calls", function() {
            var input = "x = 5\ny = sin(x) + 2\nz = sin(sin(x + sin(y)))";
            var output = compiler.compile(input).exe.z();
            assert.equal(output, Math.sin(Math.sin(5 + Math.sin(Math.sin(5) + 2))));
        });

        test("Sin: simple function", function() {
            var input = "x = sin([1,2,3])";
            var output = compiler.compile(input).exe.x();
            var expected = [Math.sin(1), Math.sin(2), Math.sin(3)];
            assert.deepEqual(output, expected);
        });

        test("Sin: simple function", function() {
            var input = "x = sin([1,[2,[3,4]],5])";
            var output = compiler.compile(input).exe.x();
            var expected = [Math.sin(1), [Math.sin(2), [Math.sin(3),Math.sin(4)]], Math.sin(5)];
            assert.deepEqual(output, expected);
        });
    });
});
