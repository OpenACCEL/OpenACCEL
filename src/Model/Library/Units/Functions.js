/**
 * @class
 * @classdesc An object that represents a value with a unit.
 *
 * A unit is any expression of the form numerator or numerator/denominator,
 * where both numerator and denominator consist of zero or more factors.
 * Factors can be any string consisting of letters only, optionally followed by a positive integer, indicating the power.
 * Factors are separated by points (.).
 *
 * The powers of units appearing in the denominator are negative.
 *
 * In case there is an error with one of the units, the 'error' property
 * will hold an error message.
 *
 * The 'normal form' of a UnitObject is just having the 'unit' == {}.
 */
function UnitObject(value, unit, error) {
    /**
     * The actual calculated value.
     */
    this.value = (typeof value !== "undefined") ? value : null;

    /**
     * The physical unit that goes with the value.
     * Each key will be the unit itself, with the value being the power.
     *
     * The output is of the form
     * "{'unit1': power1, 'unit2': power2, .... }"
     *
     * An example of 'kg * m / s^2', or 'kg.m/s2' would be:
     * "{ 'kg': 1, 'm': 1, 's': -2 }"
     *
     * @type {Object}
     */
    this.unit = (typeof unit !== "undefined" || unit === '') ? unit : {};

    /**
     * A possible error that could be the result of an invalid
     * unit operation. This will replace this.unit in the string
     * representation of this unit if it's not the empty string.
     *
     * @type {String}
     */
    this.error = (typeof error !== "undefined") ? error : null;

    /**
     * A description of the unit error that occured.
     *
     * @type {String}
     */
    this.errorString = '';
}

/**
 * Creates a shallow clone of the UnitObject, giving a fresh copy that can be
 * modified, without modifying the original object.
 *
 * @return {UnitObject} The shallow copy.
 */
UnitObject.prototype.clone = function() {
    var ans = new UnitObject(this.value);
    ans.setUnit(this.unit);
    ans.error = this.error;
    ans.errorString = this.errorString;

    return ans;
};

/**
 * Sets the unit of a UnitObject, but by creating a copy instead.
 * This way you do not end up accidentally modifying the original source of
 * the unit that has been passed as the argument.
 *
 * @param {Object} unit The new unit of the UnitObject.
 */
UnitObject.prototype.setUnit = function(unit) {
    this.unit = {};

    for (var key in unit) {
        this.unit[key] = unit[key];
    }
};

/**
 * Removes all elements of a unit whose value is zero.
 * This directly modifies the instance of the UnitObject.
 */
UnitObject.prototype.clean = function() {
    for (var key in this.unit) {
        if (this.unit[key] === 0) {
            delete this.unit[key];
        }
    }
};

/**
 * Filters out all positive powers in the unit, effectively returning the nominator.
 *
 * If the unit is {'kg': 1, 'm': 1, 's': -2}, the method
 * will return {'kg': 1, 'm': 1}.
 *
 * @return {Object} The nominator.
 */
UnitObject.prototype.getNominator = function() {
    var nominator = {};

    for (var key in this.unit) {
        if (this.unit[key] > 0) {
            nominator[key] = this.unit[key];
        }
    }

    return nominator;
};

/**
 * Filters out all negative powers in the unit, effectively returning the denominator.
 *
 * If the unit is {'kg': 1, 'm': 1, 's': -2}, the method
 * will return {'s': -2}.
 *
 * @return {Object} The denominator.
 */
UnitObject.prototype.getDenominator = function() {
    var denominator = {};

    for (var key in this.unit) {
        if (this.unit[key] < 0) {
            denominator[key] = this.unit[key];
        }
    }

    return denominator;
};

/**
 * Returns the unit of the UnitObject as an OpenACCEL unit string.
 * For example, {'kg': 1, 'm': 1, 's': -2} will return "kg.m/s2".
 *
 * @return {String} The unit in OpenACCEL string format.
 */
UnitObject.prototype.unitToString = function() {
    var ans = "";

    if (this.error !== null && this.error !== '') {
        ans = this.error;
    } else if (this.isNormal()) {
        ans = "1";
    } else {
        var nominator = this.getNominator();
        var denominator = this.getDenominator();
        var lnom = Object.keys(nominator).length;
        var ldenom = Object.keys(denominator).length;

        // Construct terms in nominator
        if (lnom === 0) {
            ans += "1";
        } else {
            for (var pos in nominator) {
                ans += pos;
                if (nominator[pos] > 1) {
                    ans += nominator[pos];
                }
                ans += ".";
            }

            // Remove last dot from nonimator and add slash if denominator
            ans = ans.substring(0, ans.length-1);
        }

        if (ldenom > 0) {
            ans += "/";
            for (var neg in denominator) {
                ans += neg;
                if (denominator[neg] < -1) {
                    ans += denominator[neg]*-1;
                }
                ans += ".";
            }

            // Remove last dot from denominator
            ans = ans.substring(0, ans.length-1);
        }
    }

    return ans;
};

/**
 * Given an array of values and units, zip them together to create an array of UnitObjects.
 * If a value is already a UnitObject, it's unit will be overwritten.
 *
 * @param  {Object} values The values.
 * @param  {Object} units  The units.
 * @return {UnitObject}    The resulting zipped UnitObjects.
 */
UnitObject.prototype.create = function(values, units) {
    return zip([values, units], function(value, unit) {
        if (value instanceof UnitObject) {
            var ans = value.clone();
            ans.setUnit(unit);
            return ans;
        } else {
            return new UnitObject(value, unit);
        }
    });
};

/**
 * Checks whether the signature of the given (array of) UnitObject(s)
 * matches the signature of it's/their value(s).
 *
 * @param {Object} val The value to match against unit
 * @return {UnitObject} The given (array of) UnitObject(s) if the signature is correct,
 * or a new UnitObject with an error if not.
 */
UnitObject.prototype.verifySignature = function(val, unit) {
    var match = true;

    // If both value and unit are scalars, they match and we are done
    if (!(val instanceof Array) && !(unit instanceof Array)) {
        match = true;
    } else if (((val instanceof Array) && !(unit instanceof Array)) ||
        (!(val instanceof Array) && (unit instanceof Array))) {
        // If one is an array but the other is not, we have a mismatch
        match = false;
    } else {
        // Both are arrays. First check whether they have the same length
        // NOTE: check disabled because keys.length returns incorrect number
        // with named vectors
        /*if (Object.keys(unit).length !== val.length) {
            return false;
        }*/

        /**
         * Check whether both unit and value have the same keys. Recursively!
         * Start by collecting all keys from both arrays. These keys can be both numerical
         * indices and strings.
         */
        var keys = [];
        var key;
        for (key in val) { keys.push(key); }
        for (key in unit) { keys.push(key); }

        for (key in keys) {
            // Check whether this key appears in both the value and unit
            if (!val[keys[key]] || !unit[keys[key]]) {
                match = false;
                break;
            } else {
                // Both have this key. Make sure the signature of both elements is the same as well
                match = this.verifySignature(val[keys[key]], unit[keys[key]]);
                if (!match) {
                    break;
                }
            }
        }
    }

    return match;
};

/**
 * Determines whether two UnitObjects have the exact same unit.
 *
 * @param  {UnitObject} other The other UnitObject that should be compared with.
 * @return {Boolean} Whether the units are exactly the same.
 */
UnitObject.prototype.equals = function(other) {
    // We tried JSON.stringify, but it would return false when things are
    // out of order, even when the units are actually equal.
    if (Object.keys(this.unit).length !== Object.keys(other.unit).length) {
        return false;
    }

    // If the number of unit elements are equal, we can compare the elements
    // of one UnitObject with the other.
    for (var key in this.unit) {
        if (this.unit[key] !== other.unit[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Given one or more UnitObjects, returns a new UnitObject with the value computed by the given
 * function applied to the given arguments, and an 'uncheckedUnit' error
 *
 * Error _strings_ are not propagated to prevent error messages from stacking up and
 * appearing multiple times.
 *
 * @param  {Function} f The function that zips the values of the two objects together when there is an error.
 * @param  {UnitObject} args An
 * @return A UnitObject with error and updated value if x or y contains an error. False otherwise.
 */
UnitObject.prototype.propagateError = function(f) {
    // Convert arguments list to array
    var args = Array.prototype.slice.call(arguments, 1);

    // Find the first error in the given arguments array. If there is one,
    // call the given function with the given arguments and return an
    // 'uncheckedUnit' error.
    var err = this.findFirstError(args);
    if (err !== '') {
        args = UnitObject.prototype.toArray(args);
        return new UnitObject(f.apply(null, args), {}, 'uncheckedUnit');
    } else {
        return false;
    }
};

/**
 * Converts the given array of UnitObjects to an array containing
 * only their values.
 * @param  {Array} arr The array of UnitObjects to convert.
 * @return {Array} An array containing the values of all UnitObjects
 * in arr in their original order.
 */
UnitObject.prototype.toArray = function(arr) {
    var l = arr.length;
    var newArr = new Array(l);
    for (var i = l-1; i >= 0; i--) {
        newArr[i] = arr[i].value;
    }

    return newArr;
};

/**
 * Recursively traverses the (array of array of ...) UnitObject(s) and
 * returns the first error it finds.
 *
 * @param  {UnitObject} obj (array of array of ...) UnitObject(s)
 * @return {String} The first error found
 */
UnitObject.prototype.findFirstError = function(obj) {
    if (obj instanceof Array) {
        for (obj2 in obj) {
            var err = this.findFirstError(obj[obj2]);
            if (err !== '') {
                return err;
            }
        }

        // If no errors were found, return ''
        return '';
    } else {
        return obj.errorString;
    }
};

/**
 * @return {Boolean} Whether the UnitObject has any unit at all, and is not the
 * identity unit (for multiplication).
 */
UnitObject.prototype.hasUnit = function() {
    return Object.keys(this.unit).length > 0;
};

/**
 * @return {Boolean} Whether the UnitObject has no unit, and thus is the
 * identity unit (for multiplication).
 */
UnitObject.prototype.isNormal = function() {
    return Object.keys(this.unit).length === 0;
};

/**
 * Calculates the units of the product of two UnitObjects.
 * The multiplication of a unit with unit with error results in an empty unit with error.
 * The multiplication of a unit with the normal unit results in itself.
 *
 * This renders the value property USELESS!
 *
 * @param  {UnitObject} other The other UnitObject that should be multiplied with.
 * @return {UnitObject}       A new UnitObject that is the result of the multiplication.
 */
UnitObject.prototype.multiply = function(other) {
    // Identity * Unit = Unit.
    var ans;
    if (this.isNormal()) {
        return other.clone();
    }

    // Copy over the units of the left hand side and multiply the values.
    ans = this.clone();

    // Unit * Identity = Unit.
    if (other.isNormal()) {
        return ans;
    }

    // Copy over the units of the right hand side. If the key is already present,
    // we simply add the two values of that key together.
    for (var key in other.unit) {
        if (key in ans.unit) {
            ans.unit[key] += other.unit[key];
        } else {
            ans.unit[key] = other.unit[key];
        }
    }

    ans.clean();
    return ans;
};

/**
 * Calculates the units of the division of two UnitObjects.
 * The multiplication of a unit with unit with error results in an empty unit with error.
 * The multiplication of a unit with the normal unit results in itself.
 *
 * This renders the value property USELESS!
 *
 * @param  {UnitObject} other The other UnitObject that should be divided with.
 * @return {UnitObject}       A new UnitObject that is the result of the division.
 */
UnitObject.prototype.divide = function(other) {
    // Identity / Unit = Unit.
    var ans;
    if (this.isNormal()) {
        return other.clone();
    }

    // Copy over the units of the left hand side and divide the values.
    ans = this.clone();

    // Unit / Identity = Unit.
    if (other.isNormal()) {
        return ans;
    }

    // Copy over the units of the right hand side. If the key is already present,
    // we simply subtract the two values of that key.
    for (var key in other.unit) {
        if (key in ans.unit) {
            ans.unit[key] -= other.unit[key];
        } else {
            ans.unit[key] = 0 - other.unit[key];
        }
    }

    ans.clean();
    return ans;
};

UnitObject.prototype.power = function(exponent) {
    var ans;

    // The exponent must be unitless.
    // Take note however, that the exponent will also always be a UnitObject.
    if (exponent.hasUnit()) {
        ans = new UnitObject(this.value, { }, "unitError");
        ans.errorString = "Exponent is not unitless";
        return ans;
    }

    // Determine whether this is an inverse exponent or not.
    var bInverse = exponent.value < 1 && exponent.value > -1;

    // Throw an error if the exponent is not an integer.
    if (!bInverse && exponent.value % 1 !== 0) {
        ans = new UnitObject(this.value, { }, "unitError");
        ans.errorString = "Non integer exponent";
        return ans;
    }

    ans = this.clone();

    // Only modify the units if there's no error.
    if (!this.error) {
        for (var key in ans.unit) {
            ans.unit[key] *= exponent.value;

            // Check if the resulting unit is still an integer when having an invert exponent.
            if (bInverse && ans.unit[key] % 1 !== 0) {
                ans.unit = {};
                ans.error = "unitError";
                ans.errorString = "Not all units are integers (inverse exponent)";
            }
        }
    }

    ans.clean();
    return ans;
};

UnitObject.prototype.toString = UnitObject.prototype.unitToString;
function abs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_abs = exe.lib.std.abs;
        var error = a.propagateError(std_abs);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_abs(a.value);
        return ans;
    });
}

function acos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_acos = exe.lib.std.acos;
        var error = a.propagateError(std_acos);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_acos(a.value), {}, "Acos should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_acos(a.value);
            return ans;
        }
    });
}

function add(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_add = exe.lib.std.add;
        var error = a.propagateError(std_add, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(a.value + b.value, {}, "unitError");
            ans.errorString = "Addition mismatch";
            return ans;
        } else {
            ans = a.clone();
            ans.value = std_add(a.value, b.value);
            return ans;
        }
    });
}

add.base = 0;
function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_and = exe.lib.std.and;
        var error = a.propagateError(std_and, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_and(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"and\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_and(a.value, b.value);
            return ans;
        }
    });
}

and.base = true;
function asin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_asin = exe.lib.std.asin;

        var error = a.propagateError(std_asin);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_asin(a.value), {}, "Asin should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_asin(a.value);
            return ans;
        }
    });
}

function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (y instanceof Array) {
        // Recursive step, y is an array
        var result = [];
        for (var key in y) {
            result[key] = at(x, y[key]);
        }
        return result;
    } else {
        if (!isNaN(y)) {
            y = Math.round(y);
        }
        // Base: y is a scalar
        if (x instanceof Array) {
            if (x[y] === undefined) {
                return [];
            } else {
                return x[y];
            }
        } else {
            //If x is scalar we simply use x instead of x[y]
            return x;
        }
    }
}
function atan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_atan = exe.lib.std.atan;

        var error = a.propagateError(std_atan);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_atan(a.value), {}, "Atan should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_atan(a.value);
            return ans;
        }
    });
}

function atan2(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_atan2 = exe.lib.std.atan2;
        var error = a.propagateError(std_atan2, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_atan2(a.value, b.value), {}, "Atan2 units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_atan2(a.value, b.value);
            return ans;
        }
    });
}function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_bin = exe.lib.std.bin;
        var error = a.propagateError(std_bin, b);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit()) {
            return new UnitObject(std_bin(a.value, b.value), {}, "Bin argument should be dimensionless.");
        } else {
            var ans = a.clone()
            ans.value = std_bin(a.value, b.value);
            return ans;
        }
    });
}/**
 * Placeholder function for the button function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @return {Array}     Empty array
 */
function button() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'button' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [];

}

button.isTimeDependent = true;
function ceil(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_ceil = exe.lib.std.ceil;
        var error = a.propagateError(std_ceil);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_ceil(a.value);
        return ans;
    });
}

/**
 * Placeholder function for the check function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @param  {Boolean} def default value of the checkbox
 * @return {Array}     Singleton array with def
 */
function check(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'check' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (typeof def === 'boolean') {
        return [def];
    } else {
        throw new Error('Argument of check must be true or false');
    }
}

