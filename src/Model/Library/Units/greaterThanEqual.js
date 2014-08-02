function greaterThanEqual(x, y) {
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

        var std_gte = exe.lib.std.greaterThanEqual;
        var error = UnitObject.prototype.propagateError(std_gte, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(std_gte(a.value, b.value), {}, "unitError",
                "Both arguments of >= must be the same. Current units are <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_gte(a.value, b.value);
            return ans;
        }
    });
}
