suite("vSequence Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            console.log("Loaded 'vSequence' module.");
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vSequence", "library");
            fileLoader.load("vSeq", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vSequence", function() {

        test("create a sequence from 2 through 5", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = 5;
            expected = [2, 3, 4];
            output = vSequence(x, y);
            assert.deepEqual(output, expected);
        });

        test("create an empty sequence from 5 through 2", function() {
            eval(fileLoader.getContent());
            x = 5;
            y = 2;
            expected = [];
            output = vSequence(x, y);
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vSequence(3, 7)'", function() {
            var input = "x = vSequence(3, 7)";
            expected = [3, 4, 5, 6];
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.exe.__x__(), expected);
        });
    });
});
