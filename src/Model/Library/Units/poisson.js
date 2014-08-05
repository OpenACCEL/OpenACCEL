function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y, z], function(a, b, c) {
        var std_poisson = exe.lib.std.poisson;
        var error = UnitObject.prototype.propagateError(std_poisson, a, b, c);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit() || c.hasUnit()) {
            return new UnitObject(std_poisson(a.value, b.value, c.value), {}, "unitError",
                "All arguments of the \"poisson\" function must be unit-less. Current units are <" + a.toString() + ">, <" + b.toString() + "> and <" + c.toString() + ">.");
        } else {
            var ans = a.clone()
            ans.value = std_poisson(a.value, b.value, c.value);
            return ans;
        }
    });
}