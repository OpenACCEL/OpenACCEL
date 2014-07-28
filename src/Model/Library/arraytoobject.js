/**
 * Converts an array to object
 * Recursive, but only if neccessary.
 * If the array is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Array} arr  array to convert
 * @return {Object}      converted object
 */
function arrayToObject(arr) {
    if (arr instanceof Array) {
        var obj = {}; // Initialize the object
        for (var key in arr) {
            // go through each element in the object
            // and add them to the array at the same key

            if (arr instanceof Array) {
                obj[key] = arrayToObject(arr[key]);
            } else {
                obj[key] = arr[key];
            }
        }
        return obj;
    } else {
        return arr;
    }
}
