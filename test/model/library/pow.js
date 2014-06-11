suite("Pow Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            console.log("Loaded 'Pow' module.");
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });
    suite("pow", function() {
        test("x = pow(5, 2)", function() {
            var input = "x = pow(5, 2)";
            var output = compiler.compile(new script(input)).exe.__x__();
            assert.equal(output, Math.pow(5, 2));
        });

        test("x = 5; y = y = pow(x, 3);z = z = pow(y, pow(x, 2))", function() {
            var input = 
            "x = 5\n" + 
            "y = pow(x, 3)\n" +
            "z = pow(y, pow(x, 2))";
            var output = compiler.compile(new script(input)).exe.__z__();
            assert.equal(output, Math.pow(Math.pow(5, 3), Math.pow(5, 2)));
        });

    });
});
