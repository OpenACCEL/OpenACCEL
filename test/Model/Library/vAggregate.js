suite("vAggregate Library", function() {
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
            fileLoader.load("vAggregate", "library");
            fileLoader.load("objecttoarray", "library");
            script = Script;
            done();
        });
    });

    suite("| vAggregate", function() {

        /**
         * Test case for vAggregate.
         * Based on an example of the help documentation
         *
         * @input: vAggregate([1,2,3,4],[10,[20,21,22]],1)
         * @expected: [1, 10, [20, 21, 22], 2, 3, 4]
         */
        test("| Example from help vAggregate([1,2,3,4],[10,[20,21,22]],1)=[1,10,[20,21,22],2,3,4]", function() {
            eval(fileLoader.getContent());
            assert.deepEqual(vAggregate([1, 2, 3, 4], [10, [20, 21, 22]], 1), [1, 10, [20, 21, 22], 2, 3, 4]);
        });
    });

    suite("| Units", function() {
        test("| Aggregation of units", function() {
            compiler.loadUnitsLib();
            var input = 
            "a = [1,2,3,4]; [1,kg,1,s]\n" +
            "b = [10,[20,21,22]]; [1, [lum, 1, kg]]\n" +
            "c = vAggregate(a, b, 1)";
            var output = compiler.compile(new script(input));
            output.setUnits(true);

            var c = output.__c__();
            assert.equal(true, c[0].isNormal());
            assert.equal(true, c[1].isNormal());
            assert.equal(true, c[2][0].equals(new UnitObject(0, { 'lum': 1})));
            assert.equal(true, c[2][1].isNormal());
            assert.equal(true, c[2][2].equals(new UnitObject(0, { 'kg': 1})));
            assert.equal(true, c[3].equals(new UnitObject(0, { 'kg': 1})));
            assert.equal(true, c[4].isNormal());
            assert.equal(true, c[5].equals(new UnitObject(0, { 's': 1})));

            assert.equal(1, c[0].value);
            assert.equal(10, c[1].value);
            assert.equal(20, c[2][0].value);
            assert.equal(21, c[2][1].value);
            assert.equal(22, c[2][2].value);
            assert.equal(2, c[3].value);
            assert.equal(3, c[4].value);
            assert.equal(4, c[5].value);
        });
    });
});