check.isTimeDependent = true;
var MINURLDELAY = 1000;
// every call to a url is protected by a timer to prevent bandwith exhaustion: one URL shall not be called more frequently than
// once every MINURLDELAY millisec. Calls that occur more frequently will simply return the same value as the previous call
// to that URL. A URL, here, is interpreted as the part prior to the question mark. Indeed, a same host can be spammed by a
// high frequent series of calls each time with different parameters. We don't both the same host more often than
// once every MINURLDELY millisec. On the other hand, we ensure that the parameters of every call are different, so that
// browsers cannot cache results ,thereby hiding any changes in server-side state.
var putChanTimers = [];
var getChanTimers = [];
// entries in the array urlTimers are distinguished by the host. That is, all calls to the keyMap-url are scheduled via the same array urlTimers. For this
// reason, there should not be two or more calls to getUrl in one script. In case multiple in- or out channels are needed, we can use the keyMap server, but
// then we need to schedule them based on the key-name. For this reason, we have two extra arrays with timers.

var urlTimers = [];

var E = Math.E;

var PI = Math.PI;
function cos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_cos = exe.lib.std.cos;
        var error = a.propagateError(std_cos);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_cos(a.value), {}, "Cos should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_cos(a.value);
            return ans;
        }
    });
}

function debug(c, v) {
    if (typeof c === "string") {
        if (v instanceof Array) {
            var val = ''
            if (v['return'] != undefined) {
                for (var k in v) {
                    val = val.concat(k).concat(":").concat(JSON.stringify(v[k])).concat(",")
                }
                // TODO, write message to debug windo or something
                //console.log(c + ": " + val.substring(0, val.length - 1));
                return v['return']
            } else {
                throw new Error("\nFor function debug(), the second argument must be a vector, which must contain an element named 'return'");
            }
        } else {
            throw new Error("\nFor function debug(), the second argument must be a vector, the first element of which is returned to the caller");
        }
    } else {
        throw new Error("\nFor function debug(), the first argument must be a string (= text to help identify the debug output)");
    }
}
function divide(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_divide = exe.lib.std.divide;
        var error = a.propagateError(std_divide, b);
        if (error) {
            return error;
        }

        var ans = a.divide(b);
        ans.value = std_divide(a.value, b.value);
        return ans;
    });
}function __do__(code, args) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (typeof code === "string") {
        if (args instanceof Object) {
            for (var arg in args) {
                var target = new RegExp('_' + arg, "g");
                code = code.replace(target, JSON.stringify(args[arg]));
                try {
                    // this is to protect against all disasters like syntax errors in the script string code we can't foresee
                    var res = (new Function(code))();
                    return res;
                } catch (err) {
                    return 'ERROR';
                }
            }
        } else {
            throw new Error("\nFor function do(), second argument must be a vector");
  
        }
    } else {
        throw new Error("\nFor function do(), first argument must be a string (= a code fragment)");
    }
}
function equal(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_eq = exe.lib.std.equal;
        var error = a.propagateError(std_eq, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_eq(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to == must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_eq(a.value, b.value);
            return ans;
        }
    });
}
function exp(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_exp = exe.lib.std.exp;

        var error = a.propagateError(std_exp);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_exp(a.value), {}, "Exp should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_exp(a.value);
            return ans;
        }
    });
}function factorial(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_factorial = exe.lib.std.factorial;
        var error = a.propagateError(std_factorial);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_factorial(a.value), {}, "Factorial should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_factorial(a.value);
            return ans;
        }
    });
}
function floor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_floor = exe.lib.std.floor;
        var error = a.propagateError(std_floor);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_floor(a.value);
        return ans;
    });
}

/**
 * @class
 * @classdesc An object that represents a value with a unit.
 *
 * A unit is any expression of the form numerator or numerator/denominator,
 * where both numerator and denominator consist of zero or more factors.
 * Factors can be any string consisting of letters only, optionally followed by a positive integer, indicating the power.
 * Factors are separated by points (.).
 *
 * The powers of units appearing in the denominator are negative.
 *
 * In case there is an error with one of the units, the 'error' property
 * will hold an error message.
 *
 * The 'normal form' of a UnitObject is just having the 'unit' == {}.
 */
function UnitObject(value, unit, error) {
    /**
     * The actual calculated value.
     */
    this.value = (typeof value !== "undefined") ? value : null;

    /**
     * The physical unit that goes with the value.
     * Each key will be the unit itself, with the value being the power.
     *
     * The output is of the form
     * "{'unit1': power1, 'unit2': power2, .... }"
     *
     * An example of 'kg * m / s^2', or 'kg.m/s2' would be:
     * "{ 'kg': 1, 'm': 1, 's': -2 }"
     *
     * @type {Object}
     */
    this.unit = (typeof unit !== "undefined" || unit === '') ? unit : {};

    /**
     * A possible error that could be the result of an invalid
     * unit operation. This will replace this.unit in the string
     * representation of this unit if it's not the empty string.
     *
     * @type {String}
     */
    this.error = (typeof error !== "undefined") ? error : null;

    /**
     * A description of the unit error that occured.
     *
     * @type {String}
     */
    this.errorString = '';
}

/**
 * Creates a shallow clone of the UnitObject, giving a fresh copy that can be
 * modified, without modifying the original object.
 *
 * @return {UnitObject} The shallow copy.
 */
UnitObject.prototype.clone = function() {
    var ans = new UnitObject(this.value);
    ans.setUnit(this.unit);
    ans.error = this.error;
    ans.errorString = this.errorString;

    return ans;
};

/**
 * Sets the unit of a UnitObject, but by creating a copy instead.
 * This way you do not end up accidentally modifying the original source of
 * the unit that has been passed as the argument.
 *
 * @param {Object} unit The new unit of the UnitObject.
 */
UnitObject.prototype.setUnit = function(unit) {
    this.unit = {};

    for (var key in unit) {
        this.unit[key] = unit[key];
    }
};

/**
 * Removes all elements of a unit whose value is zero.
 * This directly modifies the instance of the UnitObject.
 */
UnitObject.prototype.clean = function() {
    for (var key in this.unit) {
        if (this.unit[key] === 0) {
            delete this.unit[key];
        }
    }
};

/**
 * Filters out all positive powers in the unit, effectively returning the nominator.
 *
 * If the unit is {'kg': 1, 'm': 1, 's': -2}, the method
 * will return {'kg': 1, 'm': 1}.
 *
 * @return {Object} The nominator.
 */
UnitObject.prototype.getNominator = function() {
    var nominator = {};

    for (var key in this.unit) {
        if (this.unit[key] > 0) {
            nominator[key] = this.unit[key];
        }
    }

    return nominator;
};

/**
 * Filters out all negative powers in the unit, effectively returning the denominator.
 *
 * If the unit is {'kg': 1, 'm': 1, 's': -2}, the method
 * will return {'s': -2}.
 *
 * @return {Object} The denominator.
 */
UnitObject.prototype.getDenominator = function() {
    var denominator = {};

    for (var key in this.unit) {
        if (this.unit[key] < 0) {
            denominator[key] = this.unit[key];
        }
    }

    return denominator;
};

/**
 * Returns the unit of the UnitObject as an OpenACCEL unit string.
 * For example, {'kg': 1, 'm': 1, 's': -2} will return "kg.m/s2".
 *
 * @return {String} The unit in OpenACCEL string format.
 */
UnitObject.prototype.unitToString = function() {
    var ans = "";

    if (this.error !== null && this.error !== '') {
        ans = this.error;
    } else if (this.isNormal()) {
        ans = "1";
    } else {
        var nominator = this.getNominator();
        var denominator = this.getDenominator();
        var lnom = Object.keys(nominator).length;
        var ldenom = Object.keys(denominator).length;

        // Construct terms in nominator
        if (lnom === 0) {
            ans += "1";
        } else {
            for (var pos in nominator) {
                ans += pos;
                if (nominator[pos] > 1) {
                    ans += nominator[pos];
                }
                ans += ".";
            }

            // Remove last dot from nonimator and add slash if denominator
            ans = ans.substring(0, ans.length-1);
        }

        if (ldenom > 0) {
            ans += "/";
            for (var neg in denominator) {
                ans += neg;
                if (denominator[neg] < -1) {
                    ans += denominator[neg]*-1;
                }
                ans += ".";
            }

            // Remove last dot from denominator
            ans = ans.substring(0, ans.length-1);
        }
    }

    return ans;
};

/**
 * Given an array of values and units, zip them together to create an array of UnitObjects.
 * If a value is already a UnitObject, it's unit will be overwritten.
 *
 * @param  {Object} values The values.
 * @param  {Object} units  The units.
 * @return {UnitObject}    The resulting zipped UnitObjects.
 */
UnitObject.prototype.create = function(values, units) {
    return zip([values, units], function(value, unit) {
        if (value instanceof UnitObject) {
            var ans = value.clone();
            ans.setUnit(unit);
            return ans;
        } else {
            return new UnitObject(value, unit);
        }
    });
};

/**
 * Checks whether the signature of the given (array of) UnitObject(s)
 * matches the signature of it's/their value(s).
 *
 * @param {Object} val The value to match against unit
 * @return {UnitObject} The given (array of) UnitObject(s) if the signature is correct,
 * or a new UnitObject with an error if not.
 */
UnitObject.prototype.verifySignature = function(val, unit) {
    var match = true;

    // If both value and unit are scalars, they match and we are done
    if (!(val instanceof Array) && !(unit instanceof Array)) {
        match = true;
    } else if (((val instanceof Array) && !(unit instanceof Array)) ||
        (!(val instanceof Array) && (unit instanceof Array))) {
        // If one is an array but the other is not, we have a mismatch
        match = false;
    } else {
        // Both are arrays. First check whether they have the same length
        // NOTE: check disabled because keys.length returns incorrect number
        // with named vectors
        /*if (Object.keys(unit).length !== val.length) {
            return false;
        }*/

        /**
         * Check whether both unit and value have the same keys. Recursively!
         * Start by collecting all keys from both arrays. These keys can be both numerical
         * indices and strings.
         */
        var keys = [];
        var key;
        for (key in val) { keys.push(key); }
        for (key in unit) { keys.push(key); }

        for (key in keys) {
            // Check whether this key appears in both the value and unit
            if (!val[keys[key]] || !unit[keys[key]]) {
                match = false;
                break;
            } else {
                // Both have this key. Make sure the signature of both elements is the same as well
                match = this.verifySignature(val[keys[key]], unit[keys[key]]);
                if (!match) {
                    break;
                }
            }
        }
    }

    return match;
};

/**
 * Determines whether two UnitObjects have the exact same unit.
 *
 * @param  {UnitObject} other The other UnitObject that should be compared with.
 * @return {Boolean} Whether the units are exactly the same.
 */
UnitObject.prototype.equals = function(other) {
    // We tried JSON.stringify, but it would return false when things are
    // out of order, even when the units are actually equal.
    if (Object.keys(this.unit).length !== Object.keys(other.unit).length) {
        return false;
    }

    // If the number of unit elements are equal, we can compare the elements
    // of one UnitObject with the other.
    for (var key in this.unit) {
        if (this.unit[key] !== other.unit[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Given one or more UnitObjects, returns a new UnitObject with the value computed by the given
 * function applied to the given arguments, and an 'uncheckedUnit' error
 *
 * Error _strings_ are not propagated to prevent error messages from stacking up and
 * appearing multiple times.
 *
 * @param  {Function} f The function that zips the values of the two objects together when there is an error.
 * @param  {UnitObject} args An
 * @return A UnitObject with error and updated value if x or y contains an error. False otherwise.
 */
UnitObject.prototype.propagateError = function(f) {
    // Convert arguments list to array
    var args = Array.prototype.slice.call(arguments, 1);

    // Find the first error in the given arguments array. If there is one,
    // call the given function with the given arguments and return an
    // 'uncheckedUnit' error.
    var err = this.findFirstError(args);
    if (err !== '') {
        args = UnitObject.prototype.toArray(args);
        return new UnitObject(f.apply(null, args), {}, 'uncheckedUnit');
    } else {
        return false;
    }
};

/**
 * Converts the given array of UnitObjects to an array containing
 * only their values.
 * @param  {Array} arr The array of UnitObjects to convert.
 * @return {Array} An array containing the values of all UnitObjects
 * in arr in their original order.
 */
UnitObject.prototype.toArray = function(arr) {
    var l = arr.length;
    var newArr = new Array(l);
    for (var i = l-1; i >= 0; i--) {
        newArr[i] = arr[i].value;
    }

    return newArr;
};

/**
 * Recursively traverses the (array of array of ...) UnitObject(s) and
 * returns the first error it finds.
 *
 * @param  {UnitObject} obj (array of array of ...) UnitObject(s)
 * @return {String} The first error found
 */
UnitObject.prototype.findFirstError = function(obj) {
    if (obj instanceof Array) {
        for (obj2 in obj) {
            var err = this.findFirstError(obj[obj2]);
            if (err !== '') {
                return err;
            }
        }

        // If no errors were found, return ''
        return '';
    } else {
        return obj.errorString;
    }
};

/**
 * @return {Boolean} Whether the UnitObject has any unit at all, and is not the
 * identity unit (for multiplication).
 */
UnitObject.prototype.hasUnit = function() {
    return Object.keys(this.unit).length > 0;
};

/**
 * @return {Boolean} Whether the UnitObject has no unit, and thus is the
 * identity unit (for multiplication).
 */
UnitObject.prototype.isNormal = function() {
    return Object.keys(this.unit).length === 0;
};

/**
 * Calculates the units of the product of two UnitObjects.
 * The multiplication of a unit with unit with error results in an empty unit with error.
 * The multiplication of a unit with the normal unit results in itself.
 *
 * This renders the value property USELESS!
 *
 * @param  {UnitObject} other The other UnitObject that should be multiplied with.
 * @return {UnitObject}       A new UnitObject that is the result of the multiplication.
 */
UnitObject.prototype.multiply = function(other) {
    // Identity * Unit = Unit.
    var ans;
    if (this.isNormal()) {
        return other.clone();
    }

    // Copy over the units of the left hand side and multiply the values.
    ans = this.clone();

    // Unit * Identity = Unit.
    if (other.isNormal()) {
        return ans;
    }

    // Copy over the units of the right hand side. If the key is already present,
    // we simply add the two values of that key together.
    for (var key in other.unit) {
        if (key in ans.unit) {
            ans.unit[key] += other.unit[key];
        } else {
            ans.unit[key] = other.unit[key];
        }
    }

    ans.clean();
    return ans;
};

/**
 * Calculates the units of the division of two UnitObjects.
 * The multiplication of a unit with unit with error results in an empty unit with error.
 * The multiplication of a unit with the normal unit results in itself.
 *
 * This renders the value property USELESS!
 *
 * @param  {UnitObject} other The other UnitObject that should be divided with.
 * @return {UnitObject}       A new UnitObject that is the result of the division.
 */
UnitObject.prototype.divide = function(other) {
    // Identity / Unit = Unit.
    var ans;
    if (this.isNormal()) {
        return other.clone();
    }

    // Copy over the units of the left hand side and divide the values.
    ans = this.clone();

    // Unit / Identity = Unit.
    if (other.isNormal()) {
        return ans;
    }

    // Copy over the units of the right hand side. If the key is already present,
    // we simply subtract the two values of that key.
    for (var key in other.unit) {
        if (key in ans.unit) {
            ans.unit[key] -= other.unit[key];
        } else {
            ans.unit[key] = 0 - other.unit[key];
        }
    }

    ans.clean();
    return ans;
};

UnitObject.prototype.power = function(exponent) {
    var ans;

    // The exponent must be unitless.
    // Take note however, that the exponent will also always be a UnitObject.
    if (exponent.hasUnit()) {
        ans = new UnitObject(this.value, { }, "unitError");
        ans.errorString = "Exponent is not unitless";
        return ans;
    }

    // Determine whether this is an inverse exponent or not.
    var bInverse = exponent.value < 1 && exponent.value > -1;

    // Throw an error if the exponent is not an integer.
    if (!bInverse && exponent.value % 1 !== 0) {
        ans = new UnitObject(this.value, { }, "unitError");
        ans.errorString = "Non integer exponent";
        return ans;
    }

    ans = this.clone();

    // Only modify the units if there's no error.
    if (!this.error) {
        for (var key in ans.unit) {
            ans.unit[key] *= exponent.value;

            // Check if the resulting unit is still an integer when having an invert exponent.
            if (bInverse && ans.unit[key] % 1 !== 0) {
                ans.unit = {};
                ans.error = "unitError";
                ans.errorString = "Not all units are integers (inverse exponent)";
            }
        }
    }

    ans.clean();
    return ans;
};

UnitObject.prototype.toString = UnitObject.prototype.unitToString;
function abs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_abs = exe.lib.std.abs;
        var error = a.propagateError(std_abs);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_abs(a.value);
        return ans;
    });
}

function acos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_acos = exe.lib.std.acos;
        var error = a.propagateError(std_acos);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_acos(a.value), {}, "Acos should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_acos(a.value);
            return ans;
        }
    });
}

