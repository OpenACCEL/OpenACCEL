function divide(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_divide = exe.lib.std.divide;
        var error = UnitObject.prototype.propagateError(std_divide, a, b);
        if (error) {
            return error;
        }

        var ans = a.divide(b);
        ans.value = std_divide(a.value, b.value);
        return ans;
    });
}