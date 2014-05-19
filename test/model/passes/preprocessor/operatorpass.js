suite("operatorpass.js", function() {
    // Template module.
    var operatorpass;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/passes/preprocessor/operatorpass"], function(assertModule, module) {
            console.log("Loaded 'operatorpass' module.");
            assert = assertModule;
            operatorpass = new module();
            done();
        });
    });

    suite('Operator Pass', function() {
        /**
         * Test for parse() of OperatorPass, single operator
         */
        test('OperatorPass.parse(): single operator', function() {
            var input = ['x = 1 + 2', 'y = 1 - 2', 'z = 1 * 2', 'a = 1 / 2'];
            var expresult = ['x = 1 _+_ 2', 'y = 1 _-_ 2', 'z = 1 _*_ 2', 'a = 1 _/_ 2'];
            var result = operatorpass.parse(input, {});

            assert.deepEqual(result, expresult);
        });

        /**
         * Test for parse() of OperatorPass, multiple operators
         */
        test('OperatorPass.parse(): multiple operators', function() {
            var input = ['x = 1 + 2 - 3 * 4 / 5'];
            var expresult = ['x = 1 _+_ 2 _-_ 3 _*_ 4 _/_ 5'];
            var result = operatorpass.parse(input, {});

            assert.deepEqual(result, expresult);
        });

        /**
         * Test for parse() of OperatorPass, units should be ignored
         */
        test('OperatorPass.parse(): units should be ignored', function() {
            var input = ['x = 1 + 2 ; {kg-1}'];
            var expresult = ['x = 1 _+_ 2 ; {kg-1}'];
            var result = operatorpass.parse(input, {});

            assert.deepEqual(result, expresult);
        });


        

    });
});