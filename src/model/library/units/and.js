function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
            var std_and = exe.lib.std.and;
            var error = a.propagateError(std_and, b);
            if (error) {
                return error;
            }
    
            if (!a.equals(b)) {
                return new UnitObject(std_and(a.value, b.value), {}, "Units should be equal.");
            } else {
                var ans = a.clone()
                ans.value = std_and(a.value, b.value);
                return ans;
            }
    });
}

and.base = true;
