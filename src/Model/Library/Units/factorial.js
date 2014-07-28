function factorial(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_factorial = exe.lib.std.factorial;
        var error = a.propagateError(std_factorial);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_factorial(a.value), {}, "Factorial should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_factorial(a.value);
            return ans;
        }
    });
}
