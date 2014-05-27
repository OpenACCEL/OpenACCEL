/**
 * Applies the given function on the given array of arrays. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 */
function nzip(x, func) {
    var numArgs = x.length;
    var allScalar = true;
    for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
        if (x[inKey] instanceof Object) {
            // Determine if there is an array in the input.
            allScalar = false;
            break;
        }
    }
    if (allScalar) {
        // Base: all elements in x are scalar
        return func.apply(this, x);
    } else {
        // Return variable.
        var result = [];
        // Set of keys that are valid candidates for matching with the rest of the input,
        // thus having a potential place in the output.
        var referenceKeys;
        // Number of keys in the set of referenceKeys.
        var numKeys;
        for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
            if (x[inKey] instanceof Object) {
                // Keys of contender for input of reference found.
                referenceKeys = Object.keys(x[inKey]);
                numKeys = referenceKeys.length;
                // Cut off the loop as soon as possible
                break;
            }
        }
        // True if resultKey occurs in every input in x.
        var isCommonKey;
        // Input to be used for the recursive call.
        var recursiveInput;
        for (var resultKey = numKeys - 1; resultKey >= 0; resultKey--) {
            // Start with empty input
            recursiveInput = [];
            // Key occurs in every input until proven otherwise.
            isCommonKey = true;
            // Loop over all inputs in x.
            for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
                if (x[inKey] instanceof Object) {
                    // Check if keys contained in all objects
                    if (x[inKey][referenceKeys[resultKey]] !== undefined) {
                        recursiveInput[inKey] = x[inKey][referenceKeys[resultKey]];
                    } else {
                        // Key does not occur in this array.
                        isCommonKey = false;
                        // Cut short loop to save processing time.
                        break;
                    }
                } else {
                    // Input x[inKey] is a scalar.
                    recursiveInput[inKey] = x[inKey];
                }
            }
            // Key occurs in all non-scalar inputs.
            if (isCommonKey) {
                // Put the recursive result in the representative key.
                result[referenceKeys[resultKey]] = nzip(recursiveInput, func);
            }
        }
        return result;
    }
}
