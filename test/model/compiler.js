suite("Compiler", function() {
    var compiler;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler"], function(assertModule, module) {
            console.log("Loaded 'Compiler' module.");
            assert = assertModule;
            compiler = new module();
            done();
        });
    });

    suite("variables", function() {
        test("default settings, no units", function() {
            var code = "x = 5\ny = sin(x)\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(code);
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(), expected);
        });

        test("default settings, with units", function() {
            var code = "x = 5 ; kg\ny = sin(x) ; kg2.s/m\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(code);
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(), expected);
        });
    });

    suite("user-defined functions", function() {
        test("default settings, single function, no units", function() {
            var code = "x = 5\ny = sin(x)\nz(a, b) = a + 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(code);
            var expected = 4 + 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(4), expected);
        });

        test("default settings, function chaining, no units", function() {
            var code = "x(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(code);
            var expected = Math.sin(9);
            assert.equal(output.exe.y(4), expected);
        });

        test("default settings, shadowing, no units", function() {
            var code = "a = 100\nx(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(code);
            var expected = Math.sin(9);
            assert.equal(output.exe.y(4), expected);
        });
    });

    // suite("vector tests", function() {
    //     test("default settings, y = 1 + [2, x: 4]", function() {
    //         var code = "y = 1 + [2, x: 4]";
    //         var output = compiler.compile(code);
    //         var expected = [3];
    //         expected.x = 5;
    //         assert.deepEqual(output.exe.y(), expected);
    //     });
    // });
});
