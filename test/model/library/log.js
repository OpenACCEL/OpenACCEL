suite("Log Library", function() {

    var assert;
    var macroExpander;
    var macros;

    setup(function(done) {
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(Assert, Compiler, FileLoader) {
            console.log("Loaded 'Log' module.");
            assert = Assert;
            macroExpander = new Compiler();
            var fileLoader = new FileLoader();
            fileLoader.load("func", "macros");
            fileLoader.load("log", "library");
            macros = fileLoader.getContent();
            done();
        });
    });

    suite("expansion", function() {
        test("should expand for 'x = log(5)'", function() {
            var input = "exe = {};func(y = log(5))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.log(5) / Math.log(10), eval(output)());
        });

        test("should expand for 'x = 5, y = log(x) + 2, z = log(log(x) + log(y))'", function() {
            var input = "exe = {};func(x = 5)func(y = log(exe.__x__()) + 2)func(z = log(log(exe.__x__()) + log(exe.__y__())))";
            var output = macroExpander.expand(input, macros);
            assert.equal(Math.log(Math.log(5) / Math.log(10) + Math.log(Math.log(5) / Math.log(10) + 2) / Math.log(10)) / Math.log(10), eval(output)());
        });
    });
});
