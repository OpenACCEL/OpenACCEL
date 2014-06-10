suite("@ Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            console.log("Loaded 'At' module.");
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("at", "library");
            script = Script;
            done();
        });
    });

    suite("@", function() {

        test("at function with scalar to index", function() {
            eval(fileLoader.getContent());
            x = 3;
            y = 1;
            output = at(x, y);
            assert.deepEqual(output, 3);
        });

        test("at function with simple vector to index", function() {
            eval(fileLoader.getContent());
            x = [1, 2, 3];
            y = 1;
            output = at(x, y);
            assert.deepEqual(output, 2);
        });

        test("at function with nested vector to index", function() {
            eval(fileLoader.getContent());
            x = [
                [1, 2],
                [2, 3], 3
            ];
            y = 0;
            output = at(x, y);
            expected = [1, 2];
            assert.deepEqual(output, expected);
        });

        test("at function with simple vector to index by vector index", function() {
            eval(fileLoader.getContent());
            x = [1, 2, 3];
            y = [0, 2];
            output = at(x, y);
            expected = [1, 3];
            assert.deepEqual(output, expected);
        });

        test("at function with nested vector to index by vector index", function() {
            eval(fileLoader.getContent());
            x = [
                [1, 2],
                [2, 3], 3
            ];
            y = [0, 2];
            output = at(x, y);
            expected = [
                [1, 2], 3
            ];
            assert.deepEqual(output, expected);
        });

        test("at function with nested vector to index by nested vector index", function() {
            eval(fileLoader.getContent());
            x = [
                [1, 2],
                [2, 3], 3
            ];
            y = [0, [2, 1]];
            output = at(x, y);
            expected = [
                [1, 2],
                [3, [2, 3]]
            ];
            assert.deepEqual(output, expected);
        });

        test("at function with vector to index and out of bound index", function() {
            eval(fileLoader.getContent());
            x = [3];
            y = 1;
            output = at(x, y);
            assert.deepEqual(output, {});
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = @([10,30], 0)'", function() {
            var input = "x = @([10,30], 0)";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.x(), 10);
        });

        test("should expand for 'x = [5,4,2], y = [@(x,1), 2, 3], z = @(y,@(x,2))'", function() {
            var input = "x = [5,4,2]\ny = [@(x,1), 2, 3]\nz = @(y,@(x,2))";
            var output = compiler.compile(new script(input));
            assert.equal(output.exe.z(), 3);
        });
    });
});
