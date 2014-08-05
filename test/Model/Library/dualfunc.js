suite("Dualfunc", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            var fileLoader = new FileLoader();
            fileLoader.load("sin", "library");
            script = Script;
            macros = fileLoader.getContent();
            done();
        });
    });

    /**
     * Adding simple arrays.
     *
     * @input       x = [1, 2] + [3, 4]
     * @expected    x = [4, 6]
     */
    test("| Add: simple array", function() {
        compiler.setUnits(false);
        var input = "x = [1,2] + [3,4]";
        var output = compiler.compile(new script(input)).__x__();
        var expected = [4,6];
        assert.deepEqual(output, expected);
    });

    /**
     * Adding nested arrays.
     *
     * @input       x = [1, [2, 3], 4] + [5, [6, 7], 8]
     * @expected    x = [6, [8, 10], 12]
     */
    test("| Add: nested array", function() {
        compiler.setUnits(false);
        var input = "x = [1,[2,3],4] + [5,[6,7],8]";
        var output = compiler.compile(new script(input)).__x__();
        var expected = [6,[8,10], 12];
        assert.deepEqual(output, expected);
    });

    /**
     * Adding a scalar to an array should add that scalar value to all array elements.
     *
     * @input       x = 4 + [1, 2, 3]
     * @expected    x = [5, 6, 7]
     */
    test("| Add: simple array and scalar reversed", function() {
        compiler.setUnits(false);
        var input = "x = 4 + [1,2,3]";
        var output = compiler.compile(new script(input)).__x__();
        var expected = [5,6,7];
        assert.deepEqual(output, expected);
    });

    /**
     * Adding a scalar to an array should add that scalar value to all array elements.
     *
     * @input       x = [1, 2, 3] + 4
     * @expected    x = [5, 6, 7]
     */
    test("| Add: simple array and scalar", function() {
        compiler.setUnits(false);
        var input = "x = [1,2,3] + 4";
        var output = compiler.compile(new script(input)).__x__();
        var expected = [5,6,7];
        assert.deepEqual(output, expected);
    });

    /**
     * Adding a scalar to an array should add that scalar value to all array elements, even when nested.
     *
     * @input       x = [1, [2, 3], 4] + 5
     * @expected    x = [6, [7, 8], 9]
     */
    test("| Add: nested array and scalar", function() {
        compiler.setUnits(false);
        var input = "x = [1,[2,3],4] + 5";
        var output = compiler.compile(new script(input)).__x__();
        var expected = [6,[7,8],9];
        assert.deepEqual(output, expected);
    });

    /**
     * When automapping two arrays of different length, do as much as you can and discard the remaining elements.
     *
     * @input       x = [1, 2, 3] - [4, 5]
     * @expected    x = [-3, -3]
     */
    test("| Add: arrays different length", function() {
        compiler.setUnits(false);
        var input = "x = [1,2,3] - [4,5]";
        var output = compiler.compile(new script(input)).__x__();
        var expected = [-3,-3];
        assert.deepEqual(output, expected);
    });
});
