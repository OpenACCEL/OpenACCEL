suite("Modulo Library", function() {

    var assert;
    var macroExpander;
    var macros;

    setup(function(done) {
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(Assert, MacroExpander, FileLoader) {
            console.log("Loaded 'Modulo' module.");
            assert = Assert;
            macroExpander = new MacroExpander();
            var fileLoader = new FileLoader();
            fileLoader.load("func", "macros");
            fileLoader.load("modulo", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = modulo(5,4)'", function() {
            var input = "exe = {};func(y = modulo(5, 4))";
            var output = macroExpander.expand(input, macros);
            assert.equal(5 % 4, eval(output)());
        });

        test("should expand for 'x = 5, y = modulo(x,4) + 2, z = modulo(modulo(x,2),y)'", function() {
            var input = "exe = {};func(x = 5)func(y = modulo(exe.__x__(),4) + 2)func(z = modulo(modulo(exe.__x__(), 2), exe.__y__()))";
            var output = macroExpander.expand(input, macros);
            assert.equal((5 % 2) % (5 % 4 + 2), eval(output)());
        });
    });
});
