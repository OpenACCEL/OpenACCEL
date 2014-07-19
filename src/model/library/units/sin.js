function sin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        }

        var std_sin = exe.lib.std.sin;

        if (a.hasUnit()) {
            return new UnitObject(std_sin(a.value), {}, "Sin should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_sin(a.value);
            return ans;
        }
    });
}

