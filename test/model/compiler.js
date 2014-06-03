suite("Compiler", function() {
    var compiler;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/script"], function(assertModule, module, scriptModule) {
            console.log("Loaded 'Compiler' module.");
            assert = assertModule;
            compiler = new module();
            Script = scriptModule;
            done();
        });
    });

    suite("variables", function() {
        test("default settings, no units", function() {
            var code = "x = 5\ny = sin(x)\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(new Script(code));
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(), expected);
        });

        test("default settings, with units", function() {
            var code = "x = 5 ; kg\ny = sin(x) ; kg2.s/m\nz = 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(new Script(code));
            var expected = 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(), expected);
        });
    });

    suite("user-defined functions", function() {
        test("default settings, single function, no units", function() {
            var code = "x = 5\ny = sin(x)\nz(a, b) = a + 2 + sin(y + sin(x)) + 4 + sin(2)\nu = x + y";
            var output = compiler.compile(new Script(code));
            var expected = 4 + 2 + Math.sin(Math.sin(5) + Math.sin(5)) + 4 + Math.sin(2);
            assert.equal(output.exe.z(4), expected);
        });

        test("default settings, function chaining, no units", function() {
            var code = "x(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(new Script(code));
            var expected = Math.sin(9);
            assert.equal(output.exe.y(4), expected);
        });

        test("default settings, shadowing, no units", function() {
            var code = "a = 100\nx(a) = 5 + a\ny(a) = sin(x(a))";
            var output = compiler.compile(new Script(code));
            var expected = Math.sin(9);
            assert.equal(output.exe.y(4), expected);
        });
    });

    suite("vector tests", function() {
        test("default settings, y = 1 + [2, x: 4]", function() {
            var code = "y = 1 + [2, x: 4]";
            var output = compiler.compile(new Script(code));
            var expected = [3];
            expected.x = 5;
            assert.deepEqual(output.exe.y(), expected);
        });

        test("default settings, y = 1 + [2, x: 4] * [x: 4, 3, y: 2]", function() {
            var code = "y = 1 + [2, x: 4] * [x: 4, 3, y: 2]";
            var output = compiler.compile(new Script(code));
            var expected = [7];
            expected.x = 17;
            assert.deepEqual(output.exe.y(), expected);
        });

        test('default settings, a = [1,2,3]\n c = [1+1,2,3,a[0] +2] ', function() {
            var code = 'a = [1,2,3]\n c = [1 + 1, 2, 3, a[1] + 2]';
            var output = compiler.compile(new Script(code));
            var expected = [2, 2, 3, 4];
            assert.deepEqual(output.exe.c(), expected);
        });

        test('default settings a = [1 + 10, b[1 + 2]]\n  c = [x:2, y:3, a.1]\n b = [0, 2, y:3, t5: c.0, 6, 3, o93e: 0, 5]', function() {
            var code = 'a = [1 + 10, b[1 + 2]]\n c = [x:2, y:3, p: a.0] \n b = [0, 2, y:3, t5: 4, 7, g6h: 6, o93e: 0, 5]';
            var output = compiler.compile(new Script(code));
            var expected = {
                x: 2,
                y: 3,
                p: 11
            };
            assert.deepEqual(output.exe.c(), expected);
        });

        test('default settings a = [1 + 10, b[1 + 2]]\n  c = [x:2, y:3, a.1]\n b = [0, 2, y:3, t5: c.0, 6, 3, o93e: 0, 5]', function() {
            var code = 'a = [1 + 10, b[1 + 2]]\n c = [x:2, y:3, p: a.0] \n b = [0, 2, y:3, t5: 4, 7, g6h: 6, o93e: 0, 5]\n d = b + a';
            var output = compiler.compile(new Script(code));
            var expected = [11, 7];
            assert.deepEqual(output.exe.d(), expected);
        });

        test('array with names with quotes = [2, "x": "foobar"]', function() {
            var code = 'y = [2, "x": "foobar"]';
            var output = compiler.compile(new Script(code));
            var expected = [2];
            expected.x = 'foobar';
            assert.deepEqual(output.exe.y(), expected);
        });

    });

    suite("strings tests", function() {
        test("Simple string", function() {
            var code =
            'a = "hello world"\n' +
            'b = a';
            var output = compiler.compile(new Script(code));
            var expected = "hello world";
            var resulta = output.exe.a();
            var resultb = output.exe.b();
            assert.equal(resulta, expected);
            assert.equal(resultb, expected);
        });

        test("String wich contains names of other variables", function() {
            var code =
            'a = 5\n' +
            'b = 6\n' +
            'c = "a + b"';
            var output = compiler.compile(new Script(code));
            assert.equal(output.exe.a(), 5);
            assert.equal(output.exe.b(), 6);
            assert.equal(output.exe.c(), 'a + b');
        });

        test("String in condition", function() {
            var code = 'a = cond(true, "foo", "bar")';
            var output = compiler.compile(new Script(code));
            assert.equal(output.exe.a(), "foo");
        });

    });

    suite("history tests", function() {

        test('default settings t = t{1 + 1} + 1', function() {
            var code = 't = t{1 + 1} + 1';
            var output = compiler.compile(new Script(code));
            var expected = 1;
            assert.equal(output.exe.t(), expected);
            output.exe.step();
            assert.equal(output.exe.t(), expected);
        });

        test('default settings t = t{1 + b} + 1 \n b = b{0} + 1', function() {
            var code = 't = t{0 + b} + 1 \n b = b{0} + 1';
            var output = compiler.compile(new Script(code));
            var expected = 1;
            for (var i = 0; i < 1000; i++) {
                assert.equal(output.exe.t(), expected + i);
                output.exe.step();
            };
        });
    });

    suite("history analysis tests", function() {

        test('Flagging time-dependenten quantities in analyser, and retrieving them', function() {
            var code = 'a=b \n b=4 \n c=t \n t = t{1 + 1} + 1';
            var script = new Script(code);
            compiler.quantities = script.quantities;

            var output = compiler.getTimeDependentQuantities();
            var expected = {'t': script.quantities['t']};
            assert.deepEqual(output, expected);
        });

        test('Setting time-dependencies recursively', function() {
            var code = 'a=b \n b=4 \n d=c \n z=c \n c=t \n t = t{1 + 1} + 1';
            var script = new Script(code);
            compiler.quantities = script.quantities;
            compiler.setTimeDependent(script.quantities['t'], true);

            var output = compiler.getTimeDependentQuantities();
            var expected = {'t': script.quantities['t'], 'c': script.quantities['c'], 'd': script.quantities['d'],
                'z': script.quantities['z']};
            assert.deepEqual(output, expected);
        });

        test('Identifying all time-dependent quantities in script', function() {
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