function add(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_add = exe.lib.std.add;
        var error = a.propagateError(std_add, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(a.value + b.value, {}, "unitError");
            ans.errorString = "Addition mismatch";
            return ans;
        } else {
            ans = a.clone();
            ans.value = std_add(a.value, b.value);
            return ans;
        }
    });
}

add.base = 0;
function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_and = exe.lib.std.and;
        var error = a.propagateError(std_and, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_and(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"and\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_and(a.value, b.value);
            return ans;
        }
    });
}

and.base = true;
function asin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_asin = exe.lib.std.asin;

        var error = a.propagateError(std_asin);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_asin(a.value), {}, "Asin should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_asin(a.value);
            return ans;
        }
    });
}

function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (y instanceof Array) {
        // Recursive step, y is an array
        var result = [];
        for (var key in y) {
            result[key] = at(x, y[key]);
        }
        return result;
    } else {
        if (!isNaN(y)) {
            y = Math.round(y);
        }
        // Base: y is a scalar
        if (x instanceof Array) {
            if (x[y] === undefined) {
                return [];
            } else {
                return x[y];
            }
        } else {
            //If x is scalar we simply use x instead of x[y]
            return x;
        }
    }
}
function atan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_atan = exe.lib.std.atan;

        var error = a.propagateError(std_atan);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_atan(a.value), {}, "Atan should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_atan(a.value);
            return ans;
        }
    });
}

function atan2(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_atan2 = exe.lib.std.atan2;
        var error = a.propagateError(std_atan2, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_atan2(a.value, b.value), {}, "Atan2 units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_atan2(a.value, b.value);
            return ans;
        }
    });
}function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_bin = exe.lib.std.bin;
        var error = a.propagateError(std_bin, b);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit()) {
            return new UnitObject(std_bin(a.value, b.value), {}, "Bin argument should be dimensionless.");
        } else {
            var ans = a.clone()
            ans.value = std_bin(a.value, b.value);
            return ans;
        }
    });
}/**
 * Placeholder function for the button function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @return {Array}     Empty array
 */
function button() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'button' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [];

}

button.isTimeDependent = true;
function ceil(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_ceil = exe.lib.std.ceil;
        var error = a.propagateError(std_ceil);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_ceil(a.value);
        return ans;
    });
}

/**
 * Placeholder function for the check function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @param  {Boolean} def default value of the checkbox
 * @return {Array}     Singleton array with def
 */
function check(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'check' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (typeof def === 'boolean') {
        return [def];
    } else {
        throw new Error('Argument of check must be true or false');
    }
}

check.isTimeDependent = true;
var MINURLDELAY = 1000;
// every call to a url is protected by a timer to prevent bandwith exhaustion: one URL shall not be called more frequently than
// once every MINURLDELAY millisec. Calls that occur more frequently will simply return the same value as the previous call
// to that URL. A URL, here, is interpreted as the part prior to the question mark. Indeed, a same host can be spammed by a
// high frequent series of calls each time with different parameters. We don't both the same host more often than
// once every MINURLDELY millisec. On the other hand, we ensure that the parameters of every call are different, so that
// browsers cannot cache results ,thereby hiding any changes in server-side state.
var putChanTimers = [];
var getChanTimers = [];
// entries in the array urlTimers are distinguished by the host. That is, all calls to the keyMap-url are scheduled via the same array urlTimers. For this
// reason, there should not be two or more calls to getUrl in one script. In case multiple in- or out channels are needed, we can use the keyMap server, but
// then we need to schedule them based on the key-name. For this reason, we have two extra arrays with timers.

var urlTimers = [];

var E = Math.E;

var PI = Math.PI;
function cos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_cos = exe.lib.std.cos;
        var error = a.propagateError(std_cos);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_cos(a.value), {}, "Cos should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_cos(a.value);
            return ans;
        }
    });
}

function debug(c, v) {
    if (typeof c === "string") {
        if (v instanceof Array) {
            var val = ''
            if (v['return'] != undefined) {
                for (var k in v) {
                    val = val.concat(k).concat(":").concat(JSON.stringify(v[k])).concat(",")
                }
                // TODO, write message to debug windo or something
                //console.log(c + ": " + val.substring(0, val.length - 1));
                return v['return']
            } else {
                throw new Error("\nFor function debug(), the second argument must be a vector, which must contain an element named 'return'");
            }
        } else {
            throw new Error("\nFor function debug(), the second argument must be a vector, the first element of which is returned to the caller");
        }
    } else {
        throw new Error("\nFor function debug(), the first argument must be a string (= text to help identify the debug output)");
    }
}
function divide(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_divide = exe.lib.std.divide;
        var error = a.propagateError(std_divide, b);
        if (error) {
            return error;
        }

        var ans = a.divide(b);
        ans.value = std_divide(a.value, b.value);
        return ans;
    });
}function __do__(code, args) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (typeof code === "string") {
        if (args instanceof Object) {
            for (var arg in args) {
                var target = new RegExp('_' + arg, "g");
                code = code.replace(target, JSON.stringify(args[arg]));
                try {
                    // this is to protect against all disasters like syntax errors in the script string code we can't foresee
                    var res = (new Function(code))();
                    return res;
                } catch (err) {
                    return 'ERROR';
                }
            }
        } else {
            throw new Error("\nFor function do(), second argument must be a vector");
  
        }
    } else {
        throw new Error("\nFor function do(), first argument must be a string (= a code fragment)");
    }
}
function equal(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_eq = exe.lib.std.equal;
        var error = a.propagateError(std_eq, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_eq(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to == must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_eq(a.value, b.value);
            return ans;
        }
    });
}
function exp(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_exp = exe.lib.std.exp;

        var error = a.propagateError(std_exp);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_exp(a.value), {}, "Exp should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_exp(a.value);
            return ans;
        }
    });
}function factorial(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_factorial = exe.lib.std.factorial;
        var error = a.propagateError(std_factorial);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_factorial(a.value), {}, "Factorial should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_factorial(a.value);
            return ans;
        }
    });
}
function floor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_floor = exe.lib.std.floor;
        var error = a.propagateError(std_floor);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_floor(a.value);
        return ans;
    });
}

function getChan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof x) == 'string') {
        var fnd = false;
        for (var i = 0; i < getChanTimers.length; i++) {
            if (getChanTimers[i].chanName == x) {
                // ithis channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - getChanTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return getChanTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from channel ' + x + '; status=' + status.response);
                            getChanTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    getChanTimers[i].time = chanTime;
                    return getChanTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = getChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            getChanTimers[k] = {
                'returnValue': 0,
                'time': chanTime,
                'chanName': x
            };
            var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from channel; status=' + status.response);
                    getChanTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getChan() must be a string");
    }

}
function getTime() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return Date.now();
}

getTime.isTimeDependent = true;
function getUrl(url) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof url) == 'string') {
        var comps = url.split('?');
        // comps[0] is the part of the URL. Check if this occurs in the array 
        var fnd = false;
        for (var i = 0; i < urlTimers.length; i++) {
            if (urlTimers[i].baseName == comps[0]) {
                // it exists. See at what time we called it.
                fnd = true;
                var urlDate = new Date();
                var urlTime = urlDate.getTime();
                if (urlTime - urlTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return urlTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from server; status=' + status.response);
                            urlTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    urlTimers[i].time = urlTime;
                    return urlTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = urlTimers.length;
            var urlDate = new Date();
            var urlTime = urlDate.getTime();
            urlTimers[k] = {
                'returnValue': 0,
                'time': urlTime,
                'baseName': comps[0]
            };
            var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from server; status=' + status.response);
                    urlTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getURL() must be a string");
    }

}
function greaterThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_gt = exe.lib.std.greaterThan;
        var error = a.propagateError(std_gt, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_gt(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to > must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_gt(a.value, b.value);
            return ans;
        }
    });
}
function greaterThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_gte = exe.lib.std.greaterThanEqual;
        var error = a.propagateError(std_gte, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_gte(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to >= must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_gte(a.value, b.value);
            return ans;
        }
    });
}
function iConvolve(x,y,n1,n2,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Convert all to UnitObjects
    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
    y = unaryZip(y, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
    if (!(n1 instanceof UnitObject)) {
        n1 = new UnitObject(n1);
    }
    if (!(n2 instanceof UnitObject)) {
        n2 = new UnitObject(n2);
    }
    if (!(m instanceof UnitObject)) {
        m = new UnitObject(m);
    }

    var std_iConvolve = exe.lib.std.iConvolve;
    var error = UnitObject.prototype.propagateError(std_iConvolve, x, y, n1, n2, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var ans;
    if(!x.isNormal() || !y.isNormal() || !n1.isNormal() || !n2.isNormal() || !m.isNormal()) {
        ans = new UnitObject(std_iConvolve(xValues, yValues, n1.value, n2.value, m.value), {}, "unitError");
        ans.errorString = "All arguments of iConvolve must be unitless; current units are: <"+ x.toString() +">, <"+ y.toString() +">, <" + n1.toString() + ">, <" + n2.toString() + "> and <" + m.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iConvolve(xValues, yValues, n1.value, n2.value, m.value), {}, null);
    }

    return ans;
}
function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(n1 instanceof UnitObject)) {
        n1 = new UnitObject(n1);
    }
    if (!(n2 instanceof UnitObject)) {
        n2 = new UnitObject(n2);
    }
    if (!(s1 instanceof UnitObject)) {
        s1 = new UnitObject(s1);
    }
    if (!(s2 instanceof UnitObject)) {
        s2 = new UnitObject(s2);
    }

    var std_iGaussian = exe.lib.std.iGaussian;
    var error = UnitObject.prototype.propagateError(std_iGaussian, n1, n2, s1, s2);
    if (error) {
        return error;
    }

    var ans;
    if(!n1.isNormal() || !n2.isNormal() || !s1.isNormal() || !s2.isNormal()) {
        ans = new UnitObject(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {}, "unitError");
        ans.errorString = "All arguments of iGaussian must be unitless; current units are: <"+ n1.toString() +">, <"+ n2.toString() +">, <" + s1.toString() + "> and <" + s2.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {}, null);
    }

    return ans;
}
function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    if (!(nrRows instanceof UnitObject)) {
        nrRows = new UnitObject(nrRows);
    }
    if (!(nrCols instanceof UnitObject)) {
        nrCols = new UnitObject(nrCols);
    }

    var std_iMake = exe.lib.std.iMake;
    var error = UnitObject.prototype.propagateError(std_iMake, x, nrRows, nrCols);
    if (error) {
        return error;
    }

    var ans;
    if(!nrRows.isNormal() || !nrCols.isNormal()) {
        ans = new UnitObject(std_iMake(x, nrRows.value, nrCols.value), {}, "unitError");
        ans.errorString = "Arguments 2 and 3 (=dimensions) of iMake must be unitless; current units are: <"+ nrRows.toString() +">  and <"+ nrCols.toString() +">, respectively";
    } else {
        ans = std_iMake(x, nrRows.value, nrCols.value);
    }

    return ans;
}
function iMedian(x,n,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    n = objectToArray(n);
    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var nn = ((2 * n + 1) * (2 * n + 1) - 1) / 2;
                var j = 0;
                var jj = 0;
                var res = [];
                switch (m) {
                    case 0:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    var index1 = i + j;
                                    while (index1 < 0)
                                        index1 += r1;
                                    while (index1 >= r1)
                                        index1 -= r1;
                                    for (jj = -n; jj <= n; jj++) {
                                        var index2 = ii + jj;
                                        while (index2 < 0)
                                            index2 += r2;
                                        while (index2 >= r2)
                                            index2 -= r2;
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    case 1:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    if (i + j >= 0 && i + j < r1) {
                                        for (jj = -n; jj <= n; jj++) {
                                            if (ii + jj >= 0 && ii + jj < r2) {
                                                st.push(x[i + j][ii + jj]);
                                            }
                                        }
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    case 2:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    var index1 = i + j;
                                    index1 = index1 < 0 ? 0 : (index1 >= r1 ? r1 - 1 : index1);
                                    for (jj = -n; jj <= n; jj++) {
                                        var index2 = ii + jj;
                                        index2 = index2 < 0 ? 0 : (index2 >= r2 ? r2 - 1 : index2);
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    default:
                        throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                        break;
                }
            } else {
                throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
            }

        } else {
            return [];
        }
    } else {
        return [];
    }
}
function iSpike(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x1 instanceof UnitObject)) {
        x1 = new UnitObject(x1);
    }
    if (!(x2 instanceof UnitObject)) {
        x2 = new UnitObject(x2);
    }
    if (!(y1 instanceof UnitObject)) {
        y1 = new UnitObject(y1);
    }
    if (!(y2 instanceof UnitObject)) {
        y2 = new UnitObject(y2);
    }

    var std_iSpike = exe.lib.std.iSpike;
    var error = UnitObject.prototype.propagateError(std_iSpike, x1, x2, y1, y2);
    if (error) {
        return error;
    }

    var ans;
    if(!x1.isNormal() || !x2.isNormal() || !y1.isNormal() || !y2.isNormal()) {
        ans = new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, "unitError");
        ans.errorString = "All arguments of iSpike must be unitless; current units are: <"+ x1.toString() +">, <"+ x2.toString() +">, <" + y1.toString() + "> and <" + y2.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, null);
    }

    return ans;
}
function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Convert to UnitObjects
    if (!(condition instanceof UnitObject)) {
        condition = new UnitObject(condition);
    }
    if (!(ifTrue instanceof UnitObject)) {
        ifTrue = new UnitObject(ifTrue);
    }

    if (!(ifFalse instanceof UnitObject)) {
        ifFalse = new UnitObject(ifFalse);
    }

    // Check for errors first
    var std_if = exe.lib.std.__if__;
    var error = ifTrue.propagateError(std_if, ifFalse);
    if (error) {
        return error;
    }

    var ans;
    var ifResult;
    if(!condition.isNormal()) {
        ans = new UnitObject(std_if(condition.value, ifTrue.value, ifFalse.value), {}, "unitError");
        ans.errorString = "First argument to \"if\" function must be unit-less. Current unit is: <" + condition.toString() + ">.";
        return ans;
    } else if ((ifResult = std_if(condition.value, ifTrue.value, ifFalse.value)) === ifTrue.value) {
        // Clone and return the right UnitObject, depending on the return value of the standard library __if__ function
        ans = ifTrue.clone();
    } else {
        ans = ifFalse.clone();
    }

    ans.value = ifResult;
    return ans;
}
function imply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_imply = exe.lib.std.imply;
        var error = a.propagateError(std_imply, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_imply(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"imply\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_imply(a.value, b.value);
            return ans;
        }
    });
}
/**
 * Placeholder function for the input function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @param  {Number|String|Boolean} def Default value of input field
 * @return {Array}     Singleton array with def
 * @memberof Model.Library
 */
function input(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'input' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [def];

}

input.isTimeDependent = true;
function lessThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_lt = exe.lib.std.lessThan;
        var error = a.propagateError(std_lt, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_lt(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to < must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_lt(a.value, b.value);
            return ans;
        }
    });
}
function lessThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_lte = exe.lib.std.lessThanEqual;
        var error = a.propagateError(std_lte, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_lte(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to <= must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_lte(a.value, b.value);
            return ans;
        }
    });
}
function ln(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_ln = exe.lib.std.ln;
        var error = a.propagateError(std_ln);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_ln(a.value), {}, "Ln should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_ln(a.value);
            return ans;
        }
    });
}

