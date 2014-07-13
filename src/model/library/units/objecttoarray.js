/**
 * Converts an object to array
 * Recursive, but only if neccessary.
 * If the object is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Object} obj object to convert
 * @return {Array}      converted array
 */
function objectToArray(obj) {
    if (!(obj instanceof Array) && obj instanceof Object) {
        var array = []; // Initialize the array
        for (var key in obj) {
            // go through each element in the object
            // and add them to the array at the same key

            if (!(obj[key] instanceof Array) && obj[key] instanceof Object) {
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
