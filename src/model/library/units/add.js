function add(x, y) {
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

        var std_add = exe.lib.std.add;
        var error = a.propagateError(std_add, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(a.value + b.value, {}, "unitError");
            ans.errorString = "Addition mismatch";
            return ans;
        } else {
            ans = a.clone();
            ans.value = std_add(a.value, b.value);
            return ans;
        }
    });
}

add.base = 0;
