function floor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_floor = exe.lib.std.floor;
        var error = a.propagateError(std_floor);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_floor(a.value);
        return ans;
    });
}

