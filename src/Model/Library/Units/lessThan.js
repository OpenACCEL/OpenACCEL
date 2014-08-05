function lessThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_lt = exe.lib.std.lessThan;
        var error = UnitObject.prototype.propagateError(std_lt, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(std_lt(a.value, b.value), {}, "unitError",
                "Arguments of < must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_lt(a.value, b.value);
            return ans;
        }
    });
}
