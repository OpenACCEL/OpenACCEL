/**
 * Converts an object to array
 * Recursive, but only if neccessary.
 * If the object is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Object} obj object to convert
 * @param  {Boolean} Whether the function should be applied recursively.
 * @return {Array}      converted array
 */
function objectToArray(obj, nonRecursive) {
    if (!(obj instanceof Array) && obj instanceof Object) {
        var array = []; // Initialize the array
        for (var key in obj) {
            // go through each element in the object
            // and add them to the array at the same key

            if (!nonRecursive && !(obj[key] instanceof Array) && obj[key] instanceof Object) {
                array[key] = objectToArray(obj[key]);
            } else {
                array[key] = obj[key];
            }
        }
        return array;
    } else {
        return obj;
    }
}
