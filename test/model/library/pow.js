suite("Pow Library", function() {

    var assert;
    var macroExpander;
    var macros;

    setup(function(done) {
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(Assert, MacroExpander, FileLoader) {
            console.log("Loaded 'Pow' module.");
            assert = Assert;
            macroExpander = new MacroExpander();
            var fileLoader = new FileLoader();
            fileLoader.load("func", "macros");
            fileLoader.load("pow", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = pow(5,2)'", function() {
            var input = "exe = {};func(x = pow(5, 2))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.pow(5, 2), eval(output)());
        });

        test("should expand for 'x = 5, y = pow(x, 3), z = pow(y, pow(x,2))'", function() {
            var input = "exe = {};func(x = 5)func(y = pow(exe.__x__(), 3))func(z = pow(exe.__y__(), pow(exe.__x__(), 2)))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.pow(Math.pow(5, 3), Math.pow(5, 2)), eval(output)());
        });
    });
});
