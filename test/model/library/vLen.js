suite("vLen Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'vLen' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vLen", "library");
            done();
        });
    });

    suite("vLen", function() {

        test("get the domain of an array with only numeric indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            x[2] = 3;
            output = vLen(x);
            assert.deepEqual(output, 3);
        });

        test("get the domain of an array with mixed indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            x["a"] = 3;
            output = vLen(x);
            assert.deepEqual(output, 2);
        });

        test("get the domain of an array with only non-numeric indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x["a"] = 1;
            x["b"] = 2;
            x["c"] = 3;
            output = vLen(x);
            assert.deepEqual(output, 0);
        });

        test("get the domain of an array with a high number index", function() {
            eval(fileLoader.getContent());
            x = {};
            x[5] = 1;
            output = vLen(x);
            assert.deepEqual(output, 6);
        });

        test("get the domain of an array with a high number index and named indices", function() {
            eval(fileLoader.getContent());
            x = 2;
            output = vLen(x);
            assert.deepEqual(output, 0);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vLen(y), y = [1,0,0]'", function() {
            var input = "x = vLen(y)\ny = [1,0,0]";
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.__x__(), 3);
        });
    });
});
