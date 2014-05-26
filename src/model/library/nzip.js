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
            allScalar = false;
            // Determine if there is an array in the input.
            break;
        }
    }
    if (allScalar) {
        // Base: all elements in x are scalar
        return func.apply(this, x);
    } else {
        var result = [];
        // Return variable.
        var referenceKeys;
        // Set of keys that are valid candidates for matching with the rest of the input,
        // thus having a potential place in the output.
        var numKeys;
        // Number of keys in the set of referenceKeys.
        for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
            if (x[inKey] instanceof Object) {
                referenceKeys = Object.keys(x[inKey]);
                // Keys of contender for input of reference found.
                numKeys = referenceKeys.length;
                break;
                // Cut off the loop as soon as possible
            }
        }
        var isCommonKey;
        // True if resultKey occurs in every input in x.
        var recursiveInput;
        // Input to be used for the recursive call.
        for (var resultKey = numKeys - 1; resultKey >= 0; resultKey--) {
            recursiveInput = [];
            // Start with empty input
            isCommonKey = true;
            // Key occurs in every input until proven otherwise.
            for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
                // Loop over all inputs in x.
                if (x[inKey] instanceof Object) {
                    if (x[inKey][referenceKeys[resultKey]] !== undefined) {
                        // Loop over all keys in our input of reference.
                        recursiveInput[inKey] = x[inKey][referenceKeys[resultKey]];
                    } else {
                        isCommonKey = false;
                        // Key does not occur in this array.
                        break;
                        // Cut short loop to save processing time.
                    }
                } else {
                    // Input x[inKey] is a scalar.
                    recursiveInput[inKey] = x[inKey];
                }
            }
            if (isCommonKey) {
                // Key occurs in all non-scalar inputs.
                result[referenceKeys[resultKey]] = nzip(recursiveInput, func);
                // Put the recursive result in the representative key.
            }
        }
        return result;
    }
}
