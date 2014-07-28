suite("Zip", function() {

    var assert;
    var benchmark;
    var macroExpander;
    var fileLoader;

    setup(function(done) {
        requirejs(["assert", "benchmark", "Model/MacroExpander", "Model/FileLoader"], function(Assert, Benchmark, MacroExpander, FileLoader) {
            assert = Assert;
            benchmark = Benchmark;
            macroExpander = new MacroExpander();
            fileLoader = new FileLoader();
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("nzipcees", "test");
            done();
        });
    });

    suite("zip and nzip", function() {

        /**
         * Test case for binary zip, add two vectors.
         *
         * @input binaryZip([1,2,3], [4,5,6], add)
         * @expected [5,7,9]
         */
        test("binaryZip(): add two vectors", function() {
            eval(fileLoader.getContent());
            setUpAddTwoVectors();
            output = binaryZip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for multiary zip, add two vectors.
         *
         * @input multiaryZip([[1,2,3], [4,5,6]], add)
         * @expected [5,7,9]
         */
        test("multiaryZip(): add two vectors", function() {
            eval(fileLoader.getContent());
            setUpAddTwoVectors();
            output = multiaryZip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for zip, add two vectors.
         *
         * @input zip([[1,2,3], [4,5,6]], add)
         * @expected [5,7,9]
         */
        test("zip(): add two vectors", function() {
            eval(fileLoader.getContent());
            setUpAddTwoVectors();
            output = zip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        /**
         * Test case for binary zip, add scalar to vector.
         *
         * @input binaryZip([1, 1, [1, 1, [1, 1]]], 1, add)
         * @expected [2, 2, [2, 2, [2, 2]]]
         */
        test("binaryZip(): add scalar to vector", function() {
            eval(fileLoader.getContent());
            setUpAddScalarToVector();
            output = binaryZip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for multiary zip, add scalar to vector.
         *
         * @input multiaryZip([[1, 1, [1, 1, [1, 1]]], 1], add)
         * @expected [2, 2, [2, 2, [2, 2]]]
         */
        test("multiaryZip(): add scalar to vector", function() {
            eval(fileLoader.getContent());
            setUpAddScalarToVector();
            output = multiaryZip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for zip, add scalar to vector.
         *
         * @input zip([[1, 1, [1, 1, [1, 1]]], 1], add)
         * @expected [2, 2, [2, 2, [2, 2]]]
         */
        test("zip(): add scalar to vector", function() {
            eval(fileLoader.getContent());
            setUpAddScalarToVector();
            output = zip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        /**
         * Test case for binaryZip, add vector to nested vector.
         *
         * @input binaryzip([1, 1, [1, 1, [1, 1, 1]]], [1, 1, 1, 1], add)
         * @expected [2, 2, [2, 2, [2, 2, 2]]]
         */
        test("binaryZip(): add vector to nested vector", function() {
            eval(fileLoader.getContent());
            setUpAddVectorToNestedVector();
            output = binaryZip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for multiaryZip, add vector to nested vector.
         *
         * @input multiaryzip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, 1, 1]], add)
         * @expected [2, 2, [2, 2, [2, 2, 2]]]
         */
        test("multiaryZip(): add vector to nested vector", function() {
            eval(fileLoader.getContent());
            setUpAddVectorToNestedVector();
            output = multiaryZip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for zip, add vector to nested vector.
         *
         * @input zip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, 1, 1]], add)
         * @expected [2, 2, [2, 2, [2, 2, 2]]]
         */
        test("zip(): add vector to nested vector", function() {
            eval(fileLoader.getContent());
            setUpAddVectorToNestedVector();
            output = zip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------
        /**
         * Test case for binary zip, add nested vector to nested vector.
         *
         * @input zip([1, 1, [1, 1, [1, 1, 1]]], [1, 1, [1, 1, [1, 1]], 1] , add)
         * @expected [2, 2, [2, 2, [2, 2]]]
         */
        test("binaryZip(): add two nested vectors", function() {
            eval(fileLoader.getContent());
            setUpAddTwoNestedVectors();
            output = binaryZip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for multiary zip, add nested vector to nested vector.
         *
         * @input multiaryZip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, [1, 1, [1, 1]], 1]] , add)
         * @expected [2, 2, [2, 2, [2, 2]]]
         */
        test("multiaryZip(): add two nested vectors", function() {
            eval(fileLoader.getContent());
            setUpAddTwoNestedVectors();
            output = multiaryZip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for zip, add nested vector to nested vector.
         *
         * @input Zip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, [1, 1, [1, 1]], 1]] , add)
         * @expected [2, 2, [2, 2, [2, 2]]]
         */
        test("zip(): add two nested vectors", function() {
            eval(fileLoader.getContent());
            setUpAddTwoNestedVectors();
            output = zip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        /**
         * Test case for zip().
         *
         * @input zip([[1,2,3],[4,5,6],[7,8,9]], sum)
         * @expected [12,15,18]
         */
        test("zip(): sum three vectors", function() {
            eval(fileLoader.getContent());
            input1 = [1, 2, 3];
            input2 = [4, 5, 6];
            input3 = [7, 8, 9];
            expected = [12, 15, 18];
            output = zip([input1, input2, input3], sum);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        /**
         * Test case for zip().
         *
         * @input zip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, [1, 1, [1, 1]], 1], 2], sum)
         * @expected [4, 4, [4, 4, [4, 4]]]
         */
        test("zip(): sum scalar to two nested vectors", function() {
            eval(fileLoader.getContent());
            input1 = [1, 1, [1, 1, [1, 1, 1]]];
            input2 = [1, 1, [1, 1, [1, 1]], 1];
            input3 = 2;
            expected = [4, 4, [4, 4, [4, 4]]];
            output = zip([input1, input2, input3], sum);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        /**
         * Test case for zip().
         *
         * @input zip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, [1, 1, [1, 1]], 1], [2, 2, 2, 2]], sum)
         * @expected [4, 4, [4, 4, [4, 4]]]
         */
        test("zip(): sum vector to two nested vectors", function() {
            eval(fileLoader.getContent());
            input1 = [1, 1, [1, 1, [1, 1, 1]]];
            input2 = [1, 1, [1, 1, [1, 1]], 1];
            input3 = [2, 2, 2, 2];
            expected = [4, 4, [4, 4, [4, 4]]];
            output = zip([input1, input2, input3], sum);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        /**
         * Test case for zip().
         *
         * @input zip([[1, 1, [1, 1, [1, 1, 1]]], [1, 1, [1, 1, [1, 1]], 1], [2, 2, [2, 2]]], sum)
         * @expected [4, 4, [4, 4]]
         */
        test("zip(): sum vector to two nested vectors", function() {
            eval(fileLoader.getContent());
            input1 = [1, 1, [1, 1, [1, 1, 1]]];
            input2 = [1, 1, [1, 1, [1, 1]], 1];
            input3 = [2, 2, [2, 2]];
            expected = [4, 4, [4, 4]];
            output = zip([input1, input2, input3], sum);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        var testAddTwoVectorsLength1 = "@benchmark: add two vectors of length 1";
        test(testAddTwoVectorsLength1, function() {
            var input1 = RandomNumberArray(1, 1000, 1);
            var input2 = RandomNumberArray(1, 1000, 1);
            var args = [input1, input2];
            setUpBenchmark(testAddTwoVectorsLength1, args);
        });

        var testAddTwoVectorsLength10 = "@benchmark: add two vectors of length 10";
        test(testAddTwoVectorsLength10, function() {
            var input1 = RandomNumberArray(1, 1000, 10);
            var input2 = RandomNumberArray(1, 1000, 10);
            var args = [input1, input2];
            setUpBenchmark(testAddTwoVectorsLength10, args);
        });

        var testAddTwoVectorsLength100 = "@benchmark: add two vectors of length 100";
        test(testAddTwoVectorsLength100, function() {
            var input1 = RandomNumberArray(1, 1000, 100);
            var input2 = RandomNumberArray(1, 1000, 100);
            var args = [input1, input2];
            setUpBenchmark(testAddTwoVectorsLength100, args);
        });

        //----------------------------------------------------------------------

        var testAddTwoNestedVectorsLength1 = "@benchmark: add two nested vectors of length 1";
        test(testAddTwoNestedVectorsLength1, function() {
            var input1 = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            var input2 = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            var args = [input1, input2];
            setUpBenchmark(testAddTwoNestedVectorsLength1, args);
        });

        var testAddTwoNestedVectorsLength5 = "@benchmark: add two nested vectors of length 5";
        test(testAddTwoNestedVectorsLength5, function() {
            var input1 = RandomNumberArrayNested(1, 1000, 5, 5, 5);
            var input2 = RandomNumberArrayNested(1, 1000, 5, 5, 5);
            var args = [input1, input2];
            setUpBenchmark(testAddTwoNestedVectorsLength5, args);
        });

        //----------------------------------------------------------------------

        var testAddOneNestedVectorsLength1 = "@benchmark: add one nested vectors of length 1";
        test(testAddOneNestedVectorsLength1, function() {
            var args = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            setUpBenchmark(testAddOneNestedVectorsLength1, args);
        });

        var testAddFourNestedVectorsLength5 = "@benchmark: add four nested vectors of length 5";
        test(testAddFourNestedVectorsLength5, function() {
            var args = RandomNumberArrayNested(1, 1000, 5, 4, 3);
            setUpBenchmark(testAddFourNestedVectorsLength5, args);
        });

        var testAddFiveNestedVectorsLength5 = "@benchmark: add five nested vectors of length 5";
        test(testAddFiveNestedVectorsLength5, function() {
            var args = RandomNumberArrayNested(1, 1000, 5, 5, 1);
            setUpBenchmark(testAddFiveNestedVectorsLength5, args);
        });

        var testAddTenNestedVectorsLength10 = "@benchmark: add ten nested vectors of length 10";
        test(testAddTenNestedVectorsLength10, function() {
            var args = RandomNumberArrayNested(1, 1000, 10, 10, 1);
            setUpBenchmark(testAddTenNestedVectorsLength10, args);
        });
    });

    function setUpAddTwoVectors() {
        input1 = [1, 2, 3];
        input2 = [4, 5, 6];
        expected = [5, 7, 9];
    }

    function setUpAddScalarToVector() {
        input1 = [1, 1, [1, 1, [1, 1]]];
        input2 = 1;
        expected = [2, 2, [2, 2, [2, 2]]];
    }

    function setUpAddVectorToNestedVector() {
        input1 = [1, 1, [1, 1, [1, 1, 1]]];
        input2 = [1, 1, 1, 1];
        expected = [2, 2, [2, 2, [2, 2, 2]]];
    }

    function setUpAddTwoNestedVectors() {
        input1 = [1, 1, [1, 1, [1, 1, 1]]];
        input2 = [1, 1, [1, 1, [1, 1]], 1];
        expected = [2, 2, [2, 2, [2, 2]]];
    }

    function setUpBenchmark(name, args) {
        console.log(name);
        eval(fileLoader.getContent());
        var benchmark_suite = new benchmark.Suite();
        var func = sum;
        var funcCees = sumCees;
        // add tests
        if (args.length === 2) {
            func = add;
            funcCees = addCees;
            benchmark_suite
                .add('binaryZip()', function() {
                    binaryZip(args[0], args[1], func);
                });
        }
        benchmark_suite
            .add('multiaryZip()', function() {
                multiaryZip(args, func);
            })
            .add('nzipcees()', function() {
                nzipcees(args, funcCees);
            })
        // add listeners
        .on('cycle', function(event) {
            console.log(String(event.target));
        })
            .on('complete', function() {
                console.log('Fastest is %s', this.filter('fastest').pluck('name'));
                assert.equal(this.filter('slowest').pluck('name'), "nzipcees()");
            })
        // run async
        .run({
            'async': false
        });
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
 * numElements
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
