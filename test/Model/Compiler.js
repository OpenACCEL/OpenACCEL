suite("Compiler", function() {

    var assert;
    var fs;
    var compiler;
    var Script;

    setup(function(done) {
        requirejs(["assert", "fs", "Model/Compiler", "Model/Script"], function(Assert, FS, Compiler, scriptModule) {
            assert = Assert;
            fs = FS;
            compiler = new Compiler();
            Script = scriptModule;
            done();
        });
    });

    suite("| Quantities", function() {
        /**
         * Test a simple quantity with no units.
         *
         * @input:      x = 5
         *              y = sin(x)
         *              z = 2 + sin(y + sin(x)) + 4 + sin(2)
         *              u = x + y
         * @expected:   z = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2)
         */
        test("| Simple quantity, no units", function() {
            var code = "x = 5\ny = sin(x)\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(new Script(code));
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.__z__(), expected);
        });

        /**
         * Test a simple quantity with no units.
         *
         * @input:      x = 5 ; kg
         *              y = sin(x) ; kg2.s/m
         *              z = 2 + sin(y + sin(x)) + 4 + sin(2)
         *              u = x + y
         * @expected:   z = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2)
         */
        test("| Simple quantity, with units", function() {
            var code = "x = 5 ; kg\ny = sin(x) ; kg2.s/m\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(new Script(code));
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.__z__(), expected);
        });
    });

    suite("| User-defined Functions", function() {
        /**
         * Test a single user defined function with no units.
         *
         * @input:      x        = 5
         *              y        = sin(x)
         *              z(a, b)  = a + 2 + sin(y + sin(x)) + 4 + sin(2)
         *              u        = x + y
         * @expected:   z(4)     = 4 + 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2)
         */
        test("| Single function, no units", function() {
            var code = "x = 5\ny = sin(x)\nz(a, b) = a + 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(new Script(code));
            var expected = 4 + 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.__z__(4), expected);
        });

        /**
         * Functions calling functions should work.
         *
         * @input:      x(a) = 5 + a
         *              y(a) = sin(x(a))
         * @expected:   y(4) = Math.sin(9)
         */
        test("| Function chaining, no units", function() {
            var code = "x(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(new Script(code));
            var expected = Math.sin(9);
            assert.equal(output.__y__(4), expected);
        });

        /**
         * Local variables should go before user defined quantities.
         * Local variables should 'shadow' quantities.
         *
         * @input:      a       = 100
         *              x(a)    = 5
         *              y(a)    = sin(x(a))
         * @expected:   y(4)    = Math.sin(9)
         */
        test("| Shadowing, no units", function() {
            var code = "a = 100\nx(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(new Script(code));
            var expected = Math.sin(9);
            assert.equal(output.__y__(4), expected);
        });
    });

    suite("| Vectors", function() {
        /**
         * Test #1 for automapping and named vectors.
         *
         * @input:      y = 1 + [2, x: 4]
         * @expected:   y = [3, x: 5]
         */
        test("| Automapping + Named Vector: y = 1 + [2, x: 4]", function() {
            var code = "y = 1 + [2, x: 4]";
            var output = compiler.compile(new Script(code));
            var expected = [3];
            expected.x = 5;
            assert.deepEqual(output.__y__(), expected);
        });

        /**
         * Test #2 for automapping and named vectors.
         *
         * @input:      y = y = 1 + [2, x: 4] * [x: 4, 3, y: 2]
         * @expected:   y = [7, x: 17]
         */
        test("| Automapping + Named Vector: y = 1 + [2, x: 4] * [x: 4, 3, y: 2]", function() {
            var code = "y = 1 + [2, x: 4] * [x: 4, 3, y: 2]";
            var output = compiler.compile(new Script(code));
            var expected = [7];
            expected.x = 17;
            assert.deepEqual(output.__y__(), expected);
        });

        /**
         * Vector calls should work in nested vector definitions.
         *
         * @input:      a = [1, 2, 3]
         *              c = [1 + 1, 2, 3, a[0] + 2]
         * @expected:   c = [2, 2, 3, 4]
         */
        test('| Nested Vectors: a = [1, 2, 3], c = [1 + 1, 2, 3, a[0] + 2] ', function() {
            var code = 'a = [1,2,3]\n c = [1 + 1, 2, 3, a[1] + 2]';
            var output = compiler.compile(new Script(code));
            var expected = [2, 2, 3, 4];
            assert.deepEqual(output.__c__(), expected);
        });

        /**
         * Complicated mess #1!
         *
         * @input:      a = [1 + 10, b[1 + 2]]
         *              b = [0, 2, y:3, t5: c.0, 6, 3, o93e: 0, 5]
         *              c = [x:2, y:3, a.1]
         * @expected:   c = [2, 3, 11]
         */
        test('| Complicated Mess #1', function() {
            var code = 'a = [1 + 10, b[1 + 2]]\n c = [x:2, y:3, p: a.0] \n b = [0, 2, y:3, t5: 4, 7, g6h: 6, o93e: 0, 5]';
            var output = compiler.compile(new Script(code));
            var expected = {
                x: 2,
                y: 3,
                p: 11
            };
            assert.deepEqual(output.__c__(), expected);
        });

        /**
         * Complicated mess #2!
         *
         * @input:      a = [1 + 10, b[1 + 2]]
         *              b = [0, 2, y:3, t5: 4, 7, g6h: 6, o93e: 0, 5]
         *              c = [x:2, y:3, p: a.0]
         *              d = b + a
         * @expected:   d = [11, 7]
         */
        test('| Complicated Mess #1', function() {
            var code = 'a = [1 + 10, b[1 + 2]]\n c = [x:2, y:3, p: a.0] \n b = [0, 2, y:3, t5: 4, 7, g6h: 6, o93e: 0, 5]\n d = b + a';
            var output = compiler.compile(new Script(code));
            var expected = [11, 7];
            assert.deepEqual(output.__d__(), expected);
        });

        /**
         * Named keys in vectors can also be named with quotes.
         *
         * @input:      y = [2, "x": "foobar"]
         * @expected:   y = [2, x: "foobar"]
         */
        test('| Named vector with strings: y = [2, "x": "foobar"]', function() {
            var code = 'y = [2, "x": "foobar"]';
            var output = compiler.compile(new Script(code));
            var expected = [2];
            expected.x = 'foobar';
            assert.deepEqual(output.__y__(), expected);
        });

    });

    suite("| Strings", function() {
        /**
         * Simple string test.
         *
         * @input:      a = "hello world"
         *              b = a
         * @expected:   a = "hello world"
         *              b = "hello world"
         */
        test("| Simple strings", function() {
            var code =
            'a = "hello world"\n' +
            'b = a';
            var output = compiler.compile(new Script(code));
            var expected = "hello world";
            var resulta = output.__a__();
            var resultb = output.__b__();
            assert.equal(resulta, expected);
            assert.equal(resultb, expected);
        });

        /**
         * Strings should work, even if they contain names of other variables.
         * 
         * @input:      a = 5
         *              b = 6
         *              c = "a + b"
         * @expected:   a = 5
         *              b = 6
         *              c = "a + b"
         */
        test("| Strings with quantity names.", function() {
            var code =
            'a = 5\n' +
            'b = 6\n' +
            'c = "a + b"';
            var output = compiler.compile(new Script(code));
            assert.equal(output.__a__(), 5);
            assert.equal(output.__b__(), 6);
            assert.equal(output.__c__(), 'a + b');
        });

        /**
         * Strings should work when being used in conditions.
         *
         * @input:      a = cond(true, "foo", "bar")
         * @expected:   a = "foo"
         */
        test("| String in condition", function() {
            var code = 'a = cond(true, "foo", "bar")';
            var output = compiler.compile(new Script(code));
            assert.equal(output.__a__(), "foo");
        });

    });

    suite("| History", function() {
        /**
         * Historic values of scalars that do not exist should return zero.
         *
         * @input:      t = t{1 + 1} + 1
         *              'step'
         * @expected:   t = 1
         *              'step'
         *              t = 1
         */
        test('| Non-existing scalar history: t = t{1 + 1} + 1', function() {
            var code = 't = t{1 + 1} + 1';
            var output = compiler.compile(new Script(code));
            var expected = 1;
            assert.equal(output.__t__(), expected);
            output.step();
            assert.equal(output.__t__(), expected);
        });

        /**
         * A simple counter to test whether history even works under normal conditions.
         *
         * @input:      t = t{0 + b} + 1
         *              b = b{1} + 1
         *              'step 1000x'
         * @expected:   t = 0, 1, 2, .... , 1000.
         */
        test('| Simple counter', function() {
            var code = 't = t{0 + b} + 1 \n b = b{1} + 1';
            var output = compiler.compile(new Script(code));

            var expected = 1;
            for (var i = 0; i < 1000; i++) {
                assert.equal(output.__t__(), expected);
                output.step();
            };
        });

        /**
         * Execution order of non-existing history calls.
         * A bit hard to explain, this was a bug which has been solved with this test case.
         *
         * @input:      x = y
         *              y = y{1} + 1
         *              z = x{1} + 1
         * @expected:   z = 0, 1, 2, .... , 1000.
         */
        test('| Execution order of non-existing history calls.', function() {
            var code = 'x = y \n y = y{1} + 1 \n z = x{1} + 1';
            var output = compiler.compile(new Script(code));
            var expected = 1;
            for (var i = 0; i < 1000; i++) {
                assert.equal(output.__z__(), expected + i);
                output.step();
            };
        });

        /**
         * Resetting the executable should set the time index to zero.
         */
        test('| Reset', function() {
            var code = 't = t{1} + 1';
            var output = compiler.compile(new Script(code));
            var expected = 1;
            for (var i = 0; i < 1000; i++) {
                output.step();
            };
            exe.reset();
            assert.equal(output.__t__(), expected);
        });

        /**
         * A simple test to see if the base case works.
         *
         * @input:      t = t{1 | b + 1000 - 500} + 1
         *              b = 5*1000
         * @expected:   t = 5501, 5502, .... , 6000.
         */
        test('| Optional base case', function() {
            var code = 't = t{1 | b + 1000 - 500} + 1 \n b = 5*1000';
            var output = compiler.compile(new Script(code));

            var expected = 5501;
            for (var i = 0; i < 1000; i++) {
                assert.equal(output.__t__(), expected);
                output.step();
                expected++;
            };
        });

        /**
         * A simple test to see if the base case works.
         *
         * @input:      t = t{2 | b + 1000 - 500} + 1
         *              b = 5*1000
         * @expected:   t = 5501, 5501, 5502, 5502, .... , 6000.
         */
        test('| Delayed base case', function() {
            var code = 't = t{2 | b + 1000 - 500} + 1 \n b = 5*1000';
            var output = compiler.compile(new Script(code));

            var expected = 5501;
            for (var i = 1; i < 2000; i++) {
                assert.equal(output.__t__(), expected);
                output.step();
                if (i % 2 == 0) {
                    expected++;
                }
            };
        });

    suite("| Analysis", function() {
            /**
             * Flagging time-dependent quantities in analyser, and retrieving them.
             *
             * @input:      a = b
             *              b = 4
             *              c = t
             *              t = t{1 + 1} + 1
             * @expected:   {'t': Quantity.t}
             */
            test('| Flagging & retreiving time-dependent quantities', function() {
                var code = 'a=b \n b=4 \n c=t \n t = t{1 + 1} + 1';
                var script = new Script(code);
                compiler.quantities = script.quantities;

                var output = compiler.getTimeDependentQuantities();
                var expected = {'t': script.quantities['t']};
                assert.deepEqual(output, expected);
            });

            /**
             * Time-dependencies should be set recursively for quantities.
             *
             * @input:      a = b
             *              b = 4
             *              d = c
             *              z = c
             *              c = t
             *              t = t{1 + 1} + 1
             *              {'t': Quantity.t}
             * @expected:   {'t': Quantity.t, 'c': Quantity.c, 'd': Quantity.d, 'z': Quantity.z}
             */
            test('| Setting time-dependencies recursively', function() {
                var code = 'a=b \n b=4 \n d=c \n z=c \n c=t \n t = t{1 + 1} + 1';
                var script = new Script(code);
                compiler.quantities = script.quantities;
                compiler.setTimeDependent(script.quantities['t'], true);

                var output = compiler.getTimeDependentQuantities();
                var expected = {'t': script.quantities['t'], 'c': script.quantities['c'], 'd': script.quantities['d'],
                    'z': script.quantities['z']};
                assert.deepEqual(output, expected);
            });

            /**
             * Identifying all time-dependent quantities in script.
             *
             * @input:      a = b
             *              b = 4
             *              x = d
             *              r =y
             *              d = c + y
             *              z = c
             *              c = t
             *              t = t{1 + 1} + 1
             *              y = y{1} + 2
             * @epxected:   {'t': Quantity.t, 'c': Quantity.c, 'd': Quantity.d,
             *               'z': Quantity.z, 'y': Quantity.y, 'r', Quantity.r, 'x': Quantity.x}
             */
            test('| Identifying all time-dependent quantities in script', function() {
                var code = 'a=b \n b=4 \n x=d \n r=y \n d=c+y \n z=c \n c=t \n t = t{1 + 1} + 1 \n y=y{1}+2';
                var script = new Script(code);
                compiler.quantities = script.quantities;
                compiler.determineTimeDependencies();

                var output = compiler.getTimeDependentQuantities();
                var expected = {'t': script.quantities['t'], 'c': script.quantities['c'], 'd': script.quantities['d'],
                    'z': script.quantities['z'], 'y': script.quantities['y'], 'r': script.quantities['r'], 'x': script.quantities['x']};
                assert.deepEqual(output, expected);
            });
        });
    });

    suite("| Scripts", function() {
        /**
         * Try to compile all ACCEL scripts from the original www.keesvanoverveld.com website.
         */
        test("| Original ACCEL script compilation", function() {
            var dir = "./test/Model/Scripts";

            fs.readdirSync(dir).forEach(function(file) {
                var code = fs.readFileSync(dir + "/" + file, "utf8");
                
                try {
                    var script = new Script(code);
                    compiler.compile(script);
                } catch(e) {
                    console.log(code);
                    throw(e);
                }
            });
        });

        test("| Original ACCEL script unit checking", function() {
            var dir = "./test/Model/Scripts";

            fs.readdirSync(dir).forEach(function(file) {
                var code = fs.readFileSync(dir + "/" + file, "utf8");
                
                try {
                    var script = new Script(code);
                    compiler.setUnits(true);
                    script.setExecutable(compiler.compile(script));
                    script.checkUnits();
                } catch(e) {
                    console.log(code);
                    throw(e);
                }
            });
        });
    });

    suite("plot tests", function() {

        test('call to plot', function() {
            var code = 'a=plot([1,2,3,4])';
            var script = new Script(code);
            compiler.setUnits(false);
            var exe = compiler.compile(script);
            script.exe = exe;
            var expected = [1,2,3,4];

            assert.equal(exe.__a__(),'plot OK');
            assert.deepEqual(exe.plot, expected);
            assert.equal(script.getPlot(), exe.plot);
        });

    });


});