function log(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_log = exe.lib.std.log;
        var error = a.propagateError(std_log);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_log(a.value), {}, "Log should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_log(a.value);
            return ans;
        }
    });
}

/*  ======================================= MATRICES =====================================

Description: Javascript routines to handle matrices (2D arrays).
Stored as methods of the global variable Matrix.
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: Peter Coxhead, 2008-2009; released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 July 2009
 */
var version = 'Matrix 1.01';
var errorCallback=null;
/*

Uses IOUtils.js, LUDecomposition.js, QRDecomposition.js, EVDecomposition.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

The useful fields of a Matrix object are:
m    number of rows
n    number of columns
mat  the matrix as an array of m entries, each being arrays of n entries.

Matrix.getEPS(): in any matrix calculation, an absolute value less than Matrix.getEPS()
is replaced by 0. The default value is 2^-40 (~9e-13). Set to a different value if you
want more or less precision.
Matrix.setEPS(newEPS): see above.

Matrix.create(arr): creates a Matrix object to represent the two-dimensional
array arr. The value of arr is copied.
Matrix.create(m,n): creates a Matrix object to represent an m-by-n matrix,
whose values are undefined.

Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity matrix.
Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-m unit matrix.
Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
random values such that 0 <= result[i][j] < 1.

Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
m-by-n.

Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
Matrix object mo.

Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
mo.
Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
function then returns an m-by-m Matrix object with this vector as its diagonal
and all off-diagonal elements set to 0.

Matrix.max(mo): returns the largest entry in the matrix.
Matrix.min(mo): returns the smallest entry in the matrix.

Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
scaled by scalar.

Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and mo2.

Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
each element of the Matrix object mo.  f must be a function of one argument.
Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
to each element of the Matrix object mo1 and the corresponding element of the Matrix
element mo2 (which must be of the same dimension).  f must be a function of two
arguments.

Matrix.trace(mo): returns the trace of the Matrix object mo.
Matrix.det(mo): returns the determinant of the Matrix object mo, which must be square.

Matrix.inverse(mo): returns the inverse of the Matrix object mo.

Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
If A is square, the solution is exact; if A has more rows than columns, the solution
is least squares. (No solution is possible if A has fewer rows than columns.)
Uses LUDecomposition.js and QEDecomposition.js.

Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
fields contain the eigenvectors and eigenvalues. The fields are as follows:
V    the columnwise eigenvectors as a Matrix object
lr   the real parts of the eigenvalues as an array
li   the imaginary parts of the eigenvalues as an array
L    the block diagonal eigenvalue matrix as a Matrix object
isSymmetric   whether the matrix is symmetric or not (boolean).

Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
omitted, the default in IOUtils.js is used.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, EVDecomposition.js and LUDecomposition.js.)

with (Matrix){ var A = create([[1,2,4],[8,2,1],[-2,3,0]]);
println('A');
display(A,0);

var Ainv = inverse(A);
nl(); println('inverse(A)*A');
display(mult(Ainv,A));
nl(); println('inverse(A)*A - I');
display(sub(mult(Ainv,A),identity(A.n,A.m)));

var B = random(3,2);
nl(); println('B');
display(B);
var X = solve(A,B);
nl(); println('X obtained by solving A*X = B');
display(X);
nl(); println('A*X - B');
display(sub(mult(A,X),B));

var es = eigenstructure(A);

nl(); println('V (eigenvectors for A)');
display(es.V);
nl(); println('L (block diagonal eigenvalue matrix for A)');
display(es.L);
nl(); println('A*V - V*L');
display(sub(mult(A,es.V),mult(es.V,es.L)));
nl(); println('A - V*L*inverse(V)');
display(sub(A,mult(es.V,mult(es.L,inverse(es.V)))));
}

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

var Matrix = new createMatrixPackage();

function dealWithError(a){
  if(errorCallback){
    errorCallback("Error occurred in matrix package ("+a+")");
  } else {
    alert("Error occurred in matrix package ("+a+"), but no errorCallback function was installed.");
  }
}
function createMatrixPackage() {
  
  
  
  
  // the provision of an errorCallback function was added by Kees van Overveld
  // (March 2012). This function can be defined externally;
  // it is called whenever an error condition occurs.
  // In case no error callback is installed, the error is communicated via an alert box.


  this.setErrorCallback=function(a){
    errorCallback=a;
  }


	this.version = version;
	
	var abs = Math.abs; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Any number whose absolute value is < EPS is taken to be 0.
	// Matrix.getEPS(): returns the current value of EPS.
	// Matrix.setEPS(): changes the current value of EPS.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var EPS = Math.pow(2, -40);
	this.getEPS = function () {
		return EPS;
	}
	this.setEPS = function (newEPS) {
		EPS = newEPS;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkNum is a private function used in replacing small values by 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkNum(x) {
		return (abs(x) < EPS) ? 0 : x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkMatrix is a private function which checks that argument i of
	//   the function whose name is fname and whose value is arg is a
	//   Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, i, arg) {
		if (!arg.isMatrix) {
      dealWithError('***ERROR: Argument ' + i + ' of Matrix.' + fname +
			' is not a Matrix; its value is "' + arg + '".');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.create(arr): creates a Matrix object to represent the two-dimensional
	//   array arr. The contents of arr are copied.
	// Matrix.create(m,n): creates a Matrix object to represent an m x n matrix,
	//   whose values are undefined.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (a1, a2) { // check args
		var isMatArg1 = a1 instanceof Array;
		if (!isMatArg1 && (typeof a1 != 'number')) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is not an array or a number.');
		}
		if (isMatArg1 && a2 != null) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is an array but argument 2 is also present.');
		}
		if (isMatArg1)
			return _createMatrixfromArray(a1);
		else
			return _createMatrixfromDimensions(a1, a2);
	}
	function _createMatrixfromArray(arr) {
		var m = arr.length;
		for (var i = 0; i < m; i++) {
			if (!(arr[i]instanceof Array)) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 is not a 2D array.');
			}
			if (arr[i].length != arr[0].length) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 has different length rows.');
			}
		}
		var n = arr[0].length;
		var res = new Array(m);
		for (var i = 0; i < m; i++) {
			res[i] = new Array(n);
			for (var j = 0; j < n; j++)
				res[i][j] = _chkNum(arr[i][j]);
		}
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = res;
		x.isMatrix = true;
		return x;
	}
	function _createMatrixfromDimensions(m, n) {
		var arr = new Array(m);
		for (var i = 0; i < m; i++)
			arr[i] = new Array(n);
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = arr;
		x.isMatrix = true;
		return x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity
	//   matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.identity = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = 0;
			for (var i = 0; i < Math.min(m, n); i++)
				mat[i][i] = 1;
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-n unit matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.unit = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = 1;
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
	//   random values such that 0 <= result[i][j] < 1.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.random = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(Math.random());
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
	//   of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
	//   m by n.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.copy = function (mo, fromRow, fromCol, m, n) {
		_chkMatrix('copy', 1, mo);
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = mo.mat[i + fromRow][j + fromCol];
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
	//   Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.transpose = function (mo) {
		_chkMatrix('transpose', 1, mo);
		var res = _createMatrixfromDimensions(mo.n, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = mo.mat[j][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
	//   an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
	//   mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diagOf = function (mo) {
		_chkMatrix('diagOf', 1, mo);
		var res = _createMatrixfromDimensions(Math.min(mo.m, mo.n), 1);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][0] = mo.mat[i][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
	//   function then returns an m-by-m Matrix object with this vector as its diagonal
	//   and all off-diagonal elements set to 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diag = function (mo) {
		_chkMatrix('diag', 1, mo);
		if (mo.n != 1) {
      dealWithError( '***ERROR: in Matrix.diag: argument 1 is not a column vector.');
		}
		var res = Matrix.identity(mo.m, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][i] = mo.mat[i][0];
		}
		return res;
	}
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.max(mo): returns the largest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.max = function (mo) {
		_chkMatrix('max', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] > res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.min(mo): returns the smallest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.min = function (mo) {
		_chkMatrix('min', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] < res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
	//   scaled by scalar.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.scale = function (mo, scalar) {
		_chkMatrix('scale', 1, mo);
		var res = _createMatrixfromArray(mo.mat);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = _chkNum(scalar * mat[i][j]);
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.add = function (mo1, mo2) {
		_chkMatrix('add', 1, mo1);
		_chkMatrix('add', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.add: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] + mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.sub = function (mo1, mo2) {
		_chkMatrix('sub', 1, mo1);
		_chkMatrix('sub', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      delaWithError( '***ERROR: in Matrix.sub: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] - mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and
	//   mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.mult = function (mo1, mo2) {
		_chkMatrix('mult', 1, mo1);
		_chkMatrix('mult', 2, mo2);
		if (mo1.n != mo2.m) {
      dealWithError( '***ERROR: in Matrix.mult: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo2.n);
		var temp;
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++) {
				temp = 0;
				for (var k = 0; k < mo1.n; k++)
					temp += mo1.mat[i][k] * mo2.mat[k][j];
				mat[i][j] = _chkNum(temp);
			}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
	//   each element of the Matrix object mo.  f must be a function of one argument.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.map = function (f, mo) {
		_chkMatrix('map', 2, mo);
		var res = _createMatrixfromDimensions(mo.m, mo.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
	//   to each element of the Matrix object mo1 and the corresponding element of the Matrix
	//   element mo2 (which must be of the same dimension).  f must be a function of two
	//   arguments.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.combine = function (f, mo1, mo2) {
		_chkMatrix('combine', 1, mo1);
		_chkMatrix('combine', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.combine: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo1.mat[i][j], mo2.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.trace(mo): returns the trace of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.trace = function (mo) {
		_chkMatrix('trace', 1, mo);
		var t = 0;
		with (mo)
		for (var i = 0; i < Math.min(m, n); i++)
			t += mat[i][i];
		return _chkNum(t);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.det(mo): returns the determinant of the Matrix object mo, which be square.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.det = function (mo) {
		_chkMatrix('det', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.det: argument is not square.');
		}
		with (LUDecomposition)
		return _chkNum(det(create(mo)));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.inverse(mo): returns the inverse of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.inverse = function (mo) {
		_chkMatrix('inverse', 1, mo);
		return Matrix.solve(mo, Matrix.identity(mo.m, mo.m));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
	//   If A is square, the solution is exact; if A has more rows than columns, the solution
	//   is least squares. (No solution is possible if A has fewer rows than columns.)
	//   Uses LUDecomposition.js and QRDecomposition.js.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (A, B) {
		_chkMatrix('solve', 1, A);
		_chkMatrix('solve', 2, B);
		if (A.m == A.n)
			with (LUDecomposition)return solve(create(A), B);
		else if (A.m > A.n)
			with (QRDecomposition) {
				var temp = create(A);
				return solve(temp, B);
			}
		else
      dealWithError( '***ERROR: in Matrix.solve: argument 1 has fewer rows than columns.');
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
	//    fields contain the eigenvectors and eigenvalues. The fields are as follows:
	//    V    the columnwise eigenvectors as a Matrix object
	//    lr   the real parts of the eigenvalues as an array
	//    li   the imaginary parts of the eigenvalues as an array
	//    L    the block diagonal eigenvalue matrix as a Matrix object
	//    isSymmetric   whether the matrix is symmetric or not (boolean).
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.eigenstructure = function (mo) {
		_chkMatrix('eigenstructure', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.eigenstructure: argument is not a square matrix.');
		}
		return EVDecomposition.create(mo);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
	//  omitted, the default in IOUtils.js is used.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.display = function (mo, dp) {
		_chkMatrix('display', 1, mo);
		if (dp == null)
			dp = 3;
		displayMat(mo.mat, null, null, dp);
	}
	
}
function max(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_max = exe.lib.std.max;
        var error = a.propagateError(std_max, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_max(a.value, b.value), {}, "Max units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_max(a.value, b.value);
            return ans;
        }
    });
}function min(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_min = exe.lib.std.min;
        var error = a.propagateError(std_min, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_min(a.value, b.value), {}, "Min units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_min(a.value, b.value);
            return ans;
        }
    });
}function modulo(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_modulo = exe.lib.std.modulo;
        var error = a.propagateError(std_modulo, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_modulo(a.value, b.value), {}, "Modulo units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_modulo(a.value, b.value);
            return ans;
        }
    });
}function multiply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_multiply = exe.lib.std.multiply;
        var error = a.propagateError(std_multiply, b);
        if (error) {
            return error;
        }

        var ans = a.multiply(b);
        ans.value = std_multiply(a.value, b.value);
        return ans;
    });
}

multiply.base = 1;
function not(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x], function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_not = exe.lib.std.not;
        var error = a.propagateError(std_not);
        if (error) {
            return error;
        }

        var ans;
        if(!a.isNormal()) {
            ans = new UnitObject(std_not(a.value), {}, "unitError");
            ans.errorString = "The argument to the \"not\" function must be unit-less. Current unit is: <" + a.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_not(a.value);
            return ans;
        }
    });
}
function notEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_neq = exe.lib.std.notEqual;
        var error = a.propagateError(std_neq, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_neq(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to != must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_neq(a.value, b.value);
            return ans;
        }
    });
}
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

            if (!nonRecursive && !(obj[key] instanceof Array) && !(obj[key] instanceof UnitObject) && obj[key] instanceof Object) {
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
function or(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_or = exe.lib.std.or;
        var error = a.propagateError(std_or, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_or(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"or\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_or(a.value, b.value);
            return ans;
        }
    });
}

or.base = false;
function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y, z], function(a, b, c) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        if (!(c instanceof UnitObject)) {
            c = new UnitObject(c);
        }

        var std_poisson = exe.lib.std.poisson;
        var error = a.propagateError(std_poisson, [b, c]);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit() || c.hasUnit()) {
            return new UnitObject(std_poisson(a.value, b.value, c.value), {}, "Poisson arguments should be dimensionless.");
        } else {
            var ans = a.clone()
            ans.value = std_poisson(a.value, b.value, c.value);
            return ans;
        }
    });
}function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_pow = exe.lib.std.pow;
        var error = a.propagateError(std_pow, b);
        if (error) {
            return error;
        }

        var ans = a.power(b);
        ans.value = std_pow(a.value, b.value);
        return ans;
    });

}
function putChan(myChannelName,myValue) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof myChannelName) == 'string') {
        var value = arrayToObject(myValue);
        var fnd = false;
        for (var i = 0; i < putChanTimers.length; i++) {
            if (putChanTimers[i].chanName == myChannelName) {
                // this channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - putChanTimers[i].time < MINURLDELAY) {
                    return myValue;
                } else {
                    // we can call the server again.
                    var encodedData = JSON.stringify(value);
                    var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl
                    });
                    putChanTimers[i].time = chanTime;
                    return myValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = putChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            putChanTimers[k] = {
                'returnValue': value,
                'time': chanTime,
                'chanName': myChannelName
            };
            var encodedData = JSON.stringify(value);
            var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl
            });
            return myValue;
        }
    } else {
        throw new Error("\nfirst argument of putChan() must be a string");
    }
}
function ramp(x, x1, y1, x2, y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var rmp = 0;
    if (x1 != x2) {
        if (x < x1) {
            rmp = y1;
        } else {
            if (x > x2) {
                rmp = y2;
            } else {
                rmp = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
            }
        }
    } else {
        rmp = ((x2 + y2)) / 2.0;
    }
    return rmp;

}
function random() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
	return new UnitObject(Math.random());
}

random.isTimeDependent = true;
function round(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_round = exe.lib.std.round;
        var error = a.propagateError(std_round);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_round(a.value);
        return ans;
    });
}

function sin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_sin = exe.lib.std.sin;
        var error = a.propagateError(std_sin);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_sin(a.value), {}, "Sin should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_sin(a.value);
            return ans;
        }
    });
}

/**
 * Placeholder function for the slider function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @pre min <= def <= max
 * @param  {Number} def Deafault value of the slider
 * @param  {Number} min Lower bound
 * @param  {Number} max Upper Bound
 * @return {Array}     Array with def,min,max
 */
