function notEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_neq = exe.lib.std.notEqual;
        var error = UnitObject.prototype.propagateError(std_neq, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(std_neq(a.value, b.value), {}, "unitError",
                "Arguments of != must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return new UnitObject(std_neq(a.value, b.value));
        }
    });
}
