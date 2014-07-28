suite("@ Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("at", "library");
            script = Script;
            done();
        });
    });

    suite("@", function() {
        /**
         * Getting the index of a scalar should just return the scalar.
         *
         * @input       x = 3
         *              at(x, 1)
         * @expected    3
         */
        test("| At function with scalar to index", function() {
            eval(fileLoader.getContent());
            x = 3;
            y = 1;
            output = at(x, y);
            assert.deepEqual(output, 3);
        });

        /**
         * General index fetching, as you'd expect.
         *
         * @input       x = [1, 2, 3]
         *              at(x, 1)
         * @expected    2
         */
        test("| At function with simple vector to index", function() {
            eval(fileLoader.getContent());
            x = [1, 2, 3];
            y = 1;
            output = at(x, y);
            assert.deepEqual(output, 2);
        });

        /**
         * Should work for nested vectors.
         *
         * @input       x = [[1, 2], [2, 3], 3]
         *              at(x, 0)
         * @expected    [1, 2]
         */
        test("| At function with nested vector to index", function() {
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

        /**
         * You should be able to get multiple indices at once.
         *
         * @input       x = [1, 2, 3]
         *              y = [0, 2]
         *              at(x, y)
         * @expected    [1, 3]
         */
        test("| At function with simple vector to index by vector index", function() {
            eval(fileLoader.getContent());
            x = [1, 2, 3];
            y = [0, 2];
            output = at(x, y);
            expected = [1, 3];
            assert.deepEqual(output, expected);
        });

        /**
         * Get multiple indices with nested vectors.
         *
         * @input       x = [[1, 2], [2, 3], 3]
         *              y = [0, 2]
         *              at(x, y)
         * @expected    [[1, 2], 3]
         */
        test("| At function with nested vector to index by vector index", function() {
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

        /**
         * More nested vectors.
         *
         * @input       x = [[1, 2], [2, 3], 3]
         *              y = [0, [2, 1]]
         *              at(x, y)
         * @expected    [[1, 2], [3, [2, 3]]]
         */
        test("| At function with nested vector to index by nested vector index", function() {
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

        /**
         * An out of bound index should return an empty object.
         *
         * @input       x = [3]
         *              at(x, 1)
         * @expected    {}
         */
        test("| At function with vector to index and out of bound index", function() {
            eval(fileLoader.getContent());
            x = [3];
            y = 1;
            output = at(x, y);
            assert.deepEqual(output, {});
        });
    });

    suite("| Compiled", function() {
        /**
         * At function should work from the executable.
         *
         * @input       x = @([10, 30], 0)
         * @expected    x = 10
         */
        test("| Should expand for 'x = @([10,30], 0)'", function() {
            var input = "x = @([10,30], 0)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__x__(), 10);
        });

        /**
         * At function should work from the executable.
         *
         * @input       x = [5, 4, 2]
         *              y = [@(x, 1), 2, 3]
         *              z = @(y, @(x, 2))
         * @expected    z = 3
         */
        test("| Should expand for 'x = [5,4,2], y = [@(x,1), 2, 3], z = @(y,@(x,2))'", function() {
            var input = "x = [5,4,2]\ny = [@(x,1), 2, 3]\nz = @(y,@(x,2))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__z__(), 3);
        });
    });
});
