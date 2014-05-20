// Example - atan2(y,x)
// Assume you had a point with the (x,y) coordinates of (4,8), you could calculate the angle in radians between that point and the positive X axis as follows:
// Math.atan2(8, 4);

suite("Atan2 Library", function() {
    var macroExpander;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(assertModule, module, FileLoader) {
            console.log("Loaded 'MacroExpander & FileLoader' module.");
            assert = assertModule;
            macroExpander = new module();
            var fileLoader = new FileLoader();
            fileLoader.load("func");
            fileLoader.load("atan2", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = atan2(1,1)'", function() {
            var input = "exe = {};func(y = atan2(4,8))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.atan2(8, 4), eval(output)());
        });

        test("should expand for 'x = 5, y = atan2(x, 7) + 2, z = atan2(3, atan2(x, y))'", function() {
            var input = "exe = {};func(x = 5)func(y = atan2(exe.x(), 7) + 2)func(z = atan2(3, atan2(exe.x(), exe.y())))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.atan2(Math.atan2(Math.atan2(7, 5) + 2, 5), 3), eval(output)());
        });
    });
});
