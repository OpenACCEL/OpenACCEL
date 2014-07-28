/**
 * 
 * Applies the given function on the given array. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array taking the role of the first input of the function
 * @param  {Array}   b        array taking the role of the second input of the function
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 *
 * @memberof Model.Library
 */
function binaryZip(a, b, func) {
    var isScalarA = !(a instanceof Array);
    var isScalarB = !(b instanceof Array);

    if (!isScalarA || !isScalarB) {
        // Recursive step, a or b is an array
        var result = [];
        var key;

        if (isScalarA) {
            // Case, a is a scalar, b is an array
            for (key in b) {
                result[key] = binaryZip(a, b[key], func);
            }
            return result;
        }
        if (isScalarB) {
            // Case, b is a scalar, a is an array
            for (key in a) {
                result[key] = binaryZip(a[key], b, func);
            }
            return result;
        }
        // Case, a and b are both arrays
        for (key in a) {
            if (b[key] !== undefined) {
                result[key] = binaryZip(a[key], b[key], func);
            }
        }
        return result;
    } else {
        // Base: a and b are both scalar
        return func(a, b);
    }
}
