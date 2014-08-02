function equal(x, y) {
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

        var std_eq = exe.lib.std.equal;
        var error = UnitObject.prototype.propagateError(std_eq, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(std_eq(a.value, b.value), {}, "unitError",
                "Arguments of == must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_eq(a.value, b.value);
            return ans;
        }
    });
}
