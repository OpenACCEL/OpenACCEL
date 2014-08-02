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
        var error = UnitObject.prototype.propagateError(std_subtract, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(a.value - b.value, {}, "unitError",
                "Both arguments of the \"subtract\" function must be the same. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            var ans = a.clone();
            ans.value = std_subtract(a.value, b.value);
            return ans;
        }
    });
}
