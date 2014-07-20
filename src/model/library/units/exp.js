function exp(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_exp = exe.lib.std.exp;

        if (a.hasUnit()) {
            return new UnitObject(std_exp(a.value), {}, "Exp should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_exp(a.value);
            return ans;
        }
    });
}