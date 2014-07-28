suite("Operator Precedence", function() {

    var assert;
    var compiler;
    var script;

    setup(function (done) {
        requirejs(["assert", "Model/Compiler", "Model/Script"], function(Assert, Compiler, Script) {
            assert = Assert;
            compiler = new Compiler();
            script = Script;
            done();
        });
    });

    /**
     * Test for Operator precedence: no operator.
     *
     * @input:      x = 5
     * @expected:   x = 5
     */
    test("| No operator", function() {
        var code = "x = 5";
        var exe = compiler.compile(new script(code));
		assert.equal(exe.__x__(), 5);
	});

    /**
     * Test for Operator precedence: one operator
     *
     * @input:      x = 1 + 2
     * @expected:   x = 3
     */
    test("| One operator", function() {
        var code = "x = 1 + 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: multiplication before addition
     *
     * @input:      x = y * y + z
     *              y = 2
     *              z = 1
     * @epxected:   x = 5
     */
    test("| Multiplication before addition", function() {
        var code =
        "x = y * y + z\n" +
        "y = 2\n" +
        "z = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 5);
    });

    /**
     * Test for Operator precedence: multiplication before substraction
     *
     * @input:      x = y * y - z
     *              y = 2
     *              z = 1
     * @expected:   x = 3
     */
    test("| Multiplication before substraction", function() {
        var code = "x = y * y - z\n"+
        "y = 2\n" +
        "z = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: division before addition
     *
     * @input:      x = a / b + c
     *              a = 4
     *              b = 2
     *              c = 1
     * @expected:   x = 3
     */
    test("| Division before addition", function() {
        var code = "x = a / b + c\n"+
        "a = 4\n" +
        "b = 2\n" +
        "c = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: division before substraction
     * @input:      x = a / b - c
     *              a = 4
     *              b = 2
     *              c = 1
     * @expected:   x = 1
     */
    test("| Division before substraction", function() {
        var code = "x = a / b - c\n"+
        "a = 4\n" +
        "b = 2\n" +
        "c = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 1);
    });

    /**
     * Test for Operator precedence: Addition and substraction from left to right; add before sub
     *
     * @input:      x = a + b - c
     *              a = 2
     *              b = 2
     *              c = 1
     * @expected:   x = 3
     */
    test("| Addition and substraction from left to right; add before sub", function() {
        var code = "x = a + b - c\n"+
        "a = 2\n" +
        "b = 2\n" +
        "c = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: Addition and substraction from left to right; sub before add
     *
     * @input:      x = a - b + c
     *              a = 2
     *              b = 1
     *              c = 2
     * @expected:   x = 3
     */
    test("| Addition and substraction from left to right; sub before add", function() {
        var code = "x = a - b + c\n"+
        "a = 2\n" +
        "b = 1\n" +
        "c = 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: Multiplication and Division from left to right; mult before div
     *
     * @input:      x = a * b / c
     *              a = 4
     *              b = 3
     *              c = 6
     * @expected:   x = 2
     */
    test("| Multiplication and Division from left to right; mult before div", function() {
        var code = "x = a * b / c\n"+
        "a = 4\n" +
        "b = 3\n" +
        "c = 6";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 2);
    });

    /**
     * Test for Operator precedence: Multiplication and Division from left to right; div before mult
     *
     * @input:      x = a / b * c
     *              a = 12
     *              b = 2
     *              c = 3
     * @expected:   x = 18
     */
    test("| Multiplication and Division from left to right; div before mult", function() {
        var code = "x = a / b * c\n"+
        "a = 12\n" +
        "b = 2\n" +
        "c = 3";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 18);
    });

    /**
     * Test for Operator precedence: Division from left to right
     *
     * @input:      x = a / b / c
     *              a = 24
     *              b = 4
     *              c = 2
     * @expected:   x = 3
     */
    test("| Division from left to right", function() {
        var code = "x = a / b / c\n"+
        "a = 24\n" +
        "b = 4\n" +
        "c = 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: Brackets; * and +
     *
     * @input:      x = a * (b + c)
     *              a = 2
     *              b = 2
     *              c = 3
     * @expected:   x = 10
     */
    test("| Brackets; * and +", function() {
        var code = "x = a * (b + c)\n"+
        "a = 2\n" +
        "b = 2\n" +
        "c = 3";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 10);
    });

    /**
     * Test for Operator precedence: Brackets; * and -
     *
     * @input:      x = a * (b - c)
     *              a = 2
     *              b = 2
     *              c = 3
     * @expected:   x = -2
     */
    test("| Brackets; * and -", function() {
        var code = "x = a * (b - c)\n"+
        "a = 2\n" +
        "b = 2\n" +
        "c = 3";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), -2);
    });

    /**
     * Test for Operator precedence: Brackets; / and +
     *
     * @input:      x = a / (b + c)
     *              a = 12
     *              b = 1
     *              c = 3
     * @expected:   x = 3
     */
    test("| Brackets; / and +", function() {
        var code = "x = a / (b + c)\n"+
        "a = 12\n" +
        "b = 1\n" +
        "c = 3";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 3);
    });

    /**
     * Test for Operator precedence: Brackets; / and -
     *
     * @input:      x = a / (b - c)
     *              a = 12
     *              b = 3
     *              c = 1
     * @expected:   x = 6
     */
    test("| Brackets; / and -", function() {
        var code = "x = a / (b - c)\n"+
        "a = 12\n" +
        "b = 3\n" +
        "c = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 6);
    });

    /**
     * Test for Operator precedence: Brackets; / and *
     *
     * @input:      x = a / (b * c)
     *              a = 12
     *              b = 3
     *              c = 2
     * @expected:   x = 2
     */
    test("| Brackets; / and *", function() {
        var code = "x = a / (b * c)\n"+
        "a = 12\n" +
        "b = 3\n" +
        "c = 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 2);
    });

    /**
     * Test for Operator precedence: Brackets; /
     *
     * @input:      x = a / (b / c)
     *              a = 24
     *              b = 4
     *              c = 2
     * @expected:   x = 12
     */
    test("| Brackets; /", function() {
        var code = "x = a / (b / c)\n"+
        "a = 24\n" +
        "b = 4\n" +
        "c = 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 12);
    });

    /**
     * Test for Operator precedence: More advanced formulas
     *
     * @input:      x = ((1 + 2) * b) / (c + 1)
     *              a = 1
     *              b = 4
     *              c = 2
     * @expected:   x = 4
     */
    test("| Advanced formula #1", function() {
        var code = "x = ((a + 2) * b) / (c + 1)\n"+
        "a = 1\n" +
        "b = 4\n" +
        "c = 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 4);
    });

    /**
     * Test for Operator precedence: More advanced formulas
     *
     * @input:      x = sin((a + b)) (c - d)
     *              a = 1
     *              b = 2
     *              c = 5
     *              d = 3
     * @expected:   x = Math.sin(6)
     */
    test("| Advanced formula #2", function() {
        var code = "x = sin((a + b) * (c - d))\n"+
        "a = 1\n" +
        "b = 2\n" +
        "c = 5\n" +
        "d = 3";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), Math.sin(6));
    });

    /**
     * Test for Operator precedence: More advanced formulas
     *
     * @input:      x = pow(a, c) * pow(b, c)
     *              a = 5
     *              b = 4
     *              c = 2
     * @expected:   x = 400
     */
    test("| Advanced formula #3", function() {
        var code = "x = pow(a, c) * pow(b, c) \n"+
        "a = 5\n" +
        "b = 4\n" +
        "c = 2";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 400);
    });

    /**
     * Test for Operator precedence: More advanced formulas
     *
     * @input:      x = (sqrt(a) * sqrt(b + c) + 4) * 3
     *              a = 4
     *              b = 8
     *              c = 1
     * @expected:   x = 30
     */
    test("| Advanced formula $3", function() {
        var code = "x = (sqrt(a) * sqrt(b+c) + 4) * 3 \n"+
        "a = 4\n" +
        "b = 8\n" +
        "c = 1";
        var exe = compiler.compile(new script(code));
        assert.equal(exe.__x__(), 30);
    });
});
