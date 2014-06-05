/*
 * This class inherits from Pass. It performs a pass on the script to be compiled.
 * This pass processes the units.
 *
 * @author Jacco Snoeren & Roel Jacobs
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["model/passes/preprocessor/compilerpass"], /**@lends Model.Passes.Preprocessor*/ function(CompilerPass) {
    /**
     * @class
     * @classdesc Classes can be defined as objects. Indicate this using the @class param.
     */
    function UnitPass() {
        this.errorMsg = '\'error\': \'uniterror\'';
    }

    UnitPass.prototype = new CompilerPass();

    UnitPass.prototype.parse = function(scriptLines, report) {
        CompilerPass.prototype.parse.call(this, scriptLines, report);

        return scriptLines.map((function(line) {
            var units = this.getUnits(line);
            if (units) {
                var newUnits = this.translateUnits(units);
                return line.replace(units, newUnits);
            } else {
                return line;
            }
        }).bind(this));
    };

    /**
     * Translates the given units.
     *
     * A unit is any expression of the form numerator or numerator/denominator,
     * where both numerator and denominator consist of zero or more factors.
     * Factors can be any string consisting of letters only, optionally followed by a positive integer, indicating the power.
     * Factors are separated by points (.).
     *
     * The output is of the form
     * "{'unit1': power1, 'unit2': power2, .... }"
     *
     * The powers of units appearing in the denominator are negative.
     *
     * In case there is an error with one of the units, the output will be
     * "{'error': 'uniterror'}"
     *
     *
     * @param  {String} units The units to translate
     * @return {String}       Translated units
     * @pre units != null && units != undefined && units != ''
     */
    UnitPass.prototype.translateUnits = function(units) {
        if (!units) {
            throw new Error('PreProcessor.translateUnits.pre violated' +
                'units is null or undefined');
        }
        var products = units.split("/"); // split the numerator and denominator
        var numerator = products[0];
        var denominator = products[1];

        if (!numerator || products.length > 2) {
            // There always has to be a numerator.
            // Also, There can be at most one devision line, so at most two
            // elements after split. So more than two is an error
            return '{' + this.errorMsg + '}';
        }

        var result = [];
        if (numerator != '1') {
            // There is a product in the numerator, so we need to translate it.
            var a = this.translateUnitProduct(numerator, false);
            if (a[0] === this.errorMsg) {
                // there was an error in the units of the numerator
                return '{' + this.errorMsg + '}';
            }
            result.push.apply(result, a); // add the results;
        }

        if (denominator) {
            // Denominator exists
            var a = this.translateUnitProduct(denominator, true);
            if (a[0] === this.errorMsg) {
                // there was an error in the units of the numerator
                return '{' + this.errorMsg + '}';
            }
            result.push.apply(result, a); // add the results;
        }

        // translation is ok
        return '{' + result.join(', ') + '}';
    };

    /**
     * Translates a string representing a product of units to an array of units
     * in the form "'unit': power".
     *
     * In case no power is given, '1', will be entered.
     *
     * In case the given product appears in the numerator of the original unit fraction,
     * then the 'negate' parameter shoul be set to false.
     *
     * In case the given product appears in the denominator of the original unit fraction,
     * then the 'negate' parameter shoul be set to true, and a '-' will be added
     * to each power.
     *
     * @param  {String} unitproduct String representing a product of units.
     *                              Each factor in this product must be separated
     *                              by a '.'', e.g 'kg.m2'
     * @param {Boolean} negate      Whether the powers of the units should be negated
     *                              (whether the factor appears in denominator).
     * @return {String[]}           Array containing the units in the given factor in the form:
     *                              "'unit': power". In case there is an error in the unit, it will
     *                              be ["'error': 'uniterror'"]
     * @pre unitproduct != null && unitproduct != undefined && unitproduct != ''
     */
    UnitPass.prototype.translateUnitProduct = function(unitproduct, negate) {
        if (!unitproduct) {
            throw new Error('PreProcessor.translateUnitProduct.pre violated');
        }
        var units = unitproduct.split('.');

        for (var i in units) {
            var newUnit = this.translateSingleUnit(units[i], negate);
            // Check if there is an error in the unit
            if (newUnit === this.errorMsg) {
                return [this.errorMsg];
            }
            units[i] = newUnit;
        }

        // Units processed correctly
        return units;
    };

    /**
     * Translates a single unit of the form 'unit power' to the form
     * "'unit': power".
     *
     * In case no power is given, '1', will be entered.
     *
     * When 'negate' is set to true, '-''will be entered before the power.
     *
     * When there is an error in the representation of the unit the result
     * wil be "'error': 'uniterror'"
     *
     * @param  {String} unit   Unit to translate
     * @param  {Boolean} negate Whether to make the powers negative.
     * @return {String}        Unit of the form "'unit': power". "'error': 'uniterror'" when there is an error.
     * @pre unit != null && unit != undefined && && unit != ''
     */
    UnitPass.prototype.translateSingleUnit = function(unit, negate) {
        if (!unit) {
            throw new Error('PreProcessor.translateSingleUnit.pre violated');
        }

        var pattern = /([a-zA-Z]+)(\d*)/; // creates to subgroups, one for the unit name, one for the power.

        var match = unit.match(pattern);

        var name = match[1];
        var power = match[2];
        var sign = negate ? "-" : "";

        // check if there are no errors in the units
        // That is, if we combine the entries of 'match', we should get
        // the original unit-string back
        if (name + power !== unit) {
            return this.errorMsg;
        }

        // make the power 1 if not present
        power = power || '1';

        return '\'' + name + '\': ' + sign + power;
    }



    // Exports are needed, such that other modules may invoke methods from this module file.
    return UnitPass;
});
