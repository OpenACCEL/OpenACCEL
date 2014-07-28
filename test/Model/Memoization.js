suite("Memoization", function() {

    var assert;
    var memoization;

    setup(function (done) {
        requirejs(["assert", "Model/Memoization"], function(Assert, Memoization) {
            assert = Assert;
            memoization = Memoization;
            done();
        });
    });

    suite("Memoization: ", function() {
        test("non-memoized and memoized fibonacci should return equal results", function() {
            // Fibonacci
            var fib = fibonacci(10);
            // Fibonacci with memoization
            var fib_memo = memoization.memoize(fibonacci)(10);
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
