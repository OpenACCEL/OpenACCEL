function lessThanEqual(x, y) {
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
        console.log(JSON.stringify(a));
        var std_lte = exe.lib.std.lessThanEqual;
        var error = UnitObject.prototype.propagateError(std_lte, a, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {

            ans = new UnitObject(std_lte(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to <= must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
        } else {
            console.log(JSON.stringify(a));
            ans = a.clone();
            ans.value = std_lte(a.value, b.value);
        }

        return ans;
    });
}
