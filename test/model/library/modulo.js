suite("Modulo Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            console.log("Loaded 'modulo' module.");
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });
    suite("modulo", function() {
        test("x = modulo(5, 4)", function() {
            var input = "x = modulo(5, 4)";
            var output = compiler.compile(new script(input)).exe.__x__();
            assert.equal(output, 5 % 4);
        });

        test("x = 5, y = modulo(x,4) + 2, z = modulo(modulo(x,2),y)", function() {
            var input = "x = 5\n y = modulo(x,4) + 2\n z = modulo(modulo(x,2),y)";
            var output = compiler.compile(new script(input)).exe.__z__();
            assert.equal(output, (5 % 2) % (5 % 4 + 2));
        });

    });
});
