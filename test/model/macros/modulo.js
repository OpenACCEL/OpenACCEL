suite("Modulo Macro", function() {
    var macroExpander;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander"], function(assertModule, module) {
            console.log("Loaded 'MacroExpander' module.");
            assert = assertModule;
            macroExpander = new module();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = modulo(5,4)'", function() {
            macroExpander.load("func");
            macroExpander.load("modulo");
            var input = "exe = {};func(y = modulo(5, 4))";
            var output = macroExpander.compile(input);
            assert.equal(5 % 4, eval(output)());
        });

        test("should expand for 'x = 5, y = modulo(x,4) + 2, z = modulo(modulo(x,2),y)'", function() {
            macroExpander.load("func");
            macroExpander.load("modulo");
            var input = "exe = {};func(x = 5)func(y = modulo(x,4) + 2)func(z = modulo(modulo(exe.x(), 2), exe.y()))";
            var output = macroExpander.compile(input);
            assert.equal((5 % 2) % (x % 4 + 2), eval(output)());
        });
    });
});