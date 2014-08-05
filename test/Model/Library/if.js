suite("If Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("if", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    suite("| __if__", function() {

        /**
         * Test case for if.
         *
         * @input if(true, 1, 3)
         * @expected 1
         */
        test("| If function with true condition", function() {
            eval(fileLoader.getContent());
            var condition = true;
            var ifTrue = 1;
            var ifFalse = 3;
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, 1);
        });

        /**
         * Test case for if.
         *
         * @input if(false, 1, 3)
         * @expected 3
         */
        test("| If function with false condition", function() {
            eval(fileLoader.getContent());
            var condition = false;
            var ifTrue = 1;
            var ifFalse = 3;
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, 3);
        });

        /**
         * Test case for if.
         *
         * @input if(true, [1,2,3], []])
         * @expected [1,2,3]
         */
        test("| If function with true conditions, and arrays as options", function() {
            eval(fileLoader.getContent());
            var condition = true;
            var ifTrue = [1, 2, 3];
            var ifFalse = [];
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [1, 2, 3]);
        });

        /**
         * Test case for if.
         *
         * @input if([false,true,true], 1, 3)
         * @expected [3,1,1]
         */
        test("| If function with array condition, using multiaryZip", function() {
            eval(fileLoader.getContent());
            var condition = [false, true, true];
            var ifTrue = 1;
            var ifFalse = 3;
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [3, 1, 1]);
        });

        /**
         * Test case for if.
         *
         * @input if([true,true,false], 3, [4,5,6])
         * @expected [3,3,6]
         */
        test("| If function with array condition and scalar or array choice, using multiaryZip", function() {
            eval(fileLoader.getContent());
            var condition = [true, true, false];
            var ifTrue = 3;
            var ifFalse = [4, 5, 6];
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [3, 3, 6]);
        });

        /**
         * Test case for if.
         *
         * @input if([false,true,false], [3, [4,5]], [4,5,6])
         * @expected [4,[4,5]]
         */
        test("| If function with array condition and scalar or array choice, using multiaryZip", function() {
            eval(fileLoader.getContent());
            var condition = [false, true, false];
            var ifTrue = [3, [4, 5]];
            var ifFalse = [4, 5, 6];
            output = __if__(condition, ifTrue, ifFalse);
            assert.deepEqual(output, [4, [4, 5]]);
        });
    });

    suite("| Expansion", function() {

        /**
         * Test case for expansion of if.
         *
         * @input if(1==1, 10, 30)
         * @expected 10
         */
        test("| Should expand for 'x = if(1 == 1,10,30)'", function() {
            compiler.setUnits(false);
            var input = "x = if(1 == 1,10,30)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__x__(), 10);
        });

        /**
         * Test case for expansion of if.
         *
         * @input x = 5
         *        y = if(1==1,x,4) + 2
         *        z = if(1==1, if(1==0,x,2),y)
         * @expected y = 7
         *           z = 2
         */
        test("| Should expand for 'x = 5, y = if(1 == 1,x,4) + 2, z = if(1 == 0,if(1 == 0,x,2),y)'", function() {
            compiler.setUnits(false);
            var input = "x = 5\ny = if(1 == 1,x,4) + 2\nz = if(1 == 1,if(1 == 0,x,2),y)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), 7);
            assert.equal(output.__z__(), 2);
        });

        /**
         * Test case for expansion of if.
         *
         * @input x = if ([1==1, 1==0], [1,2], [3,4])
         * @expected x = [1,4]
         */
        test("| Should expand for 'x = if([1,2], [3,4])'", function() {
            compiler.setUnits(false);
            var input = "x = if([1 == 1,1 == 0], [1,2], [3,4])";
            var output = compiler.compile(new script(input));
            assert.deepEqual(output.__x__(), [1, 4]);
        });
    });

    suite("| Units", function() {
        test("| Normal operation", function() {
            compiler.setUnits(true);
            var input =
            "a = true\n" +
            "b = 25 ; kg\n" +
            "c = 30 ; m2\n" +
            "d = if(a,b,c)\n" +
            "w = false\n" +
            "x = 36 ; 1/p\n" +
            "y = 43\n" +
            "z = if(w,x,y)\n";
            var output = compiler.compile(new script(input));

            assert.equal(true, output.__d__().equals(new UnitObject(25, {'kg': 1})));
            assert.equal(25, output.__d__().value);
            assert.ifError(output.__d__().error);

            assert.equal(true, output.__z__().isNormal());
            assert.equal(43, output.__z__().value);
            assert.ifError(output.__z__().error);
        });

        test("| Error handling", function() {
            compiler.setUnits(true);
            var input =
            "a = true ; d\n" +
            "b = 40 ; kg\n" +
            "c = 25 ; m2.i\n" +
            "d = if(a,b,c)\n" +
            "x = false ; m\n" +
            "z = if(d, 34, x)\n";
            var output = compiler.compile(new script(input));

            assert.equal(40, output.__d__().value);
            assert.equal(output.__d__().error, "unitError");

            assert.equal(34, output.__z__().value);
            assert.equal(output.__z__().error, "uncheckedUnit");
            assert.ok(output.__z__().isNormal());
        });
    });
});
