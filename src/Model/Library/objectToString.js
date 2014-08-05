/**
 * How many elements to print before cutting it off.
 * 
 * @type {Number}
 */
maxPrintObjectElements = 500;

/**
 * Create printable version of an object.
 *
 * @param  {Object} obj Object to print
 * @return {String}     Printable string
 */
function objectToString(obj) {
    var result = '';
    var count = 0;

    try {
        /**
         * Recursive function constructing the string representation of the given object.
         */
        (function(obj) {
            if (obj instanceof Object) {
                if (count < maxPrintObjectElements) {
                    result += '[';
                }

                for (var key in obj) {
                    if (count >= maxPrintObjectElements) {
                        // We need to terminate the recursion
                        // So we throw the result we have so far
                        // appended with ...
                        result += '...';
                        throw {};
                    }

                    if (isNaN(key)) {
                        // Key is not a number
                        result += key + ':';
                    }

                    if (obj[key] instanceof Object) {
                        // With this condition we avoid a recursive call in case
                        // we reach a base case;
                        arguments.callee(obj[key]);
                    } else {
                        if (typeof obj[key] === 'string') {
                            result += '\'' + obj[key].toString() + '\'';
                        } else {
                            result += obj[key].toString();
                        }
                    }

                    count++;

                    result += ',';
                }
                // replace the last
                if (result.charAt(result.length - 1) === ',') {
                    result = result.slice(0, -1);
                }
                result += ']';
            } else {
                if (typeof obj === 'string') {
                    result += '\'' + obj.toString() + '\'';
                } else {
                    result += obj.toString();
                }

            }
        })(obj);
    } catch (e) {
        // Result was terminated.
    }

    return result;
}
