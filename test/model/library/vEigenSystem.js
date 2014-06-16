suite("vEigenSystem Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            console.log("Loaded 'vEigenSystem' module.");
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("functions", "library");
            done();
        });
    });

    suite("vEigenSystem", function() {

        /**
         * Test case for vEigenSystem.
         *
         * input:vEigenSystem([[4,4],[2,2]])
         * expected: [[6,0],[0,0],[[0.89,-0.75],[0.45,0.75]]]
         */
        test("m=vEigenSystem([[4,4],[2,2]]) = [[6,0],[0,0],[[0.89,-0.75],[0.45,0.75]]]", function() {
            eval(fileLoader.getContent());

            var expected = [[6,0],[0,0],[[0.89,-0.75],[0.45,0.75]]];
            var result = vEigenSystem([[4,4],[2,2]]);
            var delta = 0.01;
            function check(actual, exp) {
                if (actual instanceof Object) {
                    for (var key in actual) {
                        check(actual[key], exp[key]);
                    }
                } else {
                    assert(Math.abs(actual - exp) < delta );
                }
            }

            check(result, expected);
        });

    });
});