function slider(def, min, max) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'Slider' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (isNaN(parseFloat(def)) || isNaN(parseFloat(min)) || isNaN(parseFloat(max))) {
        throw new Error('Arguments of slider must be numeric constants.');
    }

    if (min <= def && def <= max) {
        return [def, min, max];
    } else {
        throw new Error('For the slider, the default value must be between the lower and upper bound.' +
            ' Also the upper bound must be greater than the lower bound' +
            ' (Default = ' + def + ', lower = ' + min + ', upper = ' + max + ')');
    }
}

slider.isTimeDependent = true;
function subtract(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_subtract = exe.lib.std.subtract;
        var error = a.propagateError(std_subtract, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(a.value - b.value, {}, "unitError");
            ans.errorString = "Subtract mismatch";
            return ans;
        } else {
            ans = a.clone();
            ans.value = std_subtract(a.value, b.value);
            return ans;
        }
    });
}
function sum() {
    return zip(arguments, function() {
        var _sum = 0;
        for (var i = arguments.length - 1; i >= 0; i--) {
            _sum += arguments[i];
        }
        return _sum;
    });
}
function tan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }
        
        var std_tan = exe.lib.std.tan;
        var error = a.propagateError(std_tan);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_tan(a.value), {}, "Tan should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_tan(a.value);
            return ans;
        }
    });
}

function uniminus(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_uniminus = exe.lib.std.uniminus;
        var error = a.propagateError(std_uniminus);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_uniminus(a.value);
        return ans;
    });
}

//This function was taken from keesvanoverveld.com
function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                var iLow = Math.min(x.length, Math.max(0, z));
                var r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                for (i = 0; i < y.length; i++) {
                    r[i + iLow] = y[i];
                }
                for (i = iLow; i < x.length; i++) {
                    r[i + y.length] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        } else {
            // we interpret the scala element to be inserted as if it is a vector with length 1
            if (!(z instanceof Array)) {
                var iLow = Math.min(x.length, Math.max(0, z));
                var r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                r[iLow] = y;
                for (i = iLow; i < x.length; i++) {
                    r[i + 1] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        }
    } else {
        throw new Error("vAggregate: first argument must be a vector");
    }
}
function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var result = [];
        for (var key in x) {
            result[key] = x[key];
        }
        result[x.length] = y;
        return result;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var p = [];
    if (!(x instanceof Array)) {
        p.push(x);
    } else {
        for (k in x) {
            p.push(x[k]);
        }
    }
    if (!(y instanceof Array)) {
        p.push(y);
    } else {
        for (k in y) {
            p.push(y[k]);
        }
    }
    return p;
}

vConcat.base = [];
 //This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var r = x.length;
        if (y instanceof Array) {
            var p = y.length;
            if (!(n instanceof Array)) {
                var n = Math.round(n);
                var res = [];
                switch (m) {
                    case 0:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                while (index < 0)
                                    index += r;
                                while (index >= r)
                                    index -= r;
                                rr += x[index] * y[j];
                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    case 1:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                if (index >= 0 && index < r) {
                                    rr += x[index] * y[j];
                                }
                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    case 2:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                index = index < 0 ? 0 : (index >= r ? r - 1 : index);
                                rr += x[index] * y[j];

                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    default:
                        throw new Error("convolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("convolution: auto-mapping is not supported, third argument must be scalar.");

            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Just get the values, not the units.
    x = unaryZip(x, function(a) {
        if (a instanceof UnitObject) {
            return a.value;
        } else {
            return a;
        }
    });

    var domain = exe.lib.std.vDom(x);

    // Transform the result back into UnitObjects with no unit.
    return unaryZip(domain, function(a) {
        return new UnitObject(a);
    });
}
//This function was taken from keesvanoverveld.com
function vDot(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        if (y instanceof Array) {
            var a = 0;
            for (i in x) {
                if (y[i] != undefined) {
                    if (!(x[i] instanceof Array) && !(y[i] instanceof Array)) {
                        a += (x[i] * y[i]);
                    }
                }
            }
            return a;
        } else {
            var a = 0;
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    a += y * x[i];
                }
            }
            return a;
        }
    } else {
        if (!(y instanceof Array)) {
            return x * y;
        } else {
            var a = 0;
            for (i in y) {
                if (!(y[i] instanceof Array)) {
                    a += x * y[i];
                }
            }
            return a;
        }
    }
}
function vEigenSystem(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aEig = Matrix.eigenstructure(aA);
            // aEig.lr=the vector of real parts of the eigenvalues
            // aEig.li=the vector of imaginary parts of eigenvalues
            // eEig.V=matrix of eigenvectors
            var ttt = [];
            // first lr
            ttt[0] = [];
            for (i = 0; i < aEig.lr.length; i++) {
                ttt[0][i] = aEig.lr[i];
            }
            // next li
            ttt[1] = [];
            for (i = 0; i < aEig.li.length; i++) {
                ttt[1][i] = aEig.li[i];
            }
            // next V
            ttt[2] = [];
            for (i = 0; i < aEig.V.mat.length; i++) {
                var vvv = [];
                ttt[2][i] = [];
                for (var j = 0; j < aEig.V.mat[i].length; j++) {
                    vvv[j] = aEig.V.mat[i][j];
                }
                ttt[2][i] = vvv;
            }
            return ttt;
        } else {
            throw new Error("\nvEigenSystem: cannot calculate eigensystem for non-square matrix");
        }
    } else {
        return
        // if x is a scalar, the real part of the eigenvalue is equal to that scalar;
        // the iumaginary part is 0, and the eigenvector is the vector [1]
        [x, 0, [1]];
    }
}
function vExtend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array)) {
        if (y instanceof Array) {
            var p = [];
            p.push(x);
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
            return p;
        } else {
            return [x, y];
        }
    } else {
        var p = [];
        for (k in x) {
            p[k] = x[k];
        }
        if (y instanceof Array) {
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
        } else {
            p.push(y);
        }
        return p;
    }
}

