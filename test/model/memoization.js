suite("memoization.js", function() {

    // Memoization module.
    var assert;
    var microtime;
    var memoization;

    setup(function (done) {
        requirejs(["assert", "microtime", "model/memoization"], function(assertModule, microtimeModule, memoizationModule) {
            assert = assertModule;
            microtime = microtimeModule;
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
        test("non-memoized fibonacci should be slower than memoized fibonacci", function() {
            var fibonacci_memoize = memoization.memoize(fibonacci);
            // Fibonacci
            var start = microtime.now();
            var fib = fibonacci(10);
            var end = microtime.now();
            var fib_time = end - start;
            // Fibonacci with memoization
            var start_memo = microtime.now();
            var fib_memo = fibonacci_memoize(10);
            var end_memo = microtime.now();
            var fib_memo_time = end_memo - start_memo;
            // Test
            assert.equal(fib_time > fib_memo_time, true);
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
