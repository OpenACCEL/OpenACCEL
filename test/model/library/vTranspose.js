suite("vTranspose Library", function() {
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
            fileLoader.load("vTranspose", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vTranspose", function() {

        /**
         * Test case for vTranspose.
         * Test case based on example from help documentation.
         *
         * 
         * @input:vTranspose([[1,10,100],[2,20,200],[3,30,300]])
         * @expected: [[1,2,3],[10,20,30],[100,200,300]]
         */
        test("vTranspose([[1,10,100],[2,20,200],[3,30,300]]) = [[1,2,3],[10,20,30],[100,200,300]]", function() {
            eval(fileLoader.getContent());

            var expected = [[1,2,3],[10,20,30],[100,200,300]];
            var result =vTranspose([[1,10,100],[2,20,200],[3,30,300]]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vTranspose.
         * Test case based on example from help documentation.
         *
         * 
         * input:vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]])
         * expected: [[1,2,3],[10,20,30],[100,200,300],[2000]]
         */
        test("vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]]) = [[1,2,3],[10,20,30],[100,200,300],[2000]]", function() {
            eval(fileLoader.getContent());

            // Note, this is really the matrix that should be generated,
            // The original accell does not display undefined items
            var expected = [[1,2,3],[10,20,30],[100,200,300],[,2000]];

            var result =vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vTranspose.
         * Test case based on example from help documentation.
         *
         * 
         * input:vTranspose(vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]]))
         * expected: [[1,10,100],[2,20,200,2000],[3,30,300]]
         */
        test("vTranspose(vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]])) = [[1,10,100],[2,20,200,2000],[3,30,300]]", function() {
            eval(fileLoader.getContent());

            var expected = [[1,10,100],[2,20,200,2000],[3,30,300]];
            var result =vTranspose(vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]]));

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vTranspose.
         * Test case based on example from help documentation.
         *
         * 
         * input:vTranspose([['x':1,'y':2],['x':10,'y':20]])
         * expected: ['x':[1,10],'y':[2,20]]
         */
        test("vTranspose([['x':1,'y':2],['x':10,'y':20]) = ['x':[1,10],'y':[2,20]]", function() {
            eval(fileLoader.getContent());
            var e  = [];
            e.x = [1,10];
            e.y = [2,20]
            var expected = e;
            var i1 = [];
            i1.x = 1; i1.y = 2;
            var i2 = [];
            i2.x = 10; i2.y = 20;

            var input = [i1, i2];

            var result =vTranspose(input);

            assert.deepEqual(result, expected);
        });

    });
});
