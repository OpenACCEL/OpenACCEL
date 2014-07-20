function subtract(x, y) {
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

        var std_subtract = exe.lib.std.subtract;
        var error = a.propagateError(std_subtract, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(a.value - b.value, {}, "unitError");
            ans.errorString = "Subtract mismatch";
            return ans;
        } else {
            ans = a.clone();
            ans.value = std_subtract(a.value, b.value);
            return ans;
        }
    });
}
