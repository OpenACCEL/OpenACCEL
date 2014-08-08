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
function UnitObject(value, unit, error, errorString) {
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
    this.errorString = (typeof errorString !== "undefined") ? errorString : "";
}

/**
 * Creates a shallow clone of the UnitObject, giving a fresh copy that can be
 * modified, without modifying the original object.
 *
 * An additional parameter may be given that will overwrite the value of the UnitObject.
 * This is because most of the time you only want to clone the unit, and not the value.
 *
 * @param {Object} A possible value to be overwritten.
 * @return {UnitObject} The shallow copy.
 */
UnitObject.prototype.clone = function(value) {
    var ans = new UnitObject(typeof value === 'undefined' ? this.value : value);
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
 * Sets the unit of the given (array of) UnitObject(s) recursively.
 *
 * @param {Object} obj The (array of) UnitObject(s) to set the unit of.
 * @param {Object} unit The new unit of the UnitObject.
 */
UnitObject.prototype.setUnitsRecursively = function(obj, unit) {
    if (obj instanceof Array) {
        for (var i in obj) {
            UnitObject.prototype.setUnitsRecursively(obj[i], unit);
        }
    } else {
        obj.setUnit(unit);
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
 * @param  {Object} values     The values.
 * @param  {Object} units      The units.
 * @param  {String} error      Whether the UO has an error (the error type).
 * @param  {String} errorStr   The error message in case of an error.
 * @return {UnitObject}        The resulting zipped UnitObjects.
 */
UnitObject.prototype.create = function(values, units, errors, errorStrings) {
    // Small optimization between binaryZip and normal zip.
    if (typeof errors === 'undefined') {
        return binaryZip(values, units, function(value, unit) {
            if (value instanceof UnitObject) {
                return new UnitObject(value.value, unit);
            } else {
                return new UnitObject(value, unit);
            }
        });
    } else {
        return multiaryZip([values, units, errors, errorStrings], function(value, unit, error, errorString) {
            if (!errorString) {
                errorString = '';
            }

            if (value instanceof UnitObject) {
                return new UnitObject(value.value, unit, error, errorString);
            } else {
                return new UnitObject(value, unit, error, errorString);
            }
        });
    }
};

/**
 * Returns whether the given array of UnitObjects is homogeneous with respect
 * to units. That is, whether all elements have the same unit. If this
 * is the case it returns the unit of the array, else it returns false.
 *
 * @param {arr} arr The array to check for homogeneity
 * @return {Boolean} The unit of the elements in the array if the array is
 * homogeneous. Else, false.
 */
UnitObject.prototype.isHomogeneous = function(arr) {
    var unit = '';

    // If it's not even an array, just return the unit
    if (!(arr instanceof Array)) {
        return arr.unit;
    }

    // Check whether all elements of the array have the same unit
    for (var i = arr.length - 1; i >= 0; i--) {
        // Get unit of current element, whether it's an array or UnitObject
        var curUnit;
        if (arr[i] instanceof Array) {
            curUnit = UnitObject.prototype.isHomogeneous(arr[i]);
            if (curUnit === false) {
                return false;
            }
        } else {
            curUnit = arr[i];
        }
        if (!(curUnit instanceof UnitObject)) {
            curUnit = new UnitObject(0).setUnit(curUnit);
        }

        // Save current unit if it's the first one found
        if (i === arr.length-1) {
            unit = curUnit.clone();
        } else if (!unit.equals(curUnit)) {
            return false;
        }
    };

    return unit.unit;
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
        if (Object.keys(unit).length !== Object.keys(val).length) {
            return false;
        }

        /**
         * Check whether both unit and value have the same keys. Recursively!
         * Start by collecting all keys from both arrays. These keys can be both numerical
         * indices and strings.
         */
        var valKeys = Object.keys(val);
        var unitKeys = Object.keys(unit);
        var keys = [];
        var key;

        for (key in valKeys) { keys.push(valKeys[key]); }
        for (key in unitKeys) { keys.push(unitKeys[key]); }

        for (key in keys) {
            // Check whether this key appears in both the value and unit
            if (!val.hasOwnProperty(keys[key]) || !unit.hasOwnProperty(keys[key])) {
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
        var ans = f.apply(null, args);
        return new UnitObject(f.apply(null, args), {}, 'uncheckedUnit');
    } else {
        return false;
    }
};

/**
 * Converts the given array of UnitObjects to an array containing
 * only their values, recursively.
 * @param  {Array} arr The array of UnitObjects to convert.
 * @return {Array} An array containing the values of all UnitObjects
 * in arr in their original order.
 */
UnitObject.prototype.toArray = function(arr) {
    if (!(arr instanceof Array)) {
        return arr.value;
    }

    var l = arr.length;
    var newArr = new Array(l);
    for (var i = l-1; i >= 0; i--) {
        var elem = arr[i];
        if (elem instanceof Array) {
            newArr[i] = UnitObject.prototype.toArray(elem);
        } else {
            newArr[i] = elem.value;
        }
    }

    return newArr;
};

/**
 * Turns the given (array of) UnitObject(s) into a single UO containing the same value
 * and the given error and error message. This error will then be propagated correctly
 * when used in other expressions.
 *
 * @param {UnitObject} obj The (array of) UnitObject(s) to turn into an error object.
 * @param {String} err The error to give to the UO. For example "unitError" or "uncheckedUnit"
 * @param {String} message The textual description of the error. Displayed to the user in the UI
 * @return {UnitObject} UO with the value of the given (array of) UO('s), and the given error (message)
 */
UnitObject.prototype.makeError = function(obj, err, message) {
    var val = UnitObject.prototype.toArray(obj);
    var ans = new UnitObject(val, {}, err);
    ans.errorString = message;

    return ans;
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
 * Returns whether the applicable (array of) UnitObject(s) has (have) no unit(s).
 *
 * @param {UnitObject} obj When given, this (array of) UnitObject(s) is checked.
 * If not given, the *this* object is used.
 * @return {Boolean} Whether the UnitObject has no unit, and thus is the
 * identity unit (for multiplication).
 */
UnitObject.prototype.isNormal = function(obj) {
    if (typeof obj === 'undefined') {
        return Object.keys(this.unit).length === 0;
    } else {
        if (obj instanceof Array) {
            for (var elem in obj) {
                if (!UnitObject.prototype.isNormal(obj[elem])) {
                    return false;
                }
            }
        } else {
            return Object.keys(obj.unit).length === 0;
        }
    }

    return true;
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

    if (!(exponent instanceof UnitObject)) {
        exponent = new UnitObject(exponent);
    }

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
