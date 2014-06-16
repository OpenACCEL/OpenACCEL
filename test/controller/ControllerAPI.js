suite("ControllerAPI", function() {

    var assert;
    var controller;

    setup(function (done) {
        requirejs(["assert", "controller/ControllerAPI"], function(Assert, ControllerAPI) {
            assert = Assert;
            controller = new ControllerAPI();
            done();
        });
    });

    suite("| Execution", function() {
        /**
         * There should be an execution function.
         *
         * @input: -
         * @expected: No exceptions.
         */
        test("| Normal execution", function() {
            controller.execute;
        });

        /**
         * Pausing the controller should stop the controller from executing.
         *
         * @input: -
         * @expected: Controller.executing == false.
         */
        test("| Pause execution", function() {
            var expected = false;
            controller.stop();
            var output = controller.executing;
            assert.equal(output, expected);
        });
    });

    suite("| Quantities", function() {
        /**
         * There should be a getQuantities function.
         *
         * @input: -
         * @expected: No exceptions.
         */
        test("| Get quantities", function() {
            controller.getQuantities;
        });

        /**
         * Adding a quantity should give no errors.
         *
         * @input: Two quantities: a = b + 10
         *                         b = 10
         * expected: 20.
         */
        test("| Add quantities", function() {
            var input = "a = b + 10 ";
            controller.addQuantity(input);
            var input = "b = 10";
            controller.addQuantity(input);
            var output = controller.getQuantityValue('a');
            var expected = 20;
            assert.equal(output, expected);
        });

    });

    suite("| Controller", function() {

        /**
         * Test the constructor.
         *
         * @input: -
         * @expected: The controller should not be executing and the number of iterations should be zero.
         */
        test("| Constructor", function() {
            var expected = 0;
            var output = controller.numIterations;
            assert.equal(output,expected);
            var output = controller.executing;
            assert.equal(output, false);
        });

        /**
         * The controller should be able to have a limited number of executions.
         * @input: 1
         * @expected: 1
         */
        test("| Iterations", function() {
            var iterations = 1;
            var output = controller.numIterations;
            assert.equal(output, 0);
            controller.setIterations(iterations);
            output = controller.numIterations;
            var expected = 1;
            assert.equal(output, expected);
        });

    });
});
