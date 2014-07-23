suite("Add Unit Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/script"], function(Assert, Compiler, Script) {
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    test("| Non-equal units", function() {
        compiler.loadUnitsLib();
        var input = 
        "x = 5; kg\n" +
        "y = 6; s\n" +
        "z = x + y";
        var output = compiler.compile(new script(input));
        output.setUnits(true);
        assert.ok(output.__z__().error);
    });

    test("| Equal units", function() {
        compiler.loadUnitsLib();
        var input = 
        "x = 5; kg\n" +
        "y = 6; kg\n" +
        "z = x + y";
        var output = compiler.compile(new script(input));
        output.setUnits(true);
        var z = output.__z__();
        assert.equal(z.value, 11);
        assert.equal(true, z.equals(new UnitObject(0, {'kg': 1})));
        assert.ifError(z.error);
    });

    test("| Commutativity", function() {
        compiler.loadUnitsLib();
        var input = 
        "x = 5; kg\n" +
        "y = 10; kg\n" +
        "z = 6; kg2\n" +
        "a = x + y\n" +
        "b = x + z\n" +
        "c = y + x\n" +
        "d = z + x";
        var output = compiler.compile(new script(input));
        output.setUnits(true);

        var a = output.__a__();
        var b = output.__b__();
        var c = output.__c__();
        var d = output.__d__();

        assert.equal(a.equals(new UnitObject(0, {'kg': 1})), true);
        assert.equal(a.value, 15);
        assert.equal(a.error, null);

        assert.equal(b.isNormal(), true);
        assert.equal(b.value, 11);
        assert.equal(b.errorString, "Addition mismatch")

        assert.equal(c.equals(new UnitObject(0, {'kg': 1})), true);
        assert.equal(c.value, 15);
        assert.equal(c.error, null);

        assert.equal(d.isNormal(), true);
        assert.equal(d.value, 11);
        assert.equal(d.errorString, "Addition mismatch");
    });
});
