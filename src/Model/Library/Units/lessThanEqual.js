function lessThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        var std_lte = exe.lib.std.lessThanEqual;
        var error = UnitObject.prototype.propagateError(std_lte, a, b);
        if (error) {
            return error;
        }

        if(!a.equals(b)) {
            return new UnitObject(std_lte(a.value, b.value), {}, "unitError",
                "Arguments of <= must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.");
        } else {
            return a.clone(std_lte(a.value, b.value));
        }
    });
}
