suite("vAggregate Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("vAggregate", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vAggregate", function() {

        /**
         * Test case for vAggregate.
         * Based on an example of the help documentation
         * 
         * input: vAggregate([1,2,3,4],[10,[20,21,22]],1)
         * expected: [1, 10, [20, 21, 22], 2, 3, 4]
         */
        test("Example from help vAggregate([1,2,3,4],[10,[20,21,22]],1)=[1,10,[20,21,22],2,3,4]", function() {
            eval(fileLoader.getContent());
            assert.deepEqual(vAggregate([1, 2, 3, 4], [10, [20, 21, 22]], 1), [1, 10, [20, 21, 22], 2, 3, 4]);
        });

    });
});