vExtend.base = []
//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var n = Math.round(x);
        var s = y;
        if (n >= 0) {
            var t = [];
            var sum = 0;
            var x = -(n - 1) / 2;
            var denom = 2 * s * s;
            for (i = 0; i < n; i++) {
                t[i] = Math.exp(-x * x / denom);
                sum += t[i];
                x += 1;
            }
            for (i = 0; i < n; i++) {
                t[i] /= sum;
            }
            return t;
        } else {
            throw new Error("vGaussian: cannot make a vector with <0 elements");
        }
    } else {
        throw new Error("vGaussian: both arguments must be scalar.");
    }
}
function vLen(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array)) {
        return 0;
    }
    return x.length;
}
function vMake(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    if (!(y instanceof UnitObject)) {
        y = new UnitObject(y);
    }

    var std_vMake = exe.lib.std.vMake;
    return std_vMake(x, y.value);
}
function vMatInverse(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aInv = Matrix.inverse(aA);
            for (i = 0; i < aInv.mat.length; i++) {
                var tt = [];
                for (j = 0; j < aInv.mat[i].length; j++) {
                    tt[j] = aInv.mat[i][j];
                }
                t[i] = tt;
            }
            return t;
        } else {
            throw new Error("\nvMatInverse: cannot take inverse of non-square matrix");
        }
    } else {
        return 1 / x;
    }
}
//This function was taken from keesvanoverveld.com
function vMatMatMul(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var trueMatrix0 = false;
        for (i in x) {
            if (x[i] instanceof Array) {
                trueMatrix0 = true;
            }
        }
        if (trueMatrix0) {
            if (y instanceof Array) {
                var trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    var m = [];
                    for (i in x) {
                        var r = [];
                        for (j in y) {
                            if (y[j] instanceof Array) {
                                for (k in y[j]) {
                                    if (x[i][j] != undefined) {
                                        if (y[j][k] != undefined) {
                                            if (!(x[i][j] instanceof Array) && !(y[j][k] instanceof Array)) {
                                                var t = x[i][j] * y[j][k];
                                                if (r[k]) {
                                                    r[k] += t;
                                                } else {
                                                    r[k] = t;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        m[i] = r;
                    }
                    return m;
                } else {
                    // y is not a matrix but a vector; x is a true matrix. So this is a matrix-vector product or a matrix-scalar product.
                    var r = [];
                    for (i in x) {
                        var a = 0;
                        if (x[i] instanceof Array) {
                            for (j in x[i]) {
                                if (y[j] != undefined) {
                                    if (!(x[i][j] instanceof Array) && !(y[j] instanceof Array)) {
                                        a += x[i][j] * y[j];
                                    }
                                }
                            }
                            r[i] = a;
                        }
                    }
                    return r;
                }
            } else {
                // x is a matrix and y is a scalar. Return the matrix, multiplied by the scalar (this would
                // also be achieved by auto mapping the multiplication)
                var m = [];
                for (var i in x) {
                    var r = [];
                    if (x[i] instanceof Array) {
                        for (j in x[i]) {
                            if (!(x[i][j] instanceof Array)) {
                                r[j] = x[i][j] * y;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            }
        } else {
            // the argument x is a vector of scalars, not a true matrix. Perhaps y is a matrix.
            if (y instanceof Array) {
                var trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    // yes, so we do a matrix-vector product
                    var r = [];
                    for (i in x) {
                        if (y[i] != undefined) {
                            if (y[i] instanceof Array) {
                                for (j in y[i]) {
                                    if (!(y[i][j] instanceof Array)) {
                                        if (r[j] != undefined) {
                                            r[j] += x[i] * y[i][j];
                                        } else {
                                            r[j] = x[i] * y[i][j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return r;
                } else {
                    // y is not a matrix but a vector; x is also a vector. So we calculate the dot product -
                    // treating the vector y as a column rather than as the row that it actually is..
                    var a = 0;
                    for (i in x) {
                        if (y[i] != undefined) {
                            if (!(y[i] instanceof Array)) {
                                a += x[i] * y[i];
                            }
                        }
                    }
                    // what should we do - return this as a number or as a 1x1 matrix? Choose to return it as a number.
                    return a;
                }
            } else {
                // so x is a vector and y is a scalar.
                var r = [];
                for (i in x) {
                    if (!(x[i] instanceof Array)) {
                        r[i] = x[i] * y;
                    }
                }
                return r;
            }
        }
    } else {
        // x is a scalar. Perhaps y is a matrix.
        if (y instanceof Array) {
            var trueMatrix1 = false;
            for (i in y) {
                if (y[i] instanceof Array)
                    trueMatrix1 = true;
            }
            if (trueMatrix1) {
                // so x is a scalar and y is a matrix.
                var m = [];
                for (i in y) {
                    var r = [];
                    if (y[i] instanceof Array) {
                        for (j in y[i]) {
                            if (!(y[i][j] instanceof Array)) {
                                r[j] = y[i][j] * x;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            } else {
                // x is a scalar and y is a vector.
                var r = [];
                for (i in y) {
                    if (!(y[i] instanceof Array)) {
                        r[i] = y[i] * x;
                    }
                }
                return r;
            }
        } else {
            // x is a scalar and y is a scalar: just return their product
            return x * y;
        }
    }
}
function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var isOK = true;
    if (mm instanceof Array) {
        var t = [];
        var u = [];
        // n is number of rows; m is number of columns of the matrix (=mm)
        var n = mm.length;
        if (mm[0] instanceof Array) {
            var m = mm[0].length;
            if (v instanceof Array) {
                if (m <= n && v.length == n) {
                    for (i = 0; i < n; i++) {
                        t[i] = [];
                        if (mm[i] instanceof Array) {
                            if (mm[i].length == m) {
                                for (j = 0; j < m; j++) {
                                    if (!(mm[i][j] instanceof Array)) {
                                        t[i][j] = mm[i][j];
                                    } else {
                                        throw new Error("\nvMatSolve: every matrix element must be scalar");
                                    }
                                }
                            } else {
                                throw new Error("\nvMatSolve: every row in left hand side must be of equal length");
                            }
                        } else {
                            throw new Error("\nvMatSolve: every row in left hand side must be a vector");
                        }
                    }
                    // next assemble the right hand vector
                    for (i = 0; i < n; i++) {
                        if (!(v[i] instanceof Array)) {
                            u[i] = [];
                            u[i][0] = v[i];
                        } else {
                            throw new Error("\nvMatSolve: non-scalar element found in right-hand side");
                        }
                    }
                } else {
                    throw new Error("\nvMatSolve: nr. rows of right hand side must be equal to nr. columns of left hand side, and the number of rows of the matrix must not be smaller than the number of columns");
                }
            } else {
                throw new Error("\nvMatSolve: right hand side must be vector");
            }
        } else {
            throw new Error("\nvMatSolve: left hand side must be vector of vectors");
        }
    } else {
        throw new Error("\nvMatSolve: first argument must be vector");
    }
    if (isOK) {
        var aA = Matrix.create(t);
        var aB = Matrix.create(u);
        var aSol = Matrix.solve(aA, aB);
        var tt = [];
        for (i = 0; i < aSol.mat.length; i++) {
            tt[i] = aSol.mat[i][0];
        }
        return tt
    }
}
//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += Math.abs(x[i]);
            }
        }
        return a;
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormEuclid(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return Math.sqrt(a);
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        // we support also strings that are to be concatenated.
        // Hence the initialisation cannot simply be var a=0; we must leave the type of a open until after
        // the first assignment;
        var a;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                if (a != undefined) {
                    a += x[i];
                } else {
                    a = x[i];
                }
            }
        }
        return a;
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormSq(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return a;
    } else {
        return x * x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormalize(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var a = 0;
    if (x instanceof Array) {
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        var nn = Math.sqrt(a);
        var rr = [];
        if (nn > 0) {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = x[i] / nn;
                } else {
                    rr[i] = x[i];
                }
            }
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = 0;
                } else {
                    rr[i] = x[i];
                }
            }
        }
        return rr;
    } else {
        return 1;
    }
}
function vRange(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var range = exe.lib.std.vRange(x);

    // Transform any scalar value into a UnitObject.
    return unaryZip(range, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
}
//This function was taken from keesvanoverveld.com
function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        if (!(y instanceof Array)) {
            if (!(z instanceof Array)) {
                var iLow = Math.max(0, y);
                var iHi = Math.min(x.length, z);
                var r = [];
                for (i = iLow; i < iHi; i++) {
                    r[i - iLow] = x[i];
                }
                i = iHi - iLow;
                while (i < z - y) {
                    r[i] = 0;
                    i++;
                }
                return r;
            } else {
                throw new Error("vSegment: third argument must be a scalar.");
            }
        } else {
            throw new Error("vSegment: second argument must be a scalar.");
        }
    } else {
        throw new Error("vSegment: first argument must be a vector.");
    }
}
//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var p = [];
        for (k = x; k < y; k++) {
            p.push(k);
        }
        return p;
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function vSequence(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return vSeq(x, y);
}
//This function was taken from keesvanoverveld.com
function vSpike(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var r = Math.round(y);
    var p = Math.round(x);
    var rr = [];
    for (i = 0; i < r; i++) {
        if (i == p) {
            rr[i] = 1;
        } else {
            rr[i] = 0;
        }
    }
    return rr;
}
//This function was taken from keesvanoverveld.com
function vTranspose(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var trueMatrix = false;
        for (i in x) {
            if (x[i] instanceof Array)
                trueMatrix = true;
        }
        if (trueMatrix) {
            var r = [];
            for (i in x) {
                if (x[i] instanceof Array) {
                    for (j in x[i]) {
                        if (r[j] == undefined) {
                            r[j] = [];
                        }
                        r[j][i] = x[i][j];
                    }
                } else {
                    if (r[j] == undefined) {
                        r[j] = [];
                    }
                    r[j][0] = x[i];
                }
            }
            return r;
        } else {
            // x is a vector, but not a matrix. Tow options:
            // consider the argument as [[1,2,3]] and return [[1],[2],[3]] - or consider it just as a list [1,2,3]  and merely return [1,2,3]. We prefer the latter.
            return x;
        }
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vVecRamp(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    // arguments: x is a vector of abcissae
    // y is a vector of ordinates
    // z is an abcissa-value
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                // simply ignore elements at the tail in case on of the two vectors is too long
                var len = Math.min(x.length, y.length);
                // it may be necessary to sort the keys - hopefully not, but it takes
                // little time at least to check
                var sorted = false;
                var scalarOK = true;
                while (!sorted && scalarOK) {
                    sorted = true;
                    for (i = 0; i < len - 1; i++) {
                        if (!(x[i] instanceof Array)) {
                            if (!(x[i + 1] instanceof Array)) {
                                if (x[i] > x[i + 1]) {
                                    var swap = x[i];
                                    x[i] = x[i + 1];
                                    x[i + 1] = swap;
                                    // don't forget to swap the ordinate values as well!
                                    swap = y[i];
                                    y[i] = y[i + 1];
                                    y[i + 1] = swap;
                                    sorted = false;
                                }
                            } else
                                scalarOK = false;
                        } else
                            scalarOK = false;
                    }
                }
                if (scalarOK) {
                    //first do a binary search - assume that the keys are sorted!
                    //We have to find the index i such that the probe is enclosed between heap(i) and heap(i+1).
                    var lo = 0;
                    var hi = len;
                    var mi = len / 2;
                    if (z <= x[0]) {
                        return y[0];
                    }
                    if (z >= x[len - 1]) {
                        return y[len - 1];
                    }
                    var nrtrials = 0;
                    while (hi > lo + 1 && nrtrials < 20) {
                        mi = Math.round((hi + lo) / 2)
                        if (z >= x[mi])
                            lo = mi;
                        if (z <= x[mi])
                            hi = mi;
                        nrtrials++;
                    }
                    if (nrtrials < 20) {
                        if (x[lo + 1] > x[lo]) {
                            return y[lo] + (z - x[lo]) * (y[lo + 1] - y[lo]) / (x[lo + 1] - x[lo]);
                        } else {
                            return 0.5 * (y[lo] + y[lo + 1]);
                        }
                    } else {
                        throw new Error("vVecRamp: could not find enclosing interval for abcissa.");
                    }
                } else {
                    throw new Error("vVecRamp: not all the abcissae values are scalar.");
                }
            } else {
                throw new Error("vVecRamp: third argument of vVecRamp must be scalar (abcissa-value).");
            }
        } else {
            throw new Error("vVecRamp: second argument of vVecRamp must be vector (of ordinates).");
        }
    } else {
        throw new Error("vVecRamp: first argument of vVecRamp must be vector (of abcissae).");
    }
}
function getChan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof x) == 'string') {
        var fnd = false;
        for (var i = 0; i < getChanTimers.length; i++) {
            if (getChanTimers[i].chanName == x) {
                // ithis channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - getChanTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return getChanTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from channel ' + x + '; status=' + status.response);
                            getChanTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    getChanTimers[i].time = chanTime;
                    return getChanTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = getChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            getChanTimers[k] = {
                'returnValue': 0,
                'time': chanTime,
                'chanName': x
            };
            var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from channel; status=' + status.response);
                    getChanTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getChan() must be a string");
    }

}
function getTime() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return Date.now();
}

getTime.isTimeDependent = true;
function getUrl(url) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof url) == 'string') {
        var comps = url.split('?');
        // comps[0] is the part of the URL. Check if this occurs in the array 
        var fnd = false;
        for (var i = 0; i < urlTimers.length; i++) {
            if (urlTimers[i].baseName == comps[0]) {
                // it exists. See at what time we called it.
                fnd = true;
                var urlDate = new Date();
                var urlTime = urlDate.getTime();
                if (urlTime - urlTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return urlTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from server; status=' + status.response);
                            urlTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    urlTimers[i].time = urlTime;
                    return urlTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = urlTimers.length;
            var urlDate = new Date();
            var urlTime = urlDate.getTime();
            urlTimers[k] = {
                'returnValue': 0,
                'time': urlTime,
                'baseName': comps[0]
            };
            var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from server; status=' + status.response);
                    urlTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getURL() must be a string");
    }

}
function greaterThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_gt = exe.lib.std.greaterThan;
        var error = a.propagateError(std_gt, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_gt(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to > must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_gt(a.value, b.value);
            return ans;
        }
    });
}
function greaterThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_gte = exe.lib.std.greaterThanEqual;
        var error = a.propagateError(std_gte, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_gte(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to >= must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_gte(a.value, b.value);
            return ans;
        }
    });
}
function iConvolve(x,y,n1,n2,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Convert all to UnitObjects
    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
    y = unaryZip(y, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
    if (!(n1 instanceof UnitObject)) {
        n1 = new UnitObject(n1);
    }
    if (!(n2 instanceof UnitObject)) {
        n2 = new UnitObject(n2);
    }
    if (!(m instanceof UnitObject)) {
        m = new UnitObject(m);
    }

    var std_iConvolve = exe.lib.std.iConvolve;
    var error = UnitObject.prototype.propagateError(std_iConvolve, x, y, n1, n2, m);
    if (error) {
        return error;
    }

    var xValues = UnitObject.prototype.toArray(x);
    var yValues = UnitObject.prototype.toArray(y);
    var ans;
    if(!x.isNormal() || !y.isNormal() || !n1.isNormal() || !n2.isNormal() || !m.isNormal()) {
        ans = new UnitObject(std_iConvolve(xValues, yValues, n1.value, n2.value, m.value), {}, "unitError");
        ans.errorString = "All arguments of iConvolve must be unitless; current units are: <"+ x.toString() +">, <"+ y.toString() +">, <" + n1.toString() + ">, <" + n2.toString() + "> and <" + m.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iConvolve(xValues, yValues, n1.value, n2.value, m.value), {}, null);
    }

    return ans;
}
function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(n1 instanceof UnitObject)) {
        n1 = new UnitObject(n1);
    }
    if (!(n2 instanceof UnitObject)) {
        n2 = new UnitObject(n2);
    }
    if (!(s1 instanceof UnitObject)) {
        s1 = new UnitObject(s1);
    }
    if (!(s2 instanceof UnitObject)) {
        s2 = new UnitObject(s2);
    }

    var std_iGaussian = exe.lib.std.iGaussian;
    var error = UnitObject.prototype.propagateError(std_iGaussian, n1, n2, s1, s2);
    if (error) {
        return error;
    }

    var ans;
    if(!n1.isNormal() || !n2.isNormal() || !s1.isNormal() || !s2.isNormal()) {
        ans = new UnitObject(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {}, "unitError");
        ans.errorString = "All arguments of iGaussian must be unitless; current units are: <"+ n1.toString() +">, <"+ n2.toString() +">, <" + s1.toString() + "> and <" + s2.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iGaussian(n1.value, n2.value, s1.value, s2.value), {}, null);
    }

    return ans;
}
function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    if (!(nrRows instanceof UnitObject)) {
        nrRows = new UnitObject(nrRows);
    }
    if (!(nrCols instanceof UnitObject)) {
        nrCols = new UnitObject(nrCols);
    }

    var std_iMake = exe.lib.std.iMake;
    var error = UnitObject.prototype.propagateError(std_iMake, x, nrRows, nrCols);
    if (error) {
        return error;
    }

    var ans;
    if(!nrRows.isNormal() || !nrCols.isNormal()) {
        ans = new UnitObject(std_iMake(x, nrRows.value, nrCols.value), {}, "unitError");
        ans.errorString = "Arguments 2 and 3 (=dimensions) of iMake must be unitless; current units are: <"+ nrRows.toString() +">  and <"+ nrCols.toString() +">, respectively";
    } else {
        ans = std_iMake(x, nrRows.value, nrCols.value);
    }

    return ans;
}
function iMedian(x,n,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
    n = objectToArray(n);
    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var nn = ((2 * n + 1) * (2 * n + 1) - 1) / 2;
                var j = 0;
                var jj = 0;
                var res = [];
                switch (m) {
                    case 0:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    var index1 = i + j;
                                    while (index1 < 0)
                                        index1 += r1;
                                    while (index1 >= r1)
                                        index1 -= r1;
                                    for (jj = -n; jj <= n; jj++) {
                                        var index2 = ii + jj;
                                        while (index2 < 0)
                                            index2 += r2;
                                        while (index2 >= r2)
                                            index2 -= r2;
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    case 1:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    if (i + j >= 0 && i + j < r1) {
                                        for (jj = -n; jj <= n; jj++) {
                                            if (ii + jj >= 0 && ii + jj < r2) {
                                                st.push(x[i + j][ii + jj]);
                                            }
                                        }
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    case 2:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                var st = [];
                                for (j = -n; j <= n; j++) {
                                    var index1 = i + j;
                                    index1 = index1 < 0 ? 0 : (index1 >= r1 ? r1 - 1 : index1);
                                    for (jj = -n; jj <= n; jj++) {
                                        var index2 = ii + jj;
                                        index2 = index2 < 0 ? 0 : (index2 >= r2 ? r2 - 1 : index2);
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                var ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                        break;
                    default:
                        throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                        break;
                }
            } else {
                throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
            }

        } else {
            return [];
        }
    } else {
        return [];
    }
}
function iSpike(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x1 instanceof UnitObject)) {
        x1 = new UnitObject(x1);
    }
    if (!(x2 instanceof UnitObject)) {
        x2 = new UnitObject(x2);
    }
    if (!(y1 instanceof UnitObject)) {
        y1 = new UnitObject(y1);
    }
    if (!(y2 instanceof UnitObject)) {
        y2 = new UnitObject(y2);
    }

    var std_iSpike = exe.lib.std.iSpike;
    var error = UnitObject.prototype.propagateError(std_iSpike, x1, x2, y1, y2);
    if (error) {
        return error;
    }

    var ans;
    if(!x1.isNormal() || !x2.isNormal() || !y1.isNormal() || !y2.isNormal()) {
        ans = new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, "unitError");
        ans.errorString = "All arguments of iSpike must be unitless; current units are: <"+ x1.toString() +">, <"+ x2.toString() +">, <" + y1.toString() + "> and <" + y2.toString() + "> respectively";
    } else {
        ans = new UnitObject(std_iSpike(x1.value, x2.value, y1.value, y2.value), {}, null);
    }

    return ans;
}
function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Convert to UnitObjects
    if (!(condition instanceof UnitObject)) {
        condition = new UnitObject(condition);
    }
    if (!(ifTrue instanceof UnitObject)) {
        ifTrue = new UnitObject(ifTrue);
    }

    if (!(ifFalse instanceof UnitObject)) {
        ifFalse = new UnitObject(ifFalse);
    }

    // Check for errors first
    var std_if = exe.lib.std.__if__;
    var error = ifTrue.propagateError(std_if, ifFalse);
    if (error) {
        return error;
    }

    var ans;
    var ifResult;
    if(!condition.isNormal()) {
        ans = new UnitObject(std_if(condition.value, ifTrue.value, ifFalse.value), {}, "unitError");
        ans.errorString = "First argument to \"if\" function must be unit-less. Current unit is: <" + condition.toString() + ">.";
        return ans;
    } else if ((ifResult = std_if(condition.value, ifTrue.value, ifFalse.value)) === ifTrue.value) {
        // Clone and return the right UnitObject, depending on the return value of the standard library __if__ function
        ans = ifTrue.clone();
    } else {
        ans = ifFalse.clone();
    }

    ans.value = ifResult;
    return ans;
}
function imply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_imply = exe.lib.std.imply;
        var error = a.propagateError(std_imply, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_imply(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"imply\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_imply(a.value, b.value);
            return ans;
        }
    });
}
/**
 * Placeholder function for the input function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @param  {Number|String|Boolean} def Default value of input field
 * @return {Array}     Singleton array with def
 * @memberof Model.Library
 */
function input(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'input' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [def];

}

input.isTimeDependent = true;
function lessThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_lt = exe.lib.std.lessThan;
        var error = a.propagateError(std_lt, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_lt(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to < must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_lt(a.value, b.value);
            return ans;
        }
    });
}
function lessThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_lte = exe.lib.std.lessThanEqual;
        var error = a.propagateError(std_lte, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_lte(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to <= must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_lte(a.value, b.value);
            return ans;
        }
    });
}
function ln(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_ln = exe.lib.std.ln;
        var error = a.propagateError(std_ln);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_ln(a.value), {}, "Ln should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_ln(a.value);
            return ans;
        }
    });
}

function log(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_log = exe.lib.std.log;
        var error = a.propagateError(std_log);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_log(a.value), {}, "Log should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_log(a.value);
            return ans;
        }
    });
}

/*  ======================================= MATRICES =====================================

Description: Javascript routines to handle matrices (2D arrays).
Stored as methods of the global variable Matrix.
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: Peter Coxhead, 2008-2009; released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 July 2009
 */
