function add(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        // Copy over units for the addition base case.
        if (a.isNormal() && a.value === 0 && !b.isNormal()) {
            a.setUnit(b.unit);
        }

        if (b.isNormal() && b.value === 0 && !a.isNormal()) {
            b.setUnit(a.unit);
        }

        var std_add = exe.lib.std.add;
        var error = UnitObject.prototype.propagateError(std_add, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(a.value + b.value, {}, "unitError",
                "Both arguments of the \"add\" function must be the same. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            var ans = a.clone();
            ans.value = std_add(a.value, b.value);
            return ans;
        }
    });
}

add.base = 0;
