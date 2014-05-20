/**
 * Applies the given function on the given array. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   x        array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function} func    function that should be applied
 * @return {Array}            Resulting array.
 */
function nZip(x, func) {
    var allScalar = true;
    for (var inKey in x) {
        if (x[inKey] instanceof Array) {
            allScalar = false;
            break;
        }
    }
    if (allScalar) {
        // Base: all elements in x are scalar
        return func.apply(this, x);
    } else {
        var result;
        // Return variable.
        var referenceIndex;
        // Index of the element that will serve as a base for zipping its keys
        for (var inKey in x) {
            if (x[inKey] instanceof Array) {
                referenceIndex = inKey;
                // Contender for input of reference found.
                break;
                // Cut off the loop as soon as possible
            }
        }
        var isCommonKey;
        // True if resultKey occurs in every input in x.
        var recursiveInput;
        // Input to be used for the recursive call.
        for (var resultKey in x[referenceIndex]) {
            recursiveInput = [];
            // Start with empty input
            isCommonKey = true;
            // Key occurs in every input until proven otherwise.
            for (var inKey in x) {
                // Loop over all inputs in x.
                if (x[inKey] instanceof Array) {
                    if (resultKey in x[inKey]) {
                        // Loop over all keys in our input of reference
                        recursiveInput[inKey] = x[inKey][resultKey];
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
                result[resultKey] = nZip(recursiveInput, func);
                // Put the recursive result in the representative key.
            }
        }
        return result;
    }
}