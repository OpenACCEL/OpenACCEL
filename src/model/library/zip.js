/**
 * Applies the given function on the two given arrays. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array taking the role of the first input of the function
 * @param  {Array}   b        array taking the role of the second input of the function
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 */
function zip(a, b, func) {
    if (a instanceof Array || b instanceof Array) {
        // Recursive step, a or b is an array
        var result = [];
        if (!(a instanceof Array)) {
            // Case, a is a scalar, b is an array
            for (var key in b) {
                result[key] = zip(a, b[key], func);
            }
            return result;
        }
        if (!(b instanceof Array)) {
            // Case, b is a scalar, a is an array
            for (var key in a) {
                result[key] = zip(a[key], b, func);
            }
            return result;
        }
        // Case, a and b are both arrays
        for (var key in a) {
            if (b[key] !== undefined) {
                result[key] = zip(a[key], b[key], func);
            }
        }
        return result;
    } else {
        // Base: a and b are both scalar
        return func(a, b);
    }
}

/**
 * Original implementation of zip(), more overview but less efficiency than the zip() we use.
 * Applies the given function on the two given arrays. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array taking the role of the first input of the function
 * @param  {Array}   b        array taking the role of the second input of the function
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 */
function zip_original(a, b, func) {
    if (a instanceof Array || b instanceof Array) {
        // Recursive step, a or b is an array
        var result = [];
        if (!(a instanceof Array)) {
            // Case, a is a scalar, b is an array
            for (var key in b) {
                result[key] = zip_original(a, b[key], func);
            }
            return result;
        }
        if (!(b instanceof Array)) {
            // Case, b is a scalar, a is an array
            for (var key in a) {
                result[key] = zip_original(a[key], b, func);
            }
            return result;
        }
        // Case, a and b are both arrays
        for (var key in a) {
            if (key in b) {
                result[key] = zip_original(a[key], b[key], func);
            }
        }
        return result;
    } else {
        // Base: a and b are both scalar
        return func(a, b);
    }
}