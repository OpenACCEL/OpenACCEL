function tan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }
        
        var std_tan = exe.lib.std.tan;
        var error = UnitObject.prototype.propagateError(std_tan, a);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_tan(a.value), {}, "Tan should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_tan(a.value);
            return ans;
        }
    });
}
