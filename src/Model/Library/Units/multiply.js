function multiply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_multiply = exe.lib.std.multiply;
        var error = UnitObject.prototype.propagateError(std_multiply, a, b);
        if (error) {
            return error;
        }

        var ans = a.multiply(b);
        ans.value = std_multiply(a.value, b.value);
        return ans;
    });
}

multiply.base = 1;
