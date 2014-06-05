suite("vDom Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'vDom' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vDom", "library");
            done();
        });
    });

    suite("vDom", function() {

        test("get the domain of an array with only numeric indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            x[2] = 3;
            output = vDom(x);
            expected = [0, 1, 2];
            assert.deepEqual(output, expected);
        });

        test("get the domain of an array with mixed indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            x["a"] = 3;
            output = vDom(x);
            expected = [0, 1, "a"];
            assert.deepEqual(output, expected);
        });

        test("get the domain of an array with only non-numeric indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x["a"] = 1;
            x["b"] = 2;
            x["c"] = 3;
            output = vDom(x);
            expected = ["a", "b", "c"];
            assert.deepEqual(output, expected);
        });

        test("get the domain of an array with a high number index", function() {
            eval(fileLoader.getContent());
            x = {};
            x[5] = 1;
            output = vDom(x);
            expected = [0, 1, 2, 3, 4, 5];
            assert.deepEqual(output, expected);
        });

        test("get the domain of an array with a high number index and named indices", function() {
            eval(fileLoader.getContent());
            x = {};
            x[5] = 1;
            x["a"] = 1;
            x["b"] = 2;
            output = vDom(x);
            expected = [0, 1, 2, 3, 4, 5, "a", "b"];
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vDom(y), y = [1,0,0]'", function() {
            var input = "x = vDom(y)\ny = [1,0,0]";
            expected = [0, 1, 2];
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.x(), expected);
        });
    });
});
