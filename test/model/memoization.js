suite("memoization.js", function() {

    // Memoization module.
    var assert;
    var memoization;

    setup(function (done) {
        requirejs(["assert", "model/memoization"], function(assertModule, memoizationModule) {
            assert = assertModule;
            memoization = memoizationModule;
            console.log("Loaded 'Memoization' module.");
            done();
        });
    });

    suite("#Memoization: ", function() {
        test("non-memoized and memoized fibonacci should return equal results", function() {
            var fibonacci_memoize = memoization.memoize(fibonacci);
            // Fibonacci
            var fib = fibonacci(10);
            // Fibonacci with memoization
            var fib_memo = fibonacci_memoize(10);
            // Test
            assert.equal(fib, fib_memo);
        });
    });
});

function fibonacci(x) {
    if(x < 2) {
        return 1;
    } else {
        return fibonacci(x - 1) + fibonacci(x - 2);
    }
}