var version = 'Matrix 1.01';
var errorCallback=null;
/*

Uses IOUtils.js, LUDecomposition.js, QRDecomposition.js, EVDecomposition.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

The useful fields of a Matrix object are:
m    number of rows
n    number of columns
mat  the matrix as an array of m entries, each being arrays of n entries.

Matrix.getEPS(): in any matrix calculation, an absolute value less than Matrix.getEPS()
is replaced by 0. The default value is 2^-40 (~9e-13). Set to a different value if you
want more or less precision.
Matrix.setEPS(newEPS): see above.

Matrix.create(arr): creates a Matrix object to represent the two-dimensional
array arr. The value of arr is copied.
Matrix.create(m,n): creates a Matrix object to represent an m-by-n matrix,
whose values are undefined.

Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity matrix.
Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-m unit matrix.
Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
random values such that 0 <= result[i][j] < 1.

Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
m-by-n.

Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
Matrix object mo.

Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
mo.
Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
function then returns an m-by-m Matrix object with this vector as its diagonal
and all off-diagonal elements set to 0.

Matrix.max(mo): returns the largest entry in the matrix.
Matrix.min(mo): returns the smallest entry in the matrix.

Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
scaled by scalar.

Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and mo2.

Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
each element of the Matrix object mo.  f must be a function of one argument.
Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
to each element of the Matrix object mo1 and the corresponding element of the Matrix
element mo2 (which must be of the same dimension).  f must be a function of two
arguments.

Matrix.trace(mo): returns the trace of the Matrix object mo.
Matrix.det(mo): returns the determinant of the Matrix object mo, which must be square.

Matrix.inverse(mo): returns the inverse of the Matrix object mo.

Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
If A is square, the solution is exact; if A has more rows than columns, the solution
is least squares. (No solution is possible if A has fewer rows than columns.)
Uses LUDecomposition.js and QEDecomposition.js.

Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
fields contain the eigenvectors and eigenvalues. The fields are as follows:
V    the columnwise eigenvectors as a Matrix object
lr   the real parts of the eigenvalues as an array
li   the imaginary parts of the eigenvalues as an array
L    the block diagonal eigenvalue matrix as a Matrix object
isSymmetric   whether the matrix is symmetric or not (boolean).

Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
omitted, the default in IOUtils.js is used.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, EVDecomposition.js and LUDecomposition.js.)

with (Matrix){ var A = create([[1,2,4],[8,2,1],[-2,3,0]]);
println('A');
display(A,0);

var Ainv = inverse(A);
nl(); println('inverse(A)*A');
display(mult(Ainv,A));
nl(); println('inverse(A)*A - I');
display(sub(mult(Ainv,A),identity(A.n,A.m)));

var B = random(3,2);
nl(); println('B');
display(B);
var X = solve(A,B);
nl(); println('X obtained by solving A*X = B');
display(X);
nl(); println('A*X - B');
display(sub(mult(A,X),B));

var es = eigenstructure(A);

nl(); println('V (eigenvectors for A)');
display(es.V);
nl(); println('L (block diagonal eigenvalue matrix for A)');
display(es.L);
nl(); println('A*V - V*L');
display(sub(mult(A,es.V),mult(es.V,es.L)));
nl(); println('A - V*L*inverse(V)');
display(sub(A,mult(es.V,mult(es.L,inverse(es.V)))));
}

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

var Matrix = new createMatrixPackage();

function dealWithError(a){
  if(errorCallback){
    errorCallback("Error occurred in matrix package ("+a+")");
  } else {
    alert("Error occurred in matrix package ("+a+"), but no errorCallback function was installed.");
  }
}
function createMatrixPackage() {
  
  
  
  
  // the provision of an errorCallback function was added by Kees van Overveld
  // (March 2012). This function can be defined externally;
  // it is called whenever an error condition occurs.
  // In case no error callback is installed, the error is communicated via an alert box.


  this.setErrorCallback=function(a){
    errorCallback=a;
  }


	this.version = version;
	
	var abs = Math.abs; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Any number whose absolute value is < EPS is taken to be 0.
	// Matrix.getEPS(): returns the current value of EPS.
	// Matrix.setEPS(): changes the current value of EPS.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var EPS = Math.pow(2, -40);
	this.getEPS = function () {
		return EPS;
	}
	this.setEPS = function (newEPS) {
		EPS = newEPS;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkNum is a private function used in replacing small values by 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkNum(x) {
		return (abs(x) < EPS) ? 0 : x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkMatrix is a private function which checks that argument i of
	//   the function whose name is fname and whose value is arg is a
	//   Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, i, arg) {
		if (!arg.isMatrix) {
      dealWithError('***ERROR: Argument ' + i + ' of Matrix.' + fname +
			' is not a Matrix; its value is "' + arg + '".');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.create(arr): creates a Matrix object to represent the two-dimensional
	//   array arr. The contents of arr are copied.
	// Matrix.create(m,n): creates a Matrix object to represent an m x n matrix,
	//   whose values are undefined.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (a1, a2) { // check args
		var isMatArg1 = a1 instanceof Array;
		if (!isMatArg1 && (typeof a1 != 'number')) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is not an array or a number.');
		}
		if (isMatArg1 && a2 != null) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is an array but argument 2 is also present.');
		}
		if (isMatArg1)
			return _createMatrixfromArray(a1);
		else
			return _createMatrixfromDimensions(a1, a2);
	}
	function _createMatrixfromArray(arr) {
		var m = arr.length;
		for (var i = 0; i < m; i++) {
			if (!(arr[i]instanceof Array)) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 is not a 2D array.');
			}
			if (arr[i].length != arr[0].length) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 has different length rows.');
			}
		}
		var n = arr[0].length;
		var res = new Array(m);
		for (var i = 0; i < m; i++) {
			res[i] = new Array(n);
			for (var j = 0; j < n; j++)
				res[i][j] = _chkNum(arr[i][j]);
		}
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = res;
		x.isMatrix = true;
		return x;
	}
	function _createMatrixfromDimensions(m, n) {
		var arr = new Array(m);
		for (var i = 0; i < m; i++)
			arr[i] = new Array(n);
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = arr;
		x.isMatrix = true;
		return x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity
	//   matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.identity = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = 0;
			for (var i = 0; i < Math.min(m, n); i++)
				mat[i][i] = 1;
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-n unit matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.unit = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = 1;
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
	//   random values such that 0 <= result[i][j] < 1.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.random = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(Math.random());
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
	//   of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
	//   m by n.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.copy = function (mo, fromRow, fromCol, m, n) {
		_chkMatrix('copy', 1, mo);
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = mo.mat[i + fromRow][j + fromCol];
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
	//   Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.transpose = function (mo) {
		_chkMatrix('transpose', 1, mo);
		var res = _createMatrixfromDimensions(mo.n, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = mo.mat[j][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
	//   an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
	//   mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diagOf = function (mo) {
		_chkMatrix('diagOf', 1, mo);
		var res = _createMatrixfromDimensions(Math.min(mo.m, mo.n), 1);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][0] = mo.mat[i][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
	//   function then returns an m-by-m Matrix object with this vector as its diagonal
	//   and all off-diagonal elements set to 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diag = function (mo) {
		_chkMatrix('diag', 1, mo);
		if (mo.n != 1) {
      dealWithError( '***ERROR: in Matrix.diag: argument 1 is not a column vector.');
		}
		var res = Matrix.identity(mo.m, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][i] = mo.mat[i][0];
		}
		return res;
	}
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.max(mo): returns the largest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.max = function (mo) {
		_chkMatrix('max', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] > res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.min(mo): returns the smallest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.min = function (mo) {
		_chkMatrix('min', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] < res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
	//   scaled by scalar.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.scale = function (mo, scalar) {
		_chkMatrix('scale', 1, mo);
		var res = _createMatrixfromArray(mo.mat);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = _chkNum(scalar * mat[i][j]);
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.add = function (mo1, mo2) {
		_chkMatrix('add', 1, mo1);
		_chkMatrix('add', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.add: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] + mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.sub = function (mo1, mo2) {
		_chkMatrix('sub', 1, mo1);
		_chkMatrix('sub', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      delaWithError( '***ERROR: in Matrix.sub: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] - mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and
	//   mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.mult = function (mo1, mo2) {
		_chkMatrix('mult', 1, mo1);
		_chkMatrix('mult', 2, mo2);
		if (mo1.n != mo2.m) {
      dealWithError( '***ERROR: in Matrix.mult: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo2.n);
		var temp;
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++) {
				temp = 0;
				for (var k = 0; k < mo1.n; k++)
					temp += mo1.mat[i][k] * mo2.mat[k][j];
				mat[i][j] = _chkNum(temp);
			}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
	//   each element of the Matrix object mo.  f must be a function of one argument.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.map = function (f, mo) {
		_chkMatrix('map', 2, mo);
		var res = _createMatrixfromDimensions(mo.m, mo.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
	//   to each element of the Matrix object mo1 and the corresponding element of the Matrix
	//   element mo2 (which must be of the same dimension).  f must be a function of two
	//   arguments.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.combine = function (f, mo1, mo2) {
		_chkMatrix('combine', 1, mo1);
		_chkMatrix('combine', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.combine: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo1.mat[i][j], mo2.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.trace(mo): returns the trace of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.trace = function (mo) {
		_chkMatrix('trace', 1, mo);
		var t = 0;
		with (mo)
		for (var i = 0; i < Math.min(m, n); i++)
			t += mat[i][i];
		return _chkNum(t);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.det(mo): returns the determinant of the Matrix object mo, which be square.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.det = function (mo) {
		_chkMatrix('det', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.det: argument is not square.');
		}
		with (LUDecomposition)
		return _chkNum(det(create(mo)));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.inverse(mo): returns the inverse of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.inverse = function (mo) {
		_chkMatrix('inverse', 1, mo);
		return Matrix.solve(mo, Matrix.identity(mo.m, mo.m));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
	//   If A is square, the solution is exact; if A has more rows than columns, the solution
	//   is least squares. (No solution is possible if A has fewer rows than columns.)
	//   Uses LUDecomposition.js and QRDecomposition.js.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (A, B) {
		_chkMatrix('solve', 1, A);
		_chkMatrix('solve', 2, B);
		if (A.m == A.n)
			with (LUDecomposition)return solve(create(A), B);
		else if (A.m > A.n)
			with (QRDecomposition) {
				var temp = create(A);
				return solve(temp, B);
			}
		else
      dealWithError( '***ERROR: in Matrix.solve: argument 1 has fewer rows than columns.');
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
	//    fields contain the eigenvectors and eigenvalues. The fields are as follows:
	//    V    the columnwise eigenvectors as a Matrix object
	//    lr   the real parts of the eigenvalues as an array
	//    li   the imaginary parts of the eigenvalues as an array
	//    L    the block diagonal eigenvalue matrix as a Matrix object
	//    isSymmetric   whether the matrix is symmetric or not (boolean).
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.eigenstructure = function (mo) {
		_chkMatrix('eigenstructure', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.eigenstructure: argument is not a square matrix.');
		}
		return EVDecomposition.create(mo);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
	//  omitted, the default in IOUtils.js is used.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.display = function (mo, dp) {
		_chkMatrix('display', 1, mo);
		if (dp == null)
			dp = 3;
		displayMat(mo.mat, null, null, dp);
	}
	
}
function max(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_max = exe.lib.std.max;
        var error = a.propagateError(std_max, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_max(a.value, b.value), {}, "Max units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_max(a.value, b.value);
            return ans;
        }
    });
}function min(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_min = exe.lib.std.min;
        var error = a.propagateError(std_min, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_min(a.value, b.value), {}, "Min units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_min(a.value, b.value);
            return ans;
        }
    });
}function modulo(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_modulo = exe.lib.std.modulo;
        var error = a.propagateError(std_modulo, b);
        if (error) {
            return error;
        }

        if (!a.equals(b)) {
            return new UnitObject(std_modulo(a.value, b.value), {}, "Modulo units should be equal.");
        } else {
            var ans = a.clone()
            ans.value = std_modulo(a.value, b.value);
            return ans;
        }
    });
}function multiply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_multiply = exe.lib.std.multiply;
        var error = a.propagateError(std_multiply, b);
        if (error) {
            return error;
        }

        var ans = a.multiply(b);
        ans.value = std_multiply(a.value, b.value);
        return ans;
    });
}

multiply.base = 1;
function not(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x], function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_not = exe.lib.std.not;
        var error = a.propagateError(std_not);
        if (error) {
            return error;
        }

        var ans;
        if(!a.isNormal()) {
            ans = new UnitObject(std_not(a.value), {}, "unitError");
            ans.errorString = "The argument to the \"not\" function must be unit-less. Current unit is: <" + a.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_not(a.value);
            return ans;
        }
    });
}
function notEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_neq = exe.lib.std.notEqual;
        var error = a.propagateError(std_neq, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(std_neq(a.value, b.value), {}, "unitError");
            ans.errorString = "Arguments to != must have same units. Trying to compare units <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_neq(a.value, b.value);
            return ans;
        }
    });
}
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

            if (!nonRecursive && !(obj[key] instanceof Array) && !(obj[key] instanceof UnitObject) && obj[key] instanceof Object) {
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
function or(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_or = exe.lib.std.or;
        var error = a.propagateError(std_or, b);
        if (error) {
            return error;
        }

        var ans;
        if (!a.isNormal() || !b.isNormal()) {
            ans = new UnitObject(std_or(a.value, b.value), {}, "unitError");
            ans.errorString = "Both arguments to the \"or\" function must be unit-less. Current units are <" + a.toString() + "> and <" + b.toString() + ">.";
            return ans;
        } else {
            var ans = a.clone()
            ans.value = std_or(a.value, b.value);
            return ans;
        }
    });
}

or.base = false;
function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    return zip([x, y, z], function(a, b, c) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        if (!(c instanceof UnitObject)) {
            c = new UnitObject(c);
        }

        var std_poisson = exe.lib.std.poisson;
        var error = a.propagateError(std_poisson, [b, c]);
        if (error) {
            return error;
        }

        if (a.hasUnit() || b.hasUnit() || c.hasUnit()) {
            return new UnitObject(std_poisson(a.value, b.value, c.value), {}, "Poisson arguments should be dimensionless.");
        } else {
            var ans = a.clone()
            ans.value = std_poisson(a.value, b.value, c.value);
            return ans;
        }
    });
}function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_pow = exe.lib.std.pow;
        var error = a.propagateError(std_pow, b);
        if (error) {
            return error;
        }

        var ans = a.power(b);
        ans.value = std_pow(a.value, b.value);
        return ans;
    });

}
function putChan(myChannelName,myValue) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof myChannelName) == 'string') {
        var value = arrayToObject(myValue);
        var fnd = false;
        for (var i = 0; i < putChanTimers.length; i++) {
            if (putChanTimers[i].chanName == myChannelName) {
                // this channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - putChanTimers[i].time < MINURLDELAY) {
                    return myValue;
                } else {
                    // we can call the server again.
                    var encodedData = JSON.stringify(value);
                    var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl
                    });
                    putChanTimers[i].time = chanTime;
                    return myValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = putChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            putChanTimers[k] = {
                'returnValue': value,
                'time': chanTime,
                'chanName': myChannelName
            };
            var encodedData = JSON.stringify(value);
            var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl
            });
            return myValue;
        }
    } else {
        throw new Error("\nfirst argument of putChan() must be a string");
    }
}
function ramp(x, x1, y1, x2, y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var rmp = 0;
    if (x1 != x2) {
        if (x < x1) {
            rmp = y1;
        } else {
            if (x > x2) {
                rmp = y2;
            } else {
                rmp = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
            }
        }
    } else {
        rmp = ((x2 + y2)) / 2.0;
    }
    return rmp;

}
function random() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
	return new UnitObject(Math.random());
}

random.isTimeDependent = true;
function round(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_round = exe.lib.std.round;
        var error = a.propagateError(std_round);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_round(a.value);
        return ans;
    });
}

function sin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_sin = exe.lib.std.sin;
        var error = a.propagateError(std_sin);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_sin(a.value), {}, "Sin should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_sin(a.value);
            return ans;
        }
    });
}

/**
 * Placeholder function for the slider function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @pre min <= def <= max
 * @param  {Number} def Deafault value of the slider
 * @param  {Number} min Lower bound
 * @param  {Number} max Upper Bound
 * @return {Array}     Array with def,min,max
 */
function slider(def, min, max) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'Slider' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (isNaN(parseFloat(def)) || isNaN(parseFloat(min)) || isNaN(parseFloat(max))) {
        throw new Error('Arguments of slider must be numeric constants.');
    }

    if (min <= def && def <= max) {
        return [def, min, max];
    } else {
        throw new Error('For the slider, the default value must be between the lower and upper bound.' +
            ' Also the upper bound must be greater than the lower bound' +
            ' (Default = ' + def + ', lower = ' + min + ', upper = ' + max + ')');
    }
}

slider.isTimeDependent = true;
function subtract(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return zip([x, y], function(a, b) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        if (!(b instanceof UnitObject)) {
            b = new UnitObject(b);
        }

        var std_subtract = exe.lib.std.subtract;
        var error = a.propagateError(std_subtract, b);
        if (error) {
            return error;
        }

        var ans;
        if(!a.equals(b)) {
            ans = new UnitObject(a.value - b.value, {}, "unitError");
            ans.errorString = "Subtract mismatch";
            return ans;
        } else {
            ans = a.clone();
            ans.value = std_subtract(a.value, b.value);
            return ans;
        }
    });
}
function sum() {
    return zip(arguments, function() {
        var _sum = 0;
        for (var i = arguments.length - 1; i >= 0; i--) {
            _sum += arguments[i];
        }
        return _sum;
    });
}
function tan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }
        
        var std_tan = exe.lib.std.tan;
        var error = a.propagateError(std_tan);
        if (error) {
            return error;
        }

        if (a.hasUnit()) {
            return new UnitObject(std_tan(a.value), {}, "Tan should be unitless.");
        } else {
            var ans = a.clone()
            ans.value = std_tan(a.value);
            return ans;
        }
    });
}

function uniminus(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            a = new UnitObject(a);
        }

        var std_uniminus = exe.lib.std.uniminus;
        var error = a.propagateError(std_uniminus);
        if (error) {
            return error;
        }

        var ans = a.clone();
        ans.value = std_uniminus(a.value);
        return ans;
    });
}

//This function was taken from keesvanoverveld.com
function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                var iLow = Math.min(x.length, Math.max(0, z));
                var r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                for (i = 0; i < y.length; i++) {
                    r[i + iLow] = y[i];
                }
                for (i = iLow; i < x.length; i++) {
                    r[i + y.length] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        } else {
            // we interpret the scala element to be inserted as if it is a vector with length 1
            if (!(z instanceof Array)) {
                var iLow = Math.min(x.length, Math.max(0, z));
                var r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                r[iLow] = y;
                for (i = iLow; i < x.length; i++) {
                    r[i + 1] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        }
    } else {
        throw new Error("vAggregate: first argument must be a vector");
    }
}
function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var result = [];
        for (var key in x) {
            result[key] = x[key];
        }
        result[x.length] = y;
        return result;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var p = [];
    if (!(x instanceof Array)) {
        p.push(x);
    } else {
        for (k in x) {
            p.push(x[k]);
        }
    }
    if (!(y instanceof Array)) {
        p.push(y);
    } else {
        for (k in y) {
            p.push(y[k]);
        }
    }
    return p;
}

