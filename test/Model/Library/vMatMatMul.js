suite("vMatMatMul Library", function() {
    var compiler;
    var macros;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(assertModule, module, FileLoader, scriptModule) {
            assert = assertModule;
            compiler = new module();
            fileLoader = new FileLoader();
            Script = scriptModule;
            fileLoader.load("vMatMatMul", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("| vMatMatMul", function() {

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul(2,3)
         * @expected 6
         */
        test("| Multiply two scalars", function() {
            eval(fileLoader.getContent());
            x = 2;
            y = 3;
            expected = 6;
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul(3,[1,2,4])
         * @expected [3, ,6 12]
         */
        test("| Multiply a scalar by a vector", function() {
            eval(fileLoader.getContent());
            x = 3;
            y = [1, 2, 4];
            expected = [3, 6, 12];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([1, 2, 4],3)
         * @expected [3, 6, 12]
         */
        test("| Multiply a vector by a scalar", function() {
            eval(fileLoader.getContent());
            x = [1, 2, 4];
            y = 3;
            expected = [3, 6, 12];
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([3, 4], [1, 2])
         * @expected 11
         */
        test("| Multiply two vectors", function() {
            eval(fileLoader.getContent());
            x = [3, 4];
            y = [1, 2];
            expected = 11;
            output = vMatMatMul(x, y);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul(2, [[3,4],[4,5],[9,8]])
         * @expected [[6,8],[8,10],[18,16]]
         */
        test("| Multiply a scalar by a matrix", function() {
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

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([[3,4],[4,5],[9,8]], 2)
         * @expected [[6,8],[8,10],[18,16]]
         */
        test("| Multiply multiply a matrix by a scalar", function() {
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

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([2,3], [[4,4],[3,5]])
         * @expected [17,23]
         */
        test("| Multiply a vector by a matrix", function() {
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

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([[4,4], [3,5], [2,3])
         * @expected [20,21]
         */
        test("| Multiply a matrix by a vector", function() {
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

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([[2,4],[3,5]], [[1,1],[0,-1]])
         * @expected [[2,-2], [3,-2]]
         */
        test("| Multiply two matrices", function() {
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

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([[2,3,4]], [[5],[6],[7]])
         * @expected [56]
         */
        test("| Multiply two vectors as matrices, row by column (dot product)", function() {
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

        /**
         * Test case for vMatMatMul.
         *
         * @input vMatMatMul([[5],[6],[7]], [[2,3,4]])
         * @expected [[10,15,20],[12,18,24],[14,21,28]]
         */
        test("| Multiply two vectors as matrices, column by row", function() {
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

    suite("Expansion", function() {

        /**
         * Test expansion of vMatMatMul.
         *
         * @input x = vMatMatMul(z, y)
         *        y = [[1, 1],[0, -1]]
         *        z = [[2, 4],[3, 5]]
         * @expected x = [[2,-2],[3,-2]]
         */
        test("Should expand for 'x = vMatMatMul(z, y), y = [[1, 1],[0, -1]], z = [[2, 4],[3, 5]]'", function() {
            compiler.setUnits(false);
            var input = "x = vMatMatMul(z, y)\ny = [[1, 1],[0, -1]]\nz = [[2, 4],[3, 5]]";
            expected = [
                [2, -2],
                [3, -2]
            ];
            var output = compiler.compile(new Script(input));
            assert.deepEqual(output.__x__(), expected);
        });
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "x = vMatMatMul(z, y)\n" +
            "y = [[1, 1],[0, -1]] ; [[kg,kg],[kg,kg]]\n" +
            "z = [[2, 4],[3, 5]] ; [[d,d],[d,d]]\n" +
            "u = vMatMatMul([[4,4], [3,5]], [2,3])\n";
            var output = compiler.compile(new Script(input));

            var expected1 = UnitObject.prototype.create([[2,-2],[3,-2]], {'kg':1, 'd':1});
            assert.deepEqual(output.__x__(), expected1);
            assert.ifError(output.__x__().error);

            var expected2 = UnitObject.prototype.create([20,21], {});
            assert.deepEqual(output.__u__(), expected2);
            assert.equal(true, UnitObject.prototype.isNormal(output.__u__()));
            assert.ifError(output.__u__().error);
        });
    });
});
