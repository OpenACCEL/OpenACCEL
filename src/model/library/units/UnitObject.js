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
}

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
}

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
}

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

    return nominator
}

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

    return denominator
}

/**
 * Returns the unit of the UnitObject as an OpenACCEL unit string.
 * For example, {'kg': 1, 'm': 1, 's': -2} will return "kg.m/s2".
 *
 * @return {String} The unit in OpenACCEL string format.
 */
UnitObject.prototype.unitToString = function() {
    var ans = "";

    if (this.error != null && this.error != '') {
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
}

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
}

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
        for (var key in val) { keys.push(key); }
        for (var key in unit) { keys.push(key); }

        for (var key in keys) {
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
}

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
}

/**
 * Given two UnitObjects; if one of the objects contains an error, the value gets updated,
 * the error becomes 'uncheckUnit' and the unit stays empty. If none of the two objects contain
 * an error, the function will return false.
 *
 * Error _strings_ are not propagated to prevent error messages from stacking up and
 * appearing multiple times.
 *
 * @param  {Function} f The function that zips the values of the two objects together when there is an error.
 * @param  {UnitObject} other
 * @return A UnitObject with error and updated value if x or y contains an error. False otherwise.
 */
UnitObject.prototype.propagateError = function(f, other) {
    // Check for errors on the left hand side.
    if ((this.error != null && this.error != '') || (other.error != null && other.error != '')) {
        return new UnitObject(f(this.value, other.value), {}, 'uncheckedUnit');
    }

    return false;
}

/**
 * @return {Boolean} Whether the UnitObject has any unit at all, and is not the
 * identity unit (for multiplication).
 */
UnitObject.prototype.hasUnit = function() {
    return Object.keys(this.unit).length > 0;
}

/**
 * @return {Boolean} Whether the UnitObject has no unit, and thus is the
 * identity unit (for multiplication).
 */
UnitObject.prototype.isNormal = function() {
    return Object.keys(this.unit).length === 0;
}

/**
 * Calculates the sum of two UnitObjects.
 * The addition of a unit with another unit with an error results in an empty unit with error.
 * The addition of two UnitObjects that do not have the exact same unit, will result
 * in a UnitObject with no error and empty unit.
 *
 * @param  {UnitObject} other The other UnitObject that should be summed with.
 * @return {UnitObject}       A new UnitObject that is the result of the addition.
 */
UnitObject.prototype.add = function(other) {
    var error = this.propagateError(function(x, y) { return x + y; }, other);
    if (error) {
        return error;
    }

    // Check whether the dimensions of the two objects are equal.
    // Otherwise, return a UnitObject with error and no unit.
    var ans;
    if(!this.equals(other)) {
        ans = new UnitObject(this.value + other.value, {}, "unitError");
        ans.errorString = "Addition mismatch";
        return ans;
    } else {
        ans = this.clone();
        ans.value += other.value;
        return ans;
    }
}

/**
 * Subtracts one UnitObject from the other.
 * The subtraction of a unit with another unit with an error results in an empty unit with error.
 * The subtraction of two UnitObjects that do not have the exact same unit, will result
 * in a UnitObject with no error and empty unit.
 *
 * @param  {UnitObject} other The other UnitObject that should be subtracted.
 * @return {UnitObject}       A new UnitObject that is the result of the subtraction.
 */
UnitObject.prototype.subtract = function(other) {
    var error = this.propagateError(function(x, y) { return x - y; }, other);
    if (error) {
        return error;
    }

    // Check whether the dimensions of the two objects are equal.
    // Otherwise, return a UnitObject with error and no unit.
    var ans;
    if(!this.equals(other)) {
        ans = new UnitObject(this.value - other.value, {}, "unitError");
        ans.errorString = "Subtract mismatch";
        return ans;
    } else {
        ans = this.clone();
        ans.value -= other.value;
        return ans;
    }
}

/**
 * Calculates the product of two UnitObjects.
 * The multiplication of a unit with unit with error results in an empty unit with error.
 * The multiplication of a unit with the normal unit results in itself.
 *
 * @param  {UnitObject} other The other UnitObject that should be multiplied with.
 * @return {UnitObject}       A new UnitObject that is the result of the multiplication.
 */
UnitObject.prototype.multiply = function(other) {
    var error = this.propagateError(function(x, y) { return x * y; }, other);
    if (error) {
        return error;
    }

    // Identity * Unit = Unit.
    var ans;
    if (this.isNormal()) {
        ans = other.clone();
        ans.value *= this.value;
        return ans;
    }

    // Copy over the units of the left hand side and multiply the values.
    ans = this.clone();
    ans.value *= other.value;

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
}

UnitObject.prototype.power = function(exponent) {
    var ans;

    // The exponent must be unitless.
    // Take note however, that the exponent will also always be a UnitObject.
    if (exponent.hasUnit()) {
        ans = new UnitObject(Math.pow(this.value, exponent.value), { }, "unitError");
        ans.errorString = "Exponent is not unitless";
        return ans;
    }

    // Throw an error if the exponent is not an integer.
    if (exponent % 1 !== 0) {
        ans = new UnitObject(Math.pow(this.value, exponent), { }, "unitError");
        ans.errorString = "Non integer exponent";
        return ans;
    }

    ans = this.clone();
    ans.value = Math.pow(ans.value, exponent);

    // Only modify the units if there's no error.
    if (!this.error) {
        for (var key in ans.unit) {
            ans.unit[key] += exponent;
        }
    }

    ans.clean();
    return ans;
}
