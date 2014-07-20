function atan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_atan = exe.lib.std.atan;

        if (a.hasUnit()) {
            return new UnitObject(std_atan(a.value), {}, "Atan should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_atan(a.value);
            return ans;
        }
    });
}

