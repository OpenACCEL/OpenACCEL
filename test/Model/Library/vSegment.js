suite("vSegment Library", function() {
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
            fileLoader.load("vSegment", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vSegment", function() {

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([1,2,3,4,5],1,2)
         * @expected: [2]
         */
        test("vSegment([1,2,3,4,5],1,2) = [2]", function() {
            eval(fileLoader.getContent());

            var expected = [2];
            var result = vSegment([1, 2, 3, 4, 5], 1, 2);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([1,[2,3,4,5],3,4,5],1,2)
         * @expected: [[2,3,4,5]]
         */
        test("| vSegment([1,[2,3,4,5],3,4,5],1,2) = [[2,3,4,5]]", function() {
            eval(fileLoader.getContent());

            var expected = [
                [2, 3, 4, 5]
            ];
            var result = vSegment([1, [2, 3, 4, 5], 3, 4, 5], 1, 2);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([1,2,3],1,0)
         * @expected: []
         */
        test("| vSegment([1,2,3],1,0) = []", function() {
            eval(fileLoader.getContent());

            var expected = [];
            var result = vSegment([1, 2, 3], 1, 0);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([], 0, 4)
         * @expected: [0, 0, 0, 0]
         */
        test("| vSegment([], 0, 4) = [0, 0, 0, 0]", function() {
            eval(fileLoader.getContent());

            var expected = [0, 0, 0, 0];
            var result = vSegment([], 0, 4);

            assert.deepEqual(result, expected);
        });
    });

    suite("| Units", function() {
        test("| Segment dimensions", function() {
            compiler.setUnits(true);
            var input = 
            "a = [0, 1, 2, 3, 4]; [kg, s, 1, lum, 1]\n" +
            "x = vSegment(a, 1, 2)\n" + 
            "y = vSegment(a, 0, 5)\n" + 
            "z = vSegment(a, 0, 7)\n";
            var output = compiler.compile(new script(input));

            // X
            assert.ifError(output.__x__()[0].error);
            assert.equal(true, output.__x__()[0].equals(new UnitObject(0, {'s': 1})));
            assert.equal(1, output.__x__()[0].value);

            // Y
            assert.ifError(output.__y__()[0].error);
            assert.equal(true, output.__y__()[0].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(0, output.__y__()[0].value);

            assert.ifError(output.__y__()[1].error);
            assert.equal(true, output.__y__()[1].equals(new UnitObject(0, {'s': 1})));
            assert.equal(1, output.__y__()[1].value);

            assert.ifError(output.__y__()[2].error);
            assert.equal(true, output.__y__()[2].isNormal());
            assert.equal(2, output.__y__()[2].value);

            assert.ifError(output.__y__()[3].error);
            assert.equal(true, output.__y__()[3].equals(new UnitObject(0, {'lum': 1})));
            assert.equal(3, output.__y__()[3].value);

            assert.ifError(output.__y__()[4].error);
            assert.equal(true, output.__y__()[4].isNormal());
            assert.equal(4, output.__y__()[4].value);

            // Z
            assert.ifError(output.__z__()[0].error);
            assert.equal(true, output.__z__()[0].equals(new UnitObject(0, {'kg': 1})));
            assert.equal(0, output.__z__()[0].value);

            assert.ifError(output.__z__()[1].error);
            assert.equal(true, output.__z__()[1].equals(new UnitObject(0, {'s': 1})));
            assert.equal(1, output.__z__()[1].value);

            assert.ifError(output.__z__()[2].error);
            assert.equal(true, output.__z__()[2].isNormal());
            assert.equal(2, output.__z__()[2].value);

            assert.ifError(output.__z__()[3].error);
            assert.equal(true, output.__z__()[3].equals(new UnitObject(0, {'lum': 1})));
            assert.equal(3, output.__z__()[3].value);

            assert.ifError(output.__z__()[4].error);
            assert.equal(true, output.__z__()[4].isNormal());
            assert.equal(4, output.__z__()[4].value);

            assert.ifError(output.__z__()[5].error);
            assert.equal(true, output.__z__()[5].isNormal());
            assert.equal(0, output.__z__()[5].value);

            assert.ifError(output.__z__()[6].error);
            assert.equal(true, output.__z__()[6].isNormal());
            assert.equal(0, output.__z__()[6].value);
        });
    });
});
