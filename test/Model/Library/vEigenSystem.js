suite("vEigenSystem Library", function() {
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

    suite("vEigenSystem", function() {
        /**
         * Test case for vEigenSystem.
         *
         * @input:vEigenSystem([[4,4],[2,2]])
         * @expected: [[6,0],[0,0],[[0.89,-0.75],[0.45,0.75]]]
         */
        test("m=vEigenSystem([[4,4],[2,2]]) = [[6,0],[0,0],[[0.89,-0.75],[0.45,0.75]]]", function() {
            eval(fileLoader.getContent());

            var expected = [
                [6, 0],
                [0, 0],
                [
                    [0.89, -0.75],
                    [0.45, 0.75]
                ]
            ];
            var result = vEigenSystem([
                [4, 4],
                [2, 2]
            ]);
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
            "a = [[4,4],[2,2]] ; [[kg, kg], [kg, kg]]\n" +
            "z = vEigenSystem(a)\n" +
            "y = vEigenSystem([[4,4],[2,2]])";
            var output = compiler.compile(new script(input)); 

            var resultZ = output.__z__();
            var resultY = output.__y__();
            var expected = [
                [6, 0],
                [0, 0],
                [
                    [0.89, -0.75],
                    [0.45, 0.75]
                ]
            ];

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
            checkIt(UnitObject.prototype.toArray(resultY), expected);
            checkIt(UnitObject.prototype.toArray(resultZ), expected);

            // Check units of the three vectors. First 2 vectors should have
            // the same unit as the input matrix, the last vector should be unitless
            for (var i=0; i<=2; i++) {
                // Must be unitless
                if (i === 2) {
                    for (var j=0; j<resultZ[2].length; j++) {
                        assert.equal(true, UnitObject.prototype.isNormal(resultZ[i][j]));
                        assert.ifError(resultZ[i][j].error);

                        assert.equal(true, UnitObject.prototype.isNormal(resultY[i][j]));
                        assert.ifError(resultZ[i][j].error);
                    }
                } else {
                    for (var j=0; j<resultZ[i].length; j++) {
                        assert.deepEqual(resultZ[i][j].unit, {'kg':1});
                        assert.ifError(resultZ[i][j].error);

                        assert.equal(true, UnitObject.prototype.isNormal(resultY[i][j]));
                        assert.ifError(resultZ[i][j].error);
                    }
                }    
            }
        });
    });
});
