function imply(x, y) {
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

        var std_imply = exe.lib.std.imply;
        var error = UnitObject.prototype.propagateError(std_imply, a, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_imply(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"imply\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
        } else {
            var ans = a.clone()
            ans.value = std_imply(a.value, b.value);
        }

        return ans;
    });
}
