suite("Sum Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'Compiler & FileLoader' module.");
            assert = assertModule;
            compiler = new module();
            Script = scriptModule;
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = sum(5, 2, 3, 7, 1, 0, -8)'", function() {
            var input = "x = sum(5, 2, 3, 7, 1, 0, -8)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.x(), 10);
        });

        test("should expand for 'x = 5, y = sum(x,4) + 2, z = sum(sum(x,2),y)'", function() {
            var input = "x = 5\ny = sum(x,4) + 2\nz = sum(sum(x,2),y)";
            var output = compiler.compile(new Script(input));
            assert.equal(output.exe.z(), 18);
        });

        test("should expand for 'x = sum([1,2], [3,4])'", function() {
            var input = "x = sum([1,2], [3,4])";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.x(), [4, 6]);
        });

        test("should expand for 'x = sum([1,2], [3,4], [1, [4,5]])'", function() {
            var input = "x = sum([1,2], [3,4], [1, [4,5]])";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.x(), [5, [10, 11]]);
        });
    });
});
