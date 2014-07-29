function lessThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_lt = exe.lib.std.lessThan;
        var error = UnitObject.prototype.propagateError(std_lt, a, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_lt(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to < must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
        } else {
            var ans = a.clone()
            ans.value = std_lt(a.value, b.value);
        }

        return ans;
    });
}