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
            fileLoader.load("nZip", "library");
            fileLoader.load("zip", "library");
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

        test("nZip(): add two arrays", function() {
            eval(fileLoader.getContent());
            setUpAddTwoArrays();
            output = nZip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        test("nZipCees(): add two arrays", function() {
            eval(fileLoader.getContent());
            setUpAddTwoArrays();
            output = nZipCees([input1, input2], addCees);
            assert.deepEqual(output, expected);
        });

        test("zip(): add two scalars", function() {
            eval(fileLoader.getContent());
            setUpAddTwoScalars();
            output = zip(input1, input2, add);
            assert.deepEqual(output, expected);
        });

        test("nZip(): add two scalars", function() {
            eval(fileLoader.getContent());
            setUpAddTwoScalars();
            output = nZip([input1, input2], add);
            assert.deepEqual(output, expected);
        });

        test("nZipCees(): add two scalars", function() {
            eval(fileLoader.getContent());
            setUpAddTwoScalars();
            output = nZipCees([input1, input2], addCees);
            assert.deepEqual(output, expected);
        });

        //----------------------------------------------------------------------

        var testAddTwoArraysLength1 = "@benchmark: add two arrays of length 1";
        test(testAddTwoArraysLength1, function () {
            console.log(testAddTwoArraysLength1);
            var input1 = RandomNumberArray(1, 1000, 1);
            var input2 = RandomNumberArray(1, 1000, 1);
            eval(fileLoader.getContent());
            new benchmark.Suite()
            // add tests
            .add('zip()', function() {
                zip(input1, input2, add);
            })
            .add('nZip()', function() {
                nZip([input1, input2], add);
            })
            .add('nZipCees()', function() {
                nZipCees([input1, input2], addCees);
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
        });

        var testAddTwoArraysLength10 = "@benchmark: add two arrays of length 10";
        test(testAddTwoArraysLength10, function () {
            console.log(testAddTwoArraysLength10);
            var input1 = RandomNumberArray(1, 1000, 10);
            var input2 = RandomNumberArray(1, 1000, 10);
            eval(fileLoader.getContent());
            new benchmark.Suite()
            // add tests
            .add('zip()', function() {
                zip(input1, input2, add);
            })
            .add('nZip()', function() {
                nZip([input1, input2], add);
            })
            .add('nZipCees()', function() {
                nZipCees([input1, input2], addCees);
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
        });

        var testAddTwoArraysLength100 = "@benchmark: add two arrays of length 100";
        test(testAddTwoArraysLength100, function () {
            console.log(testAddTwoArraysLength100);
            var input1 = RandomNumberArray(1, 1000, 100);
            var input2 = RandomNumberArray(1, 1000, 100);
            eval(fileLoader.getContent());
            new benchmark.Suite()
            // add tests
            .add('zip()', function() {
                zip(input1, input2, add);
            })
            .add('nZip()', function() {
                nZip([input1, input2], add);
            })
            .add('nZipCees()', function() {
                nZipCees([input1, input2], addCees);
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
        });

        //----------------------------------------------------------------------

        var testAddTwoNestedArraysLength1 = "@benchmark: add two nested arrays of length 1";
        test(testAddTwoNestedArraysLength1, function () {
            console.log(testAddTwoNestedArraysLength1);
            var input1 = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            var input2 = RandomNumberArrayNested(1, 1000, 1, 1, 1);
            eval(fileLoader.getContent());
            new benchmark.Suite()
            // add tests
            .add('zip()', function() {
                zip(input1, input2, add);
            })
            .add('nZip()', function() {
                nZip([input1, input2], add);
            })
            .add('nZipCees()', function() {
                nZipCees([input1, input2], addCees);
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
        });

        var testAddTwoNestedArraysLength5 = "@benchmark: add two nested arrays of length 5";
        test(testAddTwoNestedArraysLength5, function () {
            console.log(testAddTwoNestedArraysLength5);
            var input1 = RandomNumberArrayNested(1, 1000, 5, 5, 5);
            var input2 = RandomNumberArrayNested(1, 1000, 5, 5, 5);
            eval(fileLoader.getContent());
            new benchmark.Suite()
            // add tests
            .add('zip()', function() {
                zip(input1, input2, add);
            })
            .add('nZip()', function() {
                nZip([input1, input2], add);
            })
            .add('nZipCees()', function() {
                nZipCees([input1, input2], addCees);
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
        });
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

function nZipCees(x, f) {
    // x= array of arguments, starting with 0
    // f=Jensen's device, that is: the pointer to the actual function that is to be evaluated
    // first see if any of the arguments is an array
    var l = Number.MAX_VALUE;
    var n = x.length;
    var ntm = false;
    for (var i = 0; i < n; i++) {
        if (x[i]instanceof Array) {
            ntm = true;
        }
    }
    if (!ntm) {
        return f(x);
    } else {
        var rr,xx,k;
        for (var i = 0; i < n; i++) {
            if (x[i]instanceof Array) {
                // we are tolerant with respect to
                // size mismatches.
                l = Math.min(l, x[i].length);
            }
        }
        rr = [];
        for (var j = 0; j < l; j++) {
            xx = [];
            for (var i = 0; i < n; i++) {
                if (!(x[i]instanceof Array)) {
                    xx[i] = x[i];
                } else {
                    xx[i]=x[i][j];
                }
            }
            rr[j] = nZipCees(xx, f);
        }
        // perhaps there are also non-integer indices. These are not seen
        // by the length-operator; we need to use the for(var in array)-construction.
        var keys = [];
        for (i = 0; i < n; i++) {
            if (x[i]instanceof Array) {
                for (j in x[i]) {
                    if (!isNumeric(j)) {
                        if(keys.indexOf(j)== -1)
                            keys.push(j);
                    }
                }
            }
        }
        // the array keys now contains the keys that occur in at least one of the arrays
        for (k = 0; k < keys.length; k++) {
            var occursInAll = true;
            xx=[];
            for (i = 0; i < n; i++) {
                if (!(x[i]instanceof Array)) {
                    xx[i] = x[i];
                } else {
                    if (x[i][keys[k]] != undefined) {
                        xx[i]=x[i][keys[k]];
                    } else {
                        occursInAll = false;
                    }
                }
            }
            if (occursInAll) {
                rr[keys[k]] = nZipCees(xx, f);
            }
        }
        return rr;
    }
}

function addCees(x) {
    return x[0] + x[1];
}

function isNumeric (o) {
    return ! isNaN (o-0);
}
