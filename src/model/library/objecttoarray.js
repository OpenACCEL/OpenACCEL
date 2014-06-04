/**
 * Converts an object to array.recursively
 *
 * If the object is a scalar value, we just return the value
 * 
 * @param  {Object} obj object to convert
 * @return {Array}      converted array
 */
function __objectToArray__(obj) {
    if (obj instanceof Object) {
        var array = []; // Initialize the array
        for (var key in obj) {
            // go through each element in the object
            // and add them to the array at the same key
            array[key] = __objectToArray__(obj[key]);
        }
        return array;
    } else {
        return obj;
    }
}
