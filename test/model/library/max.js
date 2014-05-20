suite("Min Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler"], function(assertModule, module) {
            console.log("Loaded 'Compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = min(5, 2, 3, 7, 1, 0, -8)'", function() {
            var input = "x = max(5, 2, 3, 7, 1, 0, -8)";
            var output = compiler.compile(input);
            assert.equal(Math.max(5, 2, 3, 7, 1, 0, -8), output.exe.x());
        });

        test("should expand for 'x = 5, y = min(x,4) + 2, z = min(min(x,2),y)'", function() {
            var input = "x = 5\ny = max(x,4) + 2\nz = max(max(x,2),y)";
            var output = compiler.compile(input);
            assert.equal(Math.max(Math.max(5, 2), Math.max(5, 4) + 2), output.exe.z());
        });
    });
});