vConcat.base = [];
 //This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var r = x.length;
        if (y instanceof Array) {
            var p = y.length;
            if (!(n instanceof Array)) {
                var n = Math.round(n);
                var res = [];
                switch (m) {
                    case 0:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                while (index < 0)
                                    index += r;
                                while (index >= r)
                                    index -= r;
                                rr += x[index] * y[j];
                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    case 1:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                if (index >= 0 && index < r) {
                                    rr += x[index] * y[j];
                                }
                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    case 2:
                        for (i = 0; i < r; i++) {
                            var rr = 0;
                            for (j = 0; j < p; j++) {
                                var index = i + j - n;
                                index = index < 0 ? 0 : (index >= r ? r - 1 : index);
                                rr += x[index] * y[j];

                            }
                            res[i] = rr;
                        }
                        return res;
                        break;
                    default:
                        throw new Error("convolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("convolution: auto-mapping is not supported, third argument must be scalar.");

            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    // Just get the values, not the units.
    x = unaryZip(x, function(a) {
        if (a instanceof UnitObject) {
            return a.value;
        } else {
            return a;
        }
    });

    var domain = exe.lib.std.vDom(x);

    // Transform the result back into UnitObjects with no unit.
    return unaryZip(domain, function(a) {
        return new UnitObject(a);
    });
}
//This function was taken from keesvanoverveld.com
function vDot(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        if (y instanceof Array) {
            var a = 0;
            for (i in x) {
                if (y[i] != undefined) {
                    if (!(x[i] instanceof Array) && !(y[i] instanceof Array)) {
                        a += (x[i] * y[i]);
                    }
                }
            }
            return a;
        } else {
            var a = 0;
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    a += y * x[i];
                }
            }
            return a;
        }
    } else {
        if (!(y instanceof Array)) {
            return x * y;
        } else {
            var a = 0;
            for (i in y) {
                if (!(y[i] instanceof Array)) {
                    a += x * y[i];
                }
            }
            return a;
        }
    }
}
function vEigenSystem(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aEig = Matrix.eigenstructure(aA);
            // aEig.lr=the vector of real parts of the eigenvalues
            // aEig.li=the vector of imaginary parts of eigenvalues
            // eEig.V=matrix of eigenvectors
            var ttt = [];
            // first lr
            ttt[0] = [];
            for (i = 0; i < aEig.lr.length; i++) {
                ttt[0][i] = aEig.lr[i];
            }
            // next li
            ttt[1] = [];
            for (i = 0; i < aEig.li.length; i++) {
                ttt[1][i] = aEig.li[i];
            }
            // next V
            ttt[2] = [];
            for (i = 0; i < aEig.V.mat.length; i++) {
                var vvv = [];
                ttt[2][i] = [];
                for (var j = 0; j < aEig.V.mat[i].length; j++) {
                    vvv[j] = aEig.V.mat[i][j];
                }
                ttt[2][i] = vvv;
            }
            return ttt;
        } else {
            throw new Error("\nvEigenSystem: cannot calculate eigensystem for non-square matrix");
        }
    } else {
        return
        // if x is a scalar, the real part of the eigenvalue is equal to that scalar;
        // the iumaginary part is 0, and the eigenvector is the vector [1]
        [x, 0, [1]];
    }
}
function vExtend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array)) {
        if (y instanceof Array) {
            var p = [];
            p.push(x);
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
            return p;
        } else {
            return [x, y];
        }
    } else {
        var p = [];
        for (k in x) {
            p[k] = x[k];
        }
        if (y instanceof Array) {
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
        } else {
            p.push(y);
        }
        return p;
    }
}

vExtend.base = []
//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var n = Math.round(x);
        var s = y;
        if (n >= 0) {
            var t = [];
            var sum = 0;
            var x = -(n - 1) / 2;
            var denom = 2 * s * s;
            for (i = 0; i < n; i++) {
                t[i] = Math.exp(-x * x / denom);
                sum += t[i];
                x += 1;
            }
            for (i = 0; i < n; i++) {
                t[i] /= sum;
            }
            return t;
        } else {
            throw new Error("vGaussian: cannot make a vector with <0 elements");
        }
    } else {
        throw new Error("vGaussian: both arguments must be scalar.");
    }
}
function vLen(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array)) {
        return 0;
    }
    return x.length;
}
function vMake(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = unaryZip(x, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });

    if (!(y instanceof UnitObject)) {
        y = new UnitObject(y);
    }

    var std_vMake = exe.lib.std.vMake;
    return std_vMake(x, y.value);
}
function vMatInverse(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aInv = Matrix.inverse(aA);
            for (i = 0; i < aInv.mat.length; i++) {
                var tt = [];
                for (j = 0; j < aInv.mat[i].length; j++) {
                    tt[j] = aInv.mat[i][j];
                }
                t[i] = tt;
            }
            return t;
        } else {
            throw new Error("\nvMatInverse: cannot take inverse of non-square matrix");
        }
    } else {
        return 1 / x;
    }
}
//This function was taken from keesvanoverveld.com
function vMatMatMul(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var trueMatrix0 = false;
        for (i in x) {
            if (x[i] instanceof Array) {
                trueMatrix0 = true;
            }
        }
        if (trueMatrix0) {
            if (y instanceof Array) {
                var trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    var m = [];
                    for (i in x) {
                        var r = [];
                        for (j in y) {
                            if (y[j] instanceof Array) {
                                for (k in y[j]) {
                                    if (x[i][j] != undefined) {
                                        if (y[j][k] != undefined) {
                                            if (!(x[i][j] instanceof Array) && !(y[j][k] instanceof Array)) {
                                                var t = x[i][j] * y[j][k];
                                                if (r[k]) {
                                                    r[k] += t;
                                                } else {
                                                    r[k] = t;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        m[i] = r;
                    }
                    return m;
                } else {
                    // y is not a matrix but a vector; x is a true matrix. So this is a matrix-vector product or a matrix-scalar product.
                    var r = [];
                    for (i in x) {
                        var a = 0;
                        if (x[i] instanceof Array) {
                            for (j in x[i]) {
                                if (y[j] != undefined) {
                                    if (!(x[i][j] instanceof Array) && !(y[j] instanceof Array)) {
                                        a += x[i][j] * y[j];
                                    }
                                }
                            }
                            r[i] = a;
                        }
                    }
                    return r;
                }
            } else {
                // x is a matrix and y is a scalar. Return the matrix, multiplied by the scalar (this would
                // also be achieved by auto mapping the multiplication)
                var m = [];
                for (var i in x) {
                    var r = [];
                    if (x[i] instanceof Array) {
                        for (j in x[i]) {
                            if (!(x[i][j] instanceof Array)) {
                                r[j] = x[i][j] * y;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            }
        } else {
            // the argument x is a vector of scalars, not a true matrix. Perhaps y is a matrix.
            if (y instanceof Array) {
                var trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    // yes, so we do a matrix-vector product
                    var r = [];
                    for (i in x) {
                        if (y[i] != undefined) {
                            if (y[i] instanceof Array) {
                                for (j in y[i]) {
                                    if (!(y[i][j] instanceof Array)) {
                                        if (r[j] != undefined) {
                                            r[j] += x[i] * y[i][j];
                                        } else {
                                            r[j] = x[i] * y[i][j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return r;
                } else {
                    // y is not a matrix but a vector; x is also a vector. So we calculate the dot product -
                    // treating the vector y as a column rather than as the row that it actually is..
                    var a = 0;
                    for (i in x) {
                        if (y[i] != undefined) {
                            if (!(y[i] instanceof Array)) {
                                a += x[i] * y[i];
                            }
                        }
                    }
                    // what should we do - return this as a number or as a 1x1 matrix? Choose to return it as a number.
                    return a;
                }
            } else {
                // so x is a vector and y is a scalar.
                var r = [];
                for (i in x) {
                    if (!(x[i] instanceof Array)) {
                        r[i] = x[i] * y;
                    }
                }
                return r;
            }
        }
    } else {
        // x is a scalar. Perhaps y is a matrix.
        if (y instanceof Array) {
            var trueMatrix1 = false;
            for (i in y) {
                if (y[i] instanceof Array)
                    trueMatrix1 = true;
            }
            if (trueMatrix1) {
                // so x is a scalar and y is a matrix.
                var m = [];
                for (i in y) {
                    var r = [];
                    if (y[i] instanceof Array) {
                        for (j in y[i]) {
                            if (!(y[i][j] instanceof Array)) {
                                r[j] = y[i][j] * x;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            } else {
                // x is a scalar and y is a vector.
                var r = [];
                for (i in y) {
                    if (!(y[i] instanceof Array)) {
                        r[i] = y[i] * x;
                    }
                }
                return r;
            }
        } else {
            // x is a scalar and y is a scalar: just return their product
            return x * y;
        }
    }
}
function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var isOK = true;
    if (mm instanceof Array) {
        var t = [];
        var u = [];
        // n is number of rows; m is number of columns of the matrix (=mm)
        var n = mm.length;
        if (mm[0] instanceof Array) {
            var m = mm[0].length;
            if (v instanceof Array) {
                if (m <= n && v.length == n) {
                    for (i = 0; i < n; i++) {
                        t[i] = [];
                        if (mm[i] instanceof Array) {
                            if (mm[i].length == m) {
                                for (j = 0; j < m; j++) {
                                    if (!(mm[i][j] instanceof Array)) {
                                        t[i][j] = mm[i][j];
                                    } else {
                                        throw new Error("\nvMatSolve: every matrix element must be scalar");
                                    }
                                }
                            } else {
                                throw new Error("\nvMatSolve: every row in left hand side must be of equal length");
                            }
                        } else {
                            throw new Error("\nvMatSolve: every row in left hand side must be a vector");
                        }
                    }
                    // next assemble the right hand vector
                    for (i = 0; i < n; i++) {
                        if (!(v[i] instanceof Array)) {
                            u[i] = [];
                            u[i][0] = v[i];
                        } else {
                            throw new Error("\nvMatSolve: non-scalar element found in right-hand side");
                        }
                    }
                } else {
                    throw new Error("\nvMatSolve: nr. rows of right hand side must be equal to nr. columns of left hand side, and the number of rows of the matrix must not be smaller than the number of columns");
                }
            } else {
                throw new Error("\nvMatSolve: right hand side must be vector");
            }
        } else {
            throw new Error("\nvMatSolve: left hand side must be vector of vectors");
        }
    } else {
        throw new Error("\nvMatSolve: first argument must be vector");
    }
    if (isOK) {
        var aA = Matrix.create(t);
        var aB = Matrix.create(u);
        var aSol = Matrix.solve(aA, aB);
        var tt = [];
        for (i = 0; i < aSol.mat.length; i++) {
            tt[i] = aSol.mat[i][0];
        }
        return tt
    }
}
//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += Math.abs(x[i]);
            }
        }
        return a;
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormEuclid(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return Math.sqrt(a);
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        // we support also strings that are to be concatenated.
        // Hence the initialisation cannot simply be var a=0; we must leave the type of a open until after
        // the first assignment;
        var a;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                if (a != undefined) {
                    a += x[i];
                } else {
                    a = x[i];
                }
            }
        }
        return a;
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormSq(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return a;
    } else {
        return x * x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormalize(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var a = 0;
    if (x instanceof Array) {
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        var nn = Math.sqrt(a);
        var rr = [];
        if (nn > 0) {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = x[i] / nn;
                } else {
                    rr[i] = x[i];
                }
            }
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = 0;
                } else {
                    rr[i] = x[i];
                }
            }
        }
        return rr;
    } else {
        return 1;
    }
}
function vRange(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var range = exe.lib.std.vRange(x);

    // Transform any scalar value into a UnitObject.
    return unaryZip(range, function(a) {
        if (!(a instanceof UnitObject)) {
            return new UnitObject(a);
        } else {
            return a;
        }
    });
}
//This function was taken from keesvanoverveld.com
function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        if (!(y instanceof Array)) {
            if (!(z instanceof Array)) {
                var iLow = Math.max(0, y);
                var iHi = Math.min(x.length, z);
                var r = [];
                for (i = iLow; i < iHi; i++) {
                    r[i - iLow] = x[i];
                }
                i = iHi - iLow;
                while (i < z - y) {
                    r[i] = 0;
                    i++;
                }
                return r;
            } else {
                throw new Error("vSegment: third argument must be a scalar.");
            }
        } else {
            throw new Error("vSegment: second argument must be a scalar.");
        }
    } else {
        throw new Error("vSegment: first argument must be a vector.");
    }
}
//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var p = [];
        for (k = x; k < y; k++) {
            p.push(k);
        }
        return p;
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function vSequence(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return vSeq(x, y);
}
//This function was taken from keesvanoverveld.com
function vSpike(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    var r = Math.round(y);
    var p = Math.round(x);
    var rr = [];
    for (i = 0; i < r; i++) {
        if (i == p) {
            rr[i] = 1;
        } else {
            rr[i] = 0;
        }
    }
    return rr;
}
//This function was taken from keesvanoverveld.com
function vTranspose(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        var trueMatrix = false;
        for (i in x) {
            if (x[i] instanceof Array)
                trueMatrix = true;
        }
        if (trueMatrix) {
            var r = [];
            for (i in x) {
                if (x[i] instanceof Array) {
                    for (j in x[i]) {
                        if (r[j] == undefined) {
                            r[j] = [];
                        }
                        r[j][i] = x[i][j];
                    }
                } else {
                    if (r[j] == undefined) {
                        r[j] = [];
                    }
                    r[j][0] = x[i];
                }
            }
            return r;
        } else {
            // x is a vector, but not a matrix. Tow options:
            // consider the argument as [[1,2,3]] and return [[1],[2],[3]] - or consider it just as a list [1,2,3]  and merely return [1,2,3]. We prefer the latter.
            return x;
        }
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vVecRamp(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    // arguments: x is a vector of abcissae
    // y is a vector of ordinates
    // z is an abcissa-value
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                // simply ignore elements at the tail in case on of the two vectors is too long
                var len = Math.min(x.length, y.length);
                // it may be necessary to sort the keys - hopefully not, but it takes
                // little time at least to check
                var sorted = false;
                var scalarOK = true;
                while (!sorted && scalarOK) {
                    sorted = true;
                    for (i = 0; i < len - 1; i++) {
                        if (!(x[i] instanceof Array)) {
                            if (!(x[i + 1] instanceof Array)) {
                                if (x[i] > x[i + 1]) {
                                    var swap = x[i];
                                    x[i] = x[i + 1];
                                    x[i + 1] = swap;
                                    // don't forget to swap the ordinate values as well!
                                    swap = y[i];
                                    y[i] = y[i + 1];
                                    y[i + 1] = swap;
                                    sorted = false;
                                }
                            } else
                                scalarOK = false;
                        } else
                            scalarOK = false;
                    }
                }
                if (scalarOK) {
                    //first do a binary search - assume that the keys are sorted!
                    //We have to find the index i such that the probe is enclosed between heap(i) and heap(i+1).
                    var lo = 0;
                    var hi = len;
                    var mi = len / 2;
                    if (z <= x[0]) {
                        return y[0];
                    }
                    if (z >= x[len - 1]) {
                        return y[len - 1];
                    }
                    var nrtrials = 0;
                    while (hi > lo + 1 && nrtrials < 20) {
                        mi = Math.round((hi + lo) / 2)
                        if (z >= x[mi])
                            lo = mi;
                        if (z <= x[mi])
                            hi = mi;
                        nrtrials++;
                    }
                    if (nrtrials < 20) {
                        if (x[lo + 1] > x[lo]) {
                            return y[lo] + (z - x[lo]) * (y[lo + 1] - y[lo]) / (x[lo + 1] - x[lo]);
                        } else {
                            return 0.5 * (y[lo] + y[lo + 1]);
                        }
                    } else {
                        throw new Error("vVecRamp: could not find enclosing interval for abcissa.");
                    }
                } else {
                    throw new Error("vVecRamp: not all the abcissae values are scalar.");
                }
            } else {
                throw new Error("vVecRamp: third argument of vVecRamp must be scalar (abcissa-value).");
            }
        } else {
            throw new Error("vVecRamp: second argument of vVecRamp must be vector (of ordinates).");
        }
    } else {
        throw new Error("vVecRamp: first argument of vVecRamp must be vector (of abcissae).");
    }
}
