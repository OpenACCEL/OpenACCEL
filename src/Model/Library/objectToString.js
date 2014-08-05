/**
 * Create printable version of an object.
 *
 * @param  {Object} obj Object to print
 * @return {String}     Printable string
 */
function objectToString(obj, maxElements) {
    if (typeof maxElements === 'undefined') {
        maxElements = 1000;
    }

    var result = '';
    var count = 0;

    try {
        /**
         * Recursive function constructing the string representation of the given object.
         */
        (function(obj, maxElements) {
            if (obj instanceof Object) {
                if (count < maxElements) {
                    result += '[';
                }

                for (var key in obj) {
                    if (count >= maxElements) {
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
                        arguments.callee(obj[key], maxElements);
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
        })(obj, maxElements);
    } catch (e) {
        // Result was terminated.
    }

    return result;
}
