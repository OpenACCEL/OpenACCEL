suite("vAppend Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'vAppend' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vAppend", "library");
            fileLoader.load("vLen", "library");
            done();
        });
    });

    suite("vAppend", function() {

        test("append a scalar to a scalar", function() {
            eval(fileLoader.getContent());
            x = 1;
            y = 2;
            output = vAppend(x, y);
            assert.deepEqual(output, [1, 2]);
        });

        test("append a scalar to a vector", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            y = 4;
            output = vAppend(x, y);
            expected = {};
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = 4;
            assert.deepEqual(output, expected);
        });

        test("append a vector to a vector", function() {
            eval(fileLoader.getContent());
            x = {};
            x[0] = 1;
            x[1] = 2;
            y = [4, 5];
            output = vAppend(x, y);
            expected = {};
            expected[0] = 1;
            expected[1] = 2;
            expected[2] = [4, 5];
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vAppend(y, z), y = [1,0], z = 3'", function() {
            var input = "x = vAppend(y, z)\ny = [1,0]\nz = 3";
            var output = compiler.compile(new Script(input));
            expected = {};
            expected[0] = 1;
            expected[1] = 0;
            expected[2] = 3;
            assert.deepEqual(output.__x__(), expected);
        });
    });
});
