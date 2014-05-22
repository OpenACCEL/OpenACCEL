suite("Zip", function() {

    var assert;
    var benchmark;
    var macroExpander;
    var fileLoader;

    setup(function(done) {
        requirejs(["assert", "benchmark", "model/macroexpander", "model/fileloader"], function(Assert, Benchmark, MacroExpander, FileLoader) {
            assert = Assert;
            benchmark = Benchmark;
            macroExpander = new MacroExpander();
            fileLoader = new FileLoader();
            fileLoader.load("add", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("nzip", "library");
            fileLoader.load("nzipcees", "test");
            console.log("Loaded 'MacroExpander & FileLoader' module.");
            done();
        });
    });

    suite("-- zip vs nzip --", function() {

        test("zip(): add two arrays", function() {
            eval(fileLoader.getContent());
            setUpAddTwoArrays();
            output = zip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        test("nzip(): add two arrays", function() {
            eval(fileLoader.getContent());
            setUpAddTwoArrays();
            output = nzip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        test("nzipcees(): add two arrays", function() {
            eval(fileLoader.getContent());
            setUpAddTwoArrays();
            output = nzipcees([input1, input2], addCees);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        test("zip(): add scalar to array", function() {
            eval(fileLoader.getContent());
            setUpAddTwoScalars();
            output = zip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        test("nzip(): add scalar to array", function() {
            eval(fileLoader.getContent());
            setUpAddTwoScalars();
            output = nzip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        test("nzipcees(): add scalar to array", function() {
            eval(fileLoader.getContent());
            setUpAddTwoScalars();
            output = nzipcees([input1, input2], addCees);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        var testAddTwoArraysLength1 = "@benchmark: add two arrays of length 1";
        test(testAddTwoArraysLength1, function () {
            var input1 = RandomNumberArray(1, 1000, 1);
            var input2 = RandomNumberArray(1, 1000, 1);
            setUpBenchmark(testAddTwoArraysLength1, input1, input2);
        });

        var testAddTwoArraysLength10 = "@benchmark: add two arrays of length 10";
        test(testAddTwoArraysLength10, function () {
            var input1 = RandomNumberArray(1, 1000, 10);
            var input2 = RandomNumberArray(1, 1000, 10);
            setUpBenchmark(testAddTwoArraysLength10, input1, input2);
        });

        var testAddTwoArraysLength100 = "@benchmark: add two arrays of length 100";
        test(testAddTwoArraysLength100, function () {
            var input1 = RandomNumberArray(1, 1000, 100);
            var input2 = RandomNumberArray(1, 1000, 100);
            setUpBenchmark(testAddTwoArraysLength100, input1, input2);
        });

        //----------------------------------------------------------------------

        var testAddTwoNestedArraysLength1 = "@benchmark: add two nested arrays of length 1";
        test(testAddTwoNestedArraysLength1, function () {
            var input1 = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            var input2 = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            setUpBenchmark(testAddTwoNestedArraysLength1, input1, input2);
        });

        var testAddTwoNestedArraysLength5 = "@benchmark: add two nested arrays of length 5";
        test(testAddTwoNestedArraysLength5, function () {
            var input1 = RandomNumberArrayNested(1, 1000, 5, 5, 5);
            var input2 = RandomNumberArrayNested(1, 1000, 5, 5, 5);
            setUpBenchmark(testAddTwoNestedArraysLength5, input1, input2);
        });
    });

    function setUpAddTwoArrays() {
        input1 = [1, 2, 3];
        input2 = [4, 5, 6];
        expected = [5, 7, 9];
    }

    function setUpAddTwoScalars() {
        input1 = [1, 1, [1, 1, [1, 1]]];
        input2 = 1;
        expected = [2, 2, [2, 2, [2, 2]]];
    }

    function setUpBenchmark(name, input1, input2) {
        console.log(name);
        eval(fileLoader.getContent());
        new benchmark.Suite()
        // add tests
        .add('zip()', function() {
            zip(input1, input2, add);
        })
        .add('nzip()', function() {
            nzip([input1, input2], add);
        })
        .add('nzipcees()', function() {
            nzipcees([input1, input2], addCees);
        })
        // add listeners
        .on('cycle', function(event) {
            console.log(String(event.target));
        })
        .on('complete', function() {
            console.log('Fastest is %s', this.filter('fastest').pluck('name'));
        })
        // run async
        .run({'async': false});
    }
});

/*
 * Return a random number between min and max.
 */
function RandomNumber(min, max) {
    return (Math.round((max - min) * Math.random() + min));
}

/*
 * Total elements:
 * numelements
 */
function RandomNumberArray(min, max, numElements) {
    var _array = [];
    for (var i = 0; i < numElements; i++) {
        _array[i] = RandomNumber(min, max);
    }
    return _array;
}

/*
 * Total elements:
 * numBranches^depth + (numElements - numBranches) * Sum[numBranches^i, {i, 0 , depth}]
 */
function RandomNumberArrayNested(min, max, numElements, numBranches, depth) {
    var _array = RandomNumberArray(min, max, numElements);
    if (depth === 0) {
        return _array;
    } else {
        for (var i = 0; i < numBranches; i++) {
            _array[i] = RandomNumberArrayNested(min, max, numElements, numBranches, depth - 1);
        }
        return _array;
    }
}
