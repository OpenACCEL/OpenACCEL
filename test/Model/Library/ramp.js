suite("ramp Library", function() {
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
            fileLoader.load("ramp", "library");
            fileLoader.load("zip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("objecttoarray", "library");
            fileLoader.load("UnitObject", "unitlibrary");
            script = Script;
            done();
        });
    });

    suite("| Ramp", function() {

        /**
         * Test case for ramp.
         * Based on an example of the help documentation
         *
         * @input: ramp(0.5,0,0,1,1)
         * @expected: 0.5
         */
        test("| Example from help ramp(0.5,0,0,1,1)=0.5", function() {
            eval(fileLoader.getContent());
            assert.deepEqual(ramp(0.5, 0, 0, 1, 1), 0.5);
        });

    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a=0.5 ; kg\n" +
            "b=0 ; kg\n" +
            "c=0 ; m2\n" +
            "d=1 ; kg\n" +
            "e=1 ; m2\n" +
            "z=ramp(a,b,c,d,e)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__z__().equals(new UnitObject(0.5, {'m':2})));
            assert.equal(0.5, output.__z__().value);
            assert.ifError(output.__z__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a=0.5 ; kg\n" +
            "b=0 ; kg\n" +
            "c=0 ; m2\n" +
            "d=1 ; kg\n" +
            "e=1 ; d\n" +
            "z=ramp(a,b,c,d,e)\n" +
            "x=ramp(z,0,0,1,1)\n";
            var output = compiler.compile(new script(input));

            assert.equal(0.5, output.__z__().value);
            assert.equal(output.__z__().error, "unitError");
            assert.ok(output.__z__().isNormal());

            assert.equal(0.5, output.__x__().value);
            assert.equal(output.__x__().error, "uncheckedUnit");
            assert.ok(output.__x__().isNormal());
        });
    });
});
