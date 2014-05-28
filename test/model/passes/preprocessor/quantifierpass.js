suite("quantifierpass.js", function() {

    var quantifierpass;
    var assert;

    setup(function (done) {
        requirejs(["assert", "model/passes/preprocessor/quantifierpass"], function(Assert, QuantifierPass) {
            assert = Assert;
            quantifierpass = new QuantifierPass();
            console.log("Loaded 'QuantifierPass' module.");
            done();
        });
    });

    suite('QuantifierPass', function() {

        test('parse(): Sum of Squares', function() {
            var input = ['sum_squares = #(i, [1, 2, 3, 4], i*i, add)'];
            var output = ['sum_squares =  __quantifier__ (i, [1, 2, 3, 4], i*i, add)'];
            var result = quantifierpass.parse(input, {});

            assert.deepEqual(result, output);
        });
    });
});
