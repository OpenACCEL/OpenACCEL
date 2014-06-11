suite("Log Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            console.log("Loaded 'Log' module.");
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });
    suite("log", function() {
        test("x = log(5)", function() {
            var input = "x = log(5)";
            var output = compiler.compile(new script(input)).exe.__x__();
            assert.equal(output, Math.log(5) / Math.log(10));
        });

        test("x = 5, y = log(x) + 2, z = log(log(x) + log(y))", function() {
            var input = 
            "x = 5\n" + 
            "y = log(x) + 2\n" +
            "z = log(log(x) + log(y))";
            var output = compiler.compile(new script(input)).exe.__z__();
            assert.equal(output, Math.log(Math.log(5) / Math.log(10) + Math.log(Math.log(5) / Math.log(10) + 2) / Math.log(10)) / Math.log(10));
        });

    });
});
