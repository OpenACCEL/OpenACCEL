suite("vMatMatMul Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(assertModule, module, FileLoader, scriptModule) {
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vMatMatMul", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vMatMatMul", function() {

        test("multiply two scalars", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = 3;
            expected = 6;
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply a scalar by a vector", function() {
            eval(fileLoader.getContent());
            x = 3;
            y = [1, 2, 4];
            expected = [3, 6, 12];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply a vector by a scalar", function() {
            eval(fileLoader.getContent());
            x = [1, 2, 4];
            y = 3;
            expected = [3, 6, 12];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply two vectors", function() {
            eval(fileLoader.getContent());
            x = [3, 4];
            y = [1, 2];
            expected = 11;
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply a scalar by a matrix", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = [
                [3, 4],
                [4, 5],
                [9, 8]
            ];
            expected = [
                [6, 8],
                [8, 10],
                [18, 16]
            ];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply multiply a matrix by a scalar", function() {
            eval(fileLoader.getContent());
            x = [
                [3, 4],
                [4, 5],
                [9, 8]
            ];
            y = 2;
            expected = [
                [6, 8],
                [8, 10],
                [18, 16]
            ];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply a vector by a matrix", function() {
            eval(fileLoader.getContent());
            x = [2, 3];
            y = [
                [4, 4],
                [3, 5]
            ];
            expected = [17, 23];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply a matrix by a vector", function() {
            eval(fileLoader.getContent());
            x = [
                [4, 4],
                [3, 5]
            ];
            y = [2, 3];
            expected = [20, 21];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply two matrices", function() {
            eval(fileLoader.getContent());
            x = [
                [2, 4],
                [3, 5]
            ];
            y = [
                [1, 1],
                [0, -1]
            ];
            expected = [
                [2, -2],
                [3, -2]
            ];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply two vectors as matrices, row by column (dot product)", function() {
            eval(fileLoader.getContent());
            x = [
                [2, 3, 4]
            ];
            y = [
                [5],
                [6],
                [7]
            ];
            expected = [
                [56]
            ];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        test("multiply two vectors as matrices, column by row", function() {
            eval(fileLoader.getContent());
            x = [
                [5],
                [6],
                [7]
            ];
            y = [
                [2, 3, 4]
            ];
            expected = [
                [10, 15, 20],
                [12, 18, 24],
                [14, 21, 28]
            ];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });
    });

    suite("expansion", function() {

        test("should expand for 'x = vMatMatMul(z, y), y = [[1, 1],[0, -1]], z = [[2, 4],[3, 5]]'", function() {
            var input = "x = vMatMatMul(z, y)\ny = [[1, 1],[0, -1]]\nz = [[2, 4],[3, 5]]";
            expected = [
                [2, -2],
                [3, -2]
            ];
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });
});
