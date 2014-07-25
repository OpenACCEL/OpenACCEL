/**
 * Applies the given function on the given array or scalar. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array | Number}   a        array or scalar to which the given function should be applied
 * @param  {Function} func function that should be applied
 * @return {Array | Number}            Result of applying operator.
 *
 * @memberof Model.Library
 */
this.std.unaryZip = function(a, func) {
    if (a instanceof Array) {
        // Recursive step, a is an array
        var result = [];
        for (var key in a) {
            result[key] = this.libraries.std.unaryZip(a[key], func);
        }
        return result;
    } else {
        // Base: a is a scalar
        return func(a);
    }
};
