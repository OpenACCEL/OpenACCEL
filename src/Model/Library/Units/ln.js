function ln(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_ln = exe.lib.std.ln;
        var error = UnitObject.prototype.propagateError(std_ln, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_ln(a.value), {}, "Ln should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_ln(a.value);
            return ans;
        }
    });
}
