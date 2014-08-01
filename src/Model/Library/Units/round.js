function round(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_round = exe.lib.std.round;
        var error = UnitObject.prototype.propagateError(std_round, a);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_round(a.value);
        return ans;
    });
}
