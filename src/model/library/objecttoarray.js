/**
 * Converts an object to array.recursively
 * @param  {Object} obj object to convert
 * @return {Array}      converted array
 */
function __objectToArray__(obj) {
    var array = []; // Initialize the array
    for (var key in obj) {
        // go through each element in the object
        // and add them to the array at the same key
        var elem = obj[key];
        if (elem instanceof Object) {
            // element is an object which
            // also has to be converted to an array.
            elem = __objectToArray__(elem);
        }
        array[key] = elem;
    }
    return array;
}
