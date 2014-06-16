/**
 * @memberof Model.Library
 * Returns an array containing the domain of x.
 * @param  x		array of which the domain should be gotten
 * @return result	array with the domain (keys) of x
 */
function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var keys = Object.keys(x);
    var namedKeys = [];
    var max = -1;
    var current;
    //Find the maximum numerical index
    for (var i = keys.length - 1; i >= 0; i--) {
        current = parseInt(keys[i]);
        //Upon finding the first numerical key, consider this the maximum and stop looping, having all named keys is assumed.
        //This uses the assumption that Object.keys alwyas puts all numerical keys first and in sequence.
        if (isNaN(current)) {
            namedKeys.push(keys[i]);
        } else {
            max = current;
            break;
        }
    }
    //Return if the highest numerical key is found at itself as index in keys or if no numerical indices were found.
    //This uses the assumption that Object.keys alwyas puts all numerical keys first and in sequence.
    if (keys[max] == max || max === -1) {
        return keys;
    }
    //Create array with the domain 0 to max and add all named keys to it.
    var result = [];
    for (var i = max; i >= 0; i--) {
        result[i] = i;
    }
    for (var i = namedKeys.length - 1; i >= 0; i--) {
        result.push(namedKeys[i]);
    }
    return result;
}
