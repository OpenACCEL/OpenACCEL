suite("vConcat Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'vConcat' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vConcat", "library");
            fileLoader.load("vLen", "library");
            done();
        });
    });

    suite("vConcat", function() {

        test("concatinate a scalar to a scalar", function() {
            eval(fileLoader.getContent());
            x = 1;
            y = 2;
            output = vConcat(x, y);
            assert.deepEqual(output, [1, 2]);
        });

        test("concatinate a scalar to a vector", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            y = 4;
            output = vConcat(x, y);
            expected = {};
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = 4;
            assert.deepEqual(output, expected);
        });

        test("concatinate a vector to a scalar", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            y = 4;
            output = vConcat(y, x);
            expected = {};
            expected[0] = 4;
            expected[1] = 1;
            expected[2] = 2;
            assert.deepEqual(output, expected);
        });

        test("concatinate a vector to a vector", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            y = [4, 5];
            output = vConcat(x, y);
            expected = {};
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = 4;
            expected[3] = 5;
            assert.deepEqual(output, expected);
        });

        test("concatinate a named vector to a named vector", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x['a'] = 2;
            y = {};
            y[4] = 4;
            y['b'] = 5;
            output = vConcat(x, y);
            expected = {};
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = 4;
            expected[3] = 5;
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vConcat(y, z), y = [1,0], z = [3,4]'", function() {
            var input = "x = vConcat(y, z)\ny = [1,0]\nz = [3,4]";
            var output = compiler.compile(new Script(input));
            expected = {};
            expected[0] = 1;
            expected[1] = 0;
            expected[2] = 3;
            expected[3] = 4;
            assert.deepEqual(output.exe.__x__(), expected);
        });
    });
});
