suite("Compiler", function() {
    var compiler;
    var assert;
    var Script;
    var Analyser;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/script", "model/analyser"], function(assertModule, module, scriptModule, analyserModule) {
            console.log("Loaded 'Compiler' module.");
            assert = assertModule;
            compiler = new module();
            Script = scriptModule;
            done();
        });
    });

    suite("variables", function() {
        function createScript(code) {
            var lines = code.split("\n");
            var a = new Analyser();
            var q = {};
            lines.forEach(function(e) {
                q = a.analyse(e,q);
            });
            var script = new Script();
            script.source = code;
            script.quantities = q;
        }

        test("default settings, no units", function() {
            var code = "x = 5\ny = sin(x)\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(createScript(code));
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(), expected);
        });

        test("default settings, with units", function() {
            var code = "x = 5 ; kg\ny = sin(x) ; kg2.s/m\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(createScript(code));
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(), expected);
        });
    });

    suite("user-defined functions", function() {
        test("default settings, single function, no units", function() {
            var code = "x = 5\ny = sin(x)\nz(a, b) = a + 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(createScript(code));
            var expected = 4 + 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(4), expected);
        });

        test("default settings, function chaining, no units", function() {
            var code = "x(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(createScript(code));
            var expected = Math.sin(9);
            assert.equal(output.exe.y(4), expected);
        });

        test("default settings, shadowing, no units", function() {
            var code = "a = 100\nx(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(createScript(code));
            var expected = Math.sin(9);
            assert.equal(output.exe.y(4), expected);
        });
    });
});
