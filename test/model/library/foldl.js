suite("Foldl", function() {

    var assert;
    var macroExpander;
    var fileLoader;

    setup(function(done) {
        requirejs(["assert", "model/macroexpander", "model/fileloader"], function(Assert, MacroExpander, FileLoader) {
            assert = Assert;
            macroExpander = new MacroExpander();
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
            console.log("Loaded 'Foldl' module.");
            done();
        });
    });

    suite("folding:", function() {

        test("foldl(array, function): add", function() {
            eval(fileLoader.getContent());
            var input = [1, 2, 3, 4, 5];
            var output = foldl(input, add);
            var expected = 15;
            assert.equal(output, expected);
        });

        test("foldl(array, function): add nested", function() {
            eval(fileLoader.getContent());
            var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
            var output = foldl(input, add);
            var expected = [15, 15];
            assert.deepEqual(output, expected);
        });

        test("foldl(array, function): multiply", function() {
            eval(fileLoader.getContent());
            var input = [1, 2, 3, 4, 5];
            var output = foldl(input, multiply);
            var expected = 120;
            assert.equal(output, expected);
        });

        test("foldl(array, function): multiply nested", function() {
            eval(fileLoader.getContent());
            var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
            var output = foldl(input, multiply);
            var expected = [120, 120];
            assert.deepEqual(output, expected);
        });

        test("foldl(array, function): and", function() {
            eval(fileLoader.getContent());
            var input = [true, false, true, false, true];
            var output = foldl(input, and);
            var expected = false;
            assert.equal(output, expected);
        });

        test("foldl(array, function): and nested", function() {
            eval(fileLoader.getContent());
            var input = [[true, false], [false, true], [true, false], [false, true], [true, false]];
            var output = foldl(input, and);
            var expected = [false, false];
            assert.deepEqual(output, expected);
        });

        test("foldl(array, function): or", function() {
            eval(fileLoader.getContent());
            var input = [true, false, true, false, true];
            var output = foldl(input, or);
            var expected = true;
            assert.equal(output, expected);
        });

        test("foldl(array, function): or nested", function() {
            eval(fileLoader.getContent());
            var input = [[true, false], [false, true], [true, false], [false, true], [true, false]];
            var output = foldl(input, or);
            var expected = [true, true];
            assert.deepEqual(output, expected);
        });

        test("foldl(array, function): max", function() {
            eval(fileLoader.getContent());
            var input = [1, 2, 3, 4, 5];
            var output = foldl(input, max);
            var expected = 5;
            assert.equal(output, expected);
        });

        test("foldl(array, function): max nested", function() {
            eval(fileLoader.getContent());
            var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
            var output = foldl(input, max);
            var expected = [5, 5];
            assert.deepEqual(output, expected);
        });

        test("foldl(array, function): min", function() {
            eval(fileLoader.getContent());
            var input = [1, 2, 3, 4, 5];
            var output = foldl(input, min);
            var expected = 1;
            assert.equal(output, expected);
        });

        test("foldl(array, function): min nested", function() {
            eval(fileLoader.getContent());
            var input = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]];
            var output = foldl(input, min);
            var expected = [1, 1];
            assert.deepEqual(output, expected);
        });
    });
});
