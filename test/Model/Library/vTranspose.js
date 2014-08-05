suite("vTranspose Library", function() {
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
            fileLoader.load("vTranspose", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vTranspose", function() {

        /**
         * Test case for vTranspose.
         * Test case based on example from help documentation.
         *
         * 
         * @input:vTranspose([[1,10,100],[2,20,200],[3,30,300]])
         * @expected: [[1,2,3],[10,20,30],[100,200,300]]
         */
        test("| vTranspose([[1,10,100],[2,20,200],[3,30,300]]) = [[1,2,3],[10,20,30],[100,200,300]]", function() {
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
        test("| vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]]) = [[1,2,3],[10,20,30],[100,200,300],[2000]]", function() {
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
        test("| vTranspose(vTranspose([[1,10,100],[2,20,200,2000],[3,30,300]])) = [[1,10,100],[2,20,200,2000],[3,30,300]]", function() {
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
        test("| vTranspose([['x':1,'y':2],['x':10,'y':20]) = ['x':[1,10],'y':[2,20]]", function() {
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

    suite("| Units", function() {
        test("| Transposing units", function() {
            compiler.setUnits(true);
            var input = 
            "x = [[1,10,100],[2,20,200,2000],[3,30,300]] ; [[1,kg,1/s],[1,1,1,m2],[s,1,1]]\n" +
            "y = vTranspose(x)";
            var output = compiler.compile(new script(input));

            var y = output.__y__();

            // Errors
            assert.ifError(y[0][0].error);
            assert.ifError(y[0][1].error);
            assert.ifError(y[0][2].error);

            assert.ifError(y[1][0].error);
            assert.ifError(y[1][1].error);
            assert.ifError(y[1][2].error);

            assert.ifError(y[2][0].error);
            assert.ifError(y[2][1].error);
            assert.ifError(y[2][2].error);

            assert.ifError(y[3][1].error);

            // Units
            assert.equal(true, y[0][0].isNormal());
            assert.equal(true, y[0][1].isNormal());
            assert.equal(true, y[0][2].equals(new UnitObject(0, { 's': 1 })));

            assert.equal(true, y[1][0].equals(new UnitObject(0, { 'kg': 1 })));
            assert.equal(true, y[1][1].isNormal());
            assert.equal(true, y[1][2].isNormal());

            assert.equal(true, y[2][0].equals(new UnitObject(0, { 's': -1 })));
            assert.equal(true, y[2][1].isNormal());
            assert.equal(true, y[2][2].isNormal());

            assert.equal(true, y[3][1].equals(new UnitObject(0, { 'm': 2 })));

            // Values
            assert.equal(1, y[0][0].value);
            assert.equal(2, y[0][1].value);
            assert.equal(3, y[0][2].value);

            assert.equal(10, y[1][0].value);
            assert.equal(20, y[1][1].value);
            assert.equal(30, y[1][2].value);

            assert.equal(100, y[2][0].value);
            assert.equal(200, y[2][1].value);
            assert.equal(300, y[2][2].value);

            assert.equal(2000, y[3][1].value);
        });
    });
});
