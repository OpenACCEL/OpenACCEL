suite("Operator precedence", function() {
	// Template module.
	var compiler;
	var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler"], function(assertModule, Compiler) {
            console.log("Loaded 'Compiler' module.");
            assert = assertModule;
            compiler = new Compiler();
            done();
        });
    });

	suite("Operator precedence", function() {
		// first some simple sanity checks
        /**
         * Test for Operator precedence: no operator
         */
        test("Operator precedence: no operator", function() {
            var code = "x = 5";
            var exe = compiler.compile(code).exe;
			assert.equal(exe.x(), 5);
		});

        /**
         * Test for Operator precedence: one operator
         */
        test("Operator precedence: one operator", function() {
            var code = "x = 1 + 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        // operator precidence
        /**
         * Test for Operator precedence: multiplication before addition
         */
        test("Operator precedence: multiplication before addition", function() {
            var code = 
            "x = y * y + z\n" + 
            "y = 2\n" +
            "z = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 5);
        });

        /**
         * Test for Operator precedence: multiplication before substraction
         */
        test("Operator precedence: multiplication before substraction", function() {
            var code = "x = y * y - z\n"+
            "y = 2\n" +
            "z = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        /**
         * Test for Operator precedence: division before addition
         */
        test("Operator precedence: division before addition", function() {
            var code = "x = a / b + c\n"+
            "a = 4\n" +
            "b = 2\n" +
            "c = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        /**
         * Test for Operator precedence: division before substraction
         */
        test("Operator precedence: division before substraction", function() {
            var code = "x = a / b - c\n"+
            "a = 4\n" +
            "b = 2\n" +
            "c = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 1);
        });

        /**
         * Test for Operator precedence: Addition and substraction from left to right; add before sub
         */
        test("Operator precedence: Addition and substraction from left to right; add before sub", function() {
            var code = "x = a + b - c\n"+
            "a = 2\n" +
            "b = 2\n" +
            "c = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        /**
         * Test for Operator precedence: Addition and substraction from left to right; sub before add
         */
        test("Operator precedence: Addition and substraction from left to right; sub before add", function() {
            var code = "x = a - b + c\n"+
            "a = 2\n" +
            "b = 1\n" +
            "c = 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        /**
         * Test for Operator precedence: Multiplication and Division from left to right; mult before div
         */
        test("Operator precedence: Multiplication and Division from left to right; mult before div", function() {
            var code = "x = a * b / c\n"+
            "a = 4\n" +
            "b = 3\n" +
            "c = 6";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 2);
        });

        /**
         * Test for Operator precedence: Multiplication and Division from left to right; div before mult
         */
        test("Operator precedence: Multiplication and Division from left to right; div before mult", function() {
            var code = "x = a / b * c\n"+
            "a = 12\n" +
            "b = 2\n" +
            "c = 3";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 18);
        });

        /**
         * Test for Operator precedence: Division from left to right
         */
        test("Operator precedence: Division from left to right", function() {
            var code = "x = a / b / c\n"+
            "a = 24\n" +
            "b = 4\n" +
            "c = 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        /**
         * Test for Operator precedence: Brackets; * and +
         */
        test("Operator precedence: Brackets; * and +", function() {
            var code = "x = a * (b + c)\n"+
            "a = 2\n" +
            "b = 2\n" +
            "c = 3";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 10);
        });

        /**
         * Test for Operator precedence: Brackets; * and -
         */
        test("Operator precedence: Brackets; * and -", function() {
            var code = "x = a * (b - c)\n"+
            "a = 2\n" +
            "b = 2\n" +
            "c = 3";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), -2);
        });

        /**
         * Test for Operator precedence: Brackets; / and +
         */
        test("Operator precedence: Brackets; / and +", function() {
            var code = "x = a / (b + c)\n"+
            "a = 12\n" +
            "b = 1\n" +
            "c = 3";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 3);
        });

        /**
         * Test for Operator precedence: Brackets; / and -
         */
        test("Operator precedence: Brackets; / and -", function() {
            var code = "x = a / (b - c)\n"+
            "a = 12\n" +
            "b = 3\n" +
            "c = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 6);
        });

        /**
         * Test for Operator precedence: Brackets; / and *
         */
        test("Operator precedence: Brackets; / and *", function() {
            var code = "x = a / (b * c)\n"+
            "a = 12\n" +
            "b = 3\n" +
            "c = 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 2);
        });

        /**
         * Test for Operator precedence: Brackets; /
         */
        test("Operator precedence: Brackets; /", function() {
            var code = "x = a / (b / c)\n"+
            "a = 24\n" +
            "b = 4\n" +
            "c = 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 12);
        });

        /**
         * Test for Operator precedence: More advanced formulas
         */
        test("Operator precedence: More advanced formulas; /", function() {
            var code = "x = ((a + 2) * b) / (c + 1)\n"+
            "a = 1\n" +
            "b = 4\n" +
            "c = 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 4);
        });

        /**
         * Test for Operator precedence: More advanced formulas
         */
        test("Operator precedence: More advanced formulas", function() {
            var code = "x = sin((a + b) * (c - d))\n"+
            "a = 1\n" +
            "b = 2\n" +
            "c = 5\n" +
            "d = 3";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), Math.sin(6));
        });

        /**
         * Test for Operator precedence: More advanced formulas
         */
        test("Operator precedence: More advanced formulas", function() {
            var code = "x = pow(a, c) * pow(b, c) \n"+
            "a = 5\n" +
            "b = 4\n" +
            "c = 2";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 400);
        });

        /**
         * Test for Operator precedence: More advanced formulas
         */
        test("Operator precedence: More advanced formulas", function() {
            var code = "x = (sqrt(a) * sqrt(b+c) + 4) * 3 \n"+
            "a = 4\n" +
            "b = 8\n" +
            "c = 1";
            var exe = compiler.compile(code).exe;
            assert.equal(exe.x(), 30);
        });




	});
});
