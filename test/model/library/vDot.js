suite("vDot Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'vDot' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vDot", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vDot", function() {

        test("dot product of two vectors", function() {
            eval(fileLoader.getContent());
            x = [2, 5];
            y = [3, 7];
            expected = 41;
            output = vDot(x, y);
            assert.deepEqual(output, expected);
        });

        test("dot product of two named vectors", function() {
            eval(fileLoader.getContent());
            x = {};
            x['a'] = 2;
            x['b'] = 3;
            x['c'] = 4;
            y = {};
            y['a'] = 2;
            y['b'] = 3;
            y['d'] = 4;
            expected = 13;
            output = vDot(x, y);
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vDot(z, y), y = [[1, 1],[0, -1]], z = [[2, 4],[3, 5]]'", function() {
            var input = "x = vDot(z, y)\ny = [1, 1]\nz = [2, 4]";
            expected = 6;
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.__x__(), expected);
        });
    });
});
