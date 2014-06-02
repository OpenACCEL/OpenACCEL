suite('analyser.js', function() {
    // Template module.
    var analyser;
    var instance;
    var assert;
    var Script;
    var Quantity;
    var quantities;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/analyser', "model/analyser", "model/script", "model/quantity"],
            function(assertModule, module, analyserModule, scriptModule, quantityModule) {
                console.log('Loaded \'analyser\' module.');
                assert = assertModule;
                instance = new module();
                analyser = new analyserModule();
                Script = scriptModule;
                Quantity = quantityModule;
                quantities = [new Quantity('a = b + c'), new Quantity('b = sin(4)'), new Quantity('c = slider(50,0,100)'), new Quantity('d = a')];
                quantities[0].definition = 'b + c';
                quantities[1].definition = 'sin(4)';
                quantities[2].definition = 'slider(50,0,100)';
                quantities[3].definition = 'a';
                quantities[0].dependencies = ['b', 'c'];
                quantities[1].dependencies = [];
                quantities[2].dependencies = [];
                quantities[3].dependencies = ['a'];
                quantities[0].reverseDeps = ['d'];
                quantities[1].reverseDeps = ['a'];
                quantities[2].reverseDeps = ['a'];
                quantities[3].reverseDeps = [];
                for (qty in quantities) {
                    quantities[qty].todo = false;
                }
                done();
            });
    });

    suite('analyse', function() {

        test('determineCategories', function() {
            var quantity = instance.determineCategories(quantities);
            var actual = [];
            for (var i = 0; i < quantity.length; i++) {
                actual[i] = quantity[i].category;
            }
            var expected = [4, 3, 1, 2];
            assert.deepEqual(actual, expected);
        });

        test('findUserInput() robustness', function() {
            assert.throws(function() {
                instance.findUserInput(null);
            });
            assert.throws(function() {
                instance.findUserInput();
            });
        });

        test('findUserInput() slider', function() {
            var actual = instance.findUserInput('s = slider(50,0,100)');
            var expected = 'slider';
            assert.equal(actual, expected);
        });

        test('findUserInput() check', function() {
            var actual = instance.findUserInput('s = check(true)');
            var expected = 'check';
            assert.equal(actual, expected);
        });

        test('findUserInput() text', function() {
            var actual = instance.findUserInput('input("hello")');
            var expected = 'text';
            assert.equal(actual, expected);
        });

        test('findUserInput() button', function() {
            var actual = instance.findUserInput('button()');
            var expected = 'button';
            assert.equal(actual, expected);
        });

        test('findInputParameters() slider', function() {
            var actual = instance.findInputParameters('slider(50,0,100)', 'slider');
            var expected = ['50', '0', '100'];
            assert.deepEqual(actual, expected);
        });

        test('findInputParameters() check', function() {
            var actual = instance.findInputParameters('check(true)', 'check');
            var expected = ['true'];
            assert.deepEqual(actual, expected);
        });

        test('findInputParameters() slider', function() {
            var actual = instance.findInputParameters('input("uio")', 'text');
            var expected = ['uio'];
            assert.deepEqual(actual, expected);
        });
    });
});