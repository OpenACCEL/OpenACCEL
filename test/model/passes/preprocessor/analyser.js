suite('analyser.js', function() {

    var assert;
    var analyser;
    var quantity;
    var quantities;

    setup(function(done) {
        requirejs(["assert", "model/analyser", "model/quantity"], function(Assert, Analyser, Quantity) {
            console.log('Loaded \'Analyser\' module.');
            assert = Assert;
            analyser = new Analyser();
            quantity = Quantity;
            quantities = [new quantity('a = b + c'), new quantity('b = sin(4)'), new quantity('c = slider(50,0,100)'), new quantity('d = a')];
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
            var quantity = analyser.determineCategories(quantities);
            var actual = [];
            for (var i = 0; i < quantity.length; i++) {
                actual[i] = quantity[i].category;
            }
            var expected = [4, 3, 1, 2];
            assert.deepEqual(actual, expected);
        });

        test('findUserInput() robustness', function() {
            assert.throws(function() {
                analyser.findUserInput(null);
            });
            assert.throws(function() {
                analyser.findUserInput();
            });
        });

        test('findUserInput() slider', function() {
            var actual = analyser.findUserInput('s = slider(50,0,100)');
            var expected = 'slider';
            assert.equal(actual, expected);
        });

        test('findUserInput() check', function() {
            var actual = analyser.findUserInput('s = check(true)');
            var expected = 'check';
            assert.equal(actual, expected);
        });

        test('findUserInput() text', function() {
            var actual = analyser.findUserInput('input("hello")');
            var expected = 'text';
            assert.equal(actual, expected);
        });

        test('findUserInput() button', function() {
            var actual = analyser.findUserInput('button()');
            var expected = 'button';
            assert.equal(actual, expected);
        });

        test('findInputParameters() slider', function() {
            var actual = analyser.findInputParameters('slider(50,0,100)', 'slider');
            var expected = ['50', '0', '100'];
            assert.deepEqual(actual, expected);
        });

        test('findInputParameters() check', function() {
            var actual = analyser.findInputParameters('check(true)', 'check');
            var expected = ['true'];
            assert.deepEqual(actual, expected);
        });

        test('findInputParameters() slider', function() {
            var actual = analyser.findInputParameters('input("uio")', 'text');
            var expected = ['uio'];
            assert.deepEqual(actual, expected);
        });
    });
});
