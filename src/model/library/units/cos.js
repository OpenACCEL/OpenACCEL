function cos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_cos = exe.lib.std.cos;

        if (a.hasUnit()) {
            return new UnitObject(std_cos(a.value), {}, "Cos should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_cos(a.value);
            return ans;
        }
    });
}

