function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_pow = exe.lib.std.pow;
        var error = UnitObject.prototype.propagateError(std_pow, a, b);
        if (error) {
            return error;
        }

        var ans = a.power(b);
        ans.value = std_pow(a.value, b.value);
        return ans;
    });

}
