function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
            var error = this.propagateError(exe.lib["std"].and, other);
            if (error) {
                return error;
            }
    
            if (!a.equals(b)) {
                return new UnitObject(exe.lib["std"].and(a.value, b.value), {}, "Units should be equal.");
            } else {
                var ans = a.clone()
                ans.value = exe.lib["std"].and(a.value, b.value);
                return ans;
            }
    });
}

and.base = true;
