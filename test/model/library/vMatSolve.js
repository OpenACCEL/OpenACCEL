suite("vMatSolve Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            console.log("Loaded 'vMatSolve' module.");
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("functions", "library");
            done();
        });
    });

    suite("vMatSolve", function() {

        /**
         * Test case for vMatSolve.
         *
         * input:vMatSolve([[1,2],[3,4]],[1,2])
         * expected: [0,0.50]
         */
        test("m=vMatSolve([[1,2],[3,4]],[1,2]) = [0,0.50]", function() {
            eval(fileLoader.getContent());

            var expected = [0,0.50];
            var result = vMatSolve([[1,2],[3,4]],[1,2]);

            assert.deepEqual(result, expected);
        });

    });
});
