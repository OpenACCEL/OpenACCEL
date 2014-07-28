function not(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x], function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_not = exe.lib.std.not;
        var error = a.propagateError(std_not);
        if (error) {
            return error;
        }

        var ans;
        if(!a.isNormal()) {
            ans = new UnitObject(std_not(a.value), {}, "unitError");
            ans.errorString = "The argument to the \"not\" function must be unit-less. Current unit is: <" + a.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_not(a.value);
            return ans;
        }
    });
}
