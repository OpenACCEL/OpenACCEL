suite("Map", function() {
    var macroExpander;
    var macros;
    var assert;
    var fileLoader;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(assertModule, module, FileLoader) {
            console.log("Loaded 'MacroExpander & FileLoader' module.");
            assert = assertModule;
            macroExpander = new module();
            fileLoader = new FileLoader();
            fileLoader.load("map","library");
            done();
        });
    });

    suite("expansion", function() {
        

        // simple test function
        function square(x) {
            return x * x;
        }

        test("map(): scalar", function() {
            eval(fileLoader.getContent());
            var input = 5;
            var expected = 25;
            var output = map(input, square);
            assert.equal(output, expected);
        });

        test("map(): unnamed vector", function() {
            eval(fileLoader.getContent());
            var input = [2,3,4];
            var expected = [4,9,16];
            var output = map(input, square);
            assert.deepEqual(output, expected);
        });

        test("map(): named vector", function() {
            eval(fileLoader.getContent());
            var input = [];
            input.x = 2; input.y = 3; input.z = 4;
            var expected = [];
            expected.x = 4; expected.y = 9; expected.z = 16;
            var output = map(input, square);
            assert.deepEqual(output, expected);
        });

        test("map(): named + unnamed vector", function() {
            eval(fileLoader.getContent());
            var input = [2,3];
            input.z = 4;
            var expected = [4,9];
            expected.z = 16;
            var output = map(input, square);
            assert.deepEqual(output, expected);
        });

        test("map(): Nested vector", function() {
            eval(fileLoader.getContent());
            var input = [1,[2,[3,4],5],6,[7,8]];
            var expected = [1,[4,[9,16],25],36,[49,64]];
            var output = map(input, square);
            assert.deepEqual(output, expected);
        });

        test("map(): Nested vector", function() {
            eval(fileLoader.getContent());
            var input = [2];
            input[1] = [];
            input[1].x = 3; input[1].y = 4;
            var expected = [4];
            expected[1] = [];
            expected[1].x = 9; expected[1].y = 16;
            var output = map(input, square);
            assert.deepEqual(output, expected);
        });


    });
});