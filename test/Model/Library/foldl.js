suite("Foldl", function() {

    var assert;
    var fileLoader;

    setup(function(done) {
        requirejs(["assert", "Model/FileLoader"], function(Assert, FileLoader) {
            assert = Assert;
            fileLoader = new FileLoader();
            fileLoader.load("foldl","library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("add", "library");
            fileLoader.load("multiply", "library");
            fileLoader.load("and", "library");
            fileLoader.load("or", "library");
            fileLoader.load("max", "library");
            fileLoader.load("min", "library");
            fileLoader.load("vLen", "library");
            done();
        });
    });

    /**
     * Summing.
     *
     * @input       foldl([1, 2, 3, 4, 5])
     * @expected    15
     */
    test("| Summing", function() {
        eval(fileLoader.getContent());
        var input = [1, 2, 3, 4, 5];
        var output = foldl(input, add);
        var expected = 15;
        assert.equal(output, expected);
    });

    /**
     * Summing nested.
     *
     * @input       foldl([1, 1], [2, 2], [3, 3], [4, 4], [5, 5])
     * @expected    [15, 15]
     */
    test("| Summing nested", function() {
        eval(fileLoader.getContent());
        var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
        var output = foldl(input, add);
        var expected = [15, 15];
        assert.deepEqual(output, expected);
    });

    /**
     * Product.
     *
     * @input       foldl([1, 2, 3, 4, 5])
     * @expected    120
     */    
    test("| Product", function() {
        eval(fileLoader.getContent());
        var input = [1, 2, 3, 4, 5];
        var output = foldl(input, multiply);
        var expected = 120;
        assert.equal(output, expected);
    });

    /**
     * Product nested.
     *
     * @input       foldl([1, 1], [2, 2], [3, 3], [4, 4], [5, 5])
     * @expected    [120, 120]
     */
    test("| Product nested", function() {
        eval(fileLoader.getContent());
        var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
        var output = foldl(input, multiply);
        var expected = [120, 120];
        assert.deepEqual(output, expected);
    });

    /**
     * And folding.
     *
     * @input       foldl([true, false, true, false, true])
     * @expected    false
     */
    test("| And", function() {
        eval(fileLoader.getContent());
        var input = [true, false, true, false, true];
        var output = foldl(input, and);
        var expected = false;
        assert.equal(output, expected);
    });

    /**
     * And nested folding.
     *
     * @input       foldl([[true, false], [false, true], [true, false], [false, true], [true, false]])
     * @expected    [false, false]
     */
    test("| And nested", function() {
        eval(fileLoader.getContent());
        var input = [[true, false], [false, true], [true, false], [false, true], [true, false]];
        var output = foldl(input, and);
        var expected = [false, false];
        assert.deepEqual(output, expected);
    });

    /**
     * Or folding.
     *
     * @input       foldl([true, false, true, false, true])
     * @expected    true
     */
    test("| Or", function() {
        eval(fileLoader.getContent());
        var input = [true, false, true, false, true];
        var output = foldl(input, or);
        var expected = true;
        assert.equal(output, expected);
    });

    /**
     * And nested folding.
     *
     * @input       foldl([[true, false], [false, true], [true, false], [false, true], [true, false]])
     * @expected    [true, true]
     */
    test("| Or nested", function() {
        eval(fileLoader.getContent());
        var input = [[true, false], [false, true], [true, false], [false, true], [true, false]];
        var output = foldl(input, or);
        var expected = [true, true];
        assert.deepEqual(output, expected);
    });

    /**
     * Find the maximum value of an array.
     *
     * @input       foldl([1, 2, 3, 4, 5])
     * @expected    5
     */
    test("| Max", function() {
        eval(fileLoader.getContent());
        var input = [1, 2, 3, 4, 5];
        var output = foldl(input, max);
        var expected = 5;
        assert.equal(output, expected);
    });

    /**
     * Find the maximum values of nested arrays.
     *
     * @input       foldl([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])
     * @expected    [5, 5]
     */
    test("| Max nested", function() {
        eval(fileLoader.getContent());
        var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
        var output = foldl(input, max);
        var expected = [5, 5];
        assert.deepEqual(output, expected);
    });

    /**
     * Find the minimum value of an array.
     *
     * @input       foldl([1, 2, 3, 4, 5])
     * @expected    1
     */
    test("| Min", function() {
        eval(fileLoader.getContent());
        var input = [1, 2, 3, 4, 5];
        var output = foldl(input, min);
        var expected = 1;
        assert.equal(output, expected);
    });

    /**
     * Find the minimum values of nested arrays.
     *
     * @input       foldl([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])
     * @expected    [1, 1]
     */
    test("| Min nested", function() {
        eval(fileLoader.getContent());
        var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
        var output = foldl(input, min);
        var expected = [1, 1];
        assert.deepEqual(output, expected);
    });
});
