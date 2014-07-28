function and(x, y) {
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

        var std_and = exe.lib.std.and;
        var error = a.propagateError(std_and, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_and(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"and\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_and(a.value, b.value);
            return ans;
        }
    });
}

and.base = true;
