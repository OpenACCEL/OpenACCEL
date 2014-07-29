suite("vEigenSystem Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("Functions", "library");
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
});