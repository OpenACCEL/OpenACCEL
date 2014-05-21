suite("Min Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        requirejs(["assert", "model/compiler"], function(assertModule, compilerModule) {
            console.log("Loaded 'Compiler' module.");
            assert = assertModule;
            compiler = new compilerModule();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = min(5, 2, 3, 7, 1, 0, -8)'", function() {
            var input = "x = min(5, 2, 3, 7, 1, 0, -8)";
            var output = compiler.compile(input);
            assert.equal(Math.min(5, 2, 3, 7, 1, 0, -8), output.exe.x());
        });

        test("should expand for 'x = 5, y = min(x,4) + 2, z = min(min(x,2),y)'", function() {
            var input = "x = 5\ny = min(x,4) + 2\nz = min(min(x,2),y)";
            var output = compiler.compile(input);
            assert.equal(Math.min(Math.min(5, 2), Math.min(5, 4) + 2), output.exe.z());
        });

        test("should expand for 'x = min([1,2], [3,4])'", function() {
            var input = "x = min([1,2], [3,4])";
            var output = compiler.compile(input);
            assert.deepEqual([Math.min(1, 3), Math.min(2, 4)], output.exe.x());
        });
    });
});
