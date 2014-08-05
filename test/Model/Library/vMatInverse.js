suite("vMatInverse Library", function() {
    var compiler;
    var macros;
    var assert;
    var script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader, Script) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("Functions", "library");
            script = Script;
            done();
        });
    });

    suite("| vMatInverse", function() {

        /**
         * Test case for vMatInverse.
         *
         * @input: vMatInverse(vMatInverse([[3,4,5],[23,56,67],[1,8,7]]))
         * @expected: [[3.0,4.0,5.0],[23,56,67],[1.0,8,7]]
         */
        test("| vMatInverse(vMatInverse([[3,4,5],[23,56,67],[1,8,7]])) = [[3.0,4.0,5.0],[23,56,67],[1.0,8,7]]", function() {
            eval(fileLoader.getContent());

            var expected = [[3.0,4.0,5.0],[23,56,67],[1.0,8,7]];
            var result = vMatInverse(vMatInverse([[3,4,5],[23,56,67],[1,8,7]]));
            var delta = 0.1;
            function checkIt(actual, exp) {
                if (actual instanceof Object) {
                    for (var key in actual) {
                        checkIt(actual[key], exp[key]);
                    }
                } else {
                    assert(Math.abs(actual - exp) < delta );
                }
            }

            checkIt(result, expected);
        });
    });

    /**
     * Unit tests
     */
    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = [[3,4,5],[23,56,67],[1,8,7]] ; [[kg, kg, kg], [kg, kg, kg], [kg, kg, kg]]\n" +
            "z = vMatInverse(a)\n" +
            "y = vMatInverse([[3,4,5],[23,56,67],[1,8,7]])";
            var output = compiler.compile(new script(input)); 

            var resultZ = output.__z__();
            var resultY = output.__y__();
            var expected = [[0.8571428571428562,-0.07142857142857133,0.07142857142857109],[0.5595238095238093,-0.09523809523809519,0.5119047619047616],[-0.7619047619047614,0.11904761904761897,-0.452380952380952]];

            var delta = 0.01;
            function checkIt(actual, exp) {
                if (actual instanceof Object) {
                    for (var key in actual) {
                        checkIt(actual[key], exp[key]);
                    }
                } else {
                    assert(Math.abs(actual - exp) < delta);
                }
            }

            // Check values
            checkIt(UnitObject.prototype.toArray(resultZ), expected);
            checkIt(UnitObject.prototype.toArray(resultY), expected);

            // All units should be the inverse of the input units as well
            for (var i=0; i<=2; i++) {
                for (var j=0; j<resultZ[i].length; j++) {
                    assert.deepEqual(resultZ[i][j].unit, {'kg':-1});
                    assert.ifError(resultZ[i][j].error);

                    assert.equal(true, resultY[i][j].isNormal());
                    assert.ifError(resultY[i][j].error);
                }  
            }
        });
    });
});
