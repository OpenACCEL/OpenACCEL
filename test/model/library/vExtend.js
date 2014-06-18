suite("vExtend Library", function() {
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
            fileLoader.load("functions", "library");
            done();
        });
    });

    suite("vExtend", function() {

        /**
         * Test case for vExtend.
         *
         * input:vExtend([1,2,3,4],[5,6])
         * expected: [1,2,3,4,5,6]
         */
        test("vExtend([1,2,3,4],[5,6]) = [1,2,3,4,5,6]", function() {
            eval(fileLoader.getContent());

            var expected = [1,2,3,4,5,6];
            var result = vExtend([1,2,3,4],[5,6]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vExtend.
         *
         * input:vExtend([x:3,y:5],[t:6])
         * expected: [x:3,y:5,t:6]
         */
        test("vExtend([x:3,y:5],[t:6]) = [x:3,y:5,t:6]", function() {
            eval(fileLoader.getContent());

            var expected = objectToArray({x:3,y:5,t:6});
            var result = vExtend(objectToArray({x:3,y:5}),objectToArray({t:6}));

            assert.deepEqual(result, expected);
        });

    });
});
