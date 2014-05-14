/**
 * This class inherits from Pass. It performs a pass on the script to be compiled.
 * This pass processes the units.
 *
 * @author Jacco Snoeren
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    sweetModule = "sweet.js";
} else {
    sweetModule = "sweet";

    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: "scripts"
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define([sweetModule, "model/passes/pass"], function(sweet, Pass) {
    /**
     * @class
     * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
     */
    function UnitPass() {}

    UnitPass.prototype = new Pass();

    UnitPass.prototype.parse = function(scriptLines) {
        Pass.prototype.parse.call(this, scriptLines);
        var lines = []; //The result of this function {@type String[]}
        for (var i = 0; i < scriptLines; i++) {
            var line = scriptLines[i];
            var units = Pass.prototype.getUnits.call(this, line);
            units = this.translateUnits(units);
            var result = this.getLHS(line) + // left hand side
            ' = ' +
                this.getRHS(this.getRHS(line)) + // translated right hand side
            ((units) ? ' ; ' + units : ''); // units if needed

            lines.push(result);
        }
        return lines;
    };

    /**
     * Translate the units of a certain line into our format, such
     * that it is an object in the executable code.
     * @param  {String} units the units in a String format
     * @pre units != null
     * @pre units != undefined
     * @return {String} a String to be used in our executable code, containing the units.
     */
    UnitPass.prototype.translateUnits = function(units) {
        if (!units) {
            throw new Error('PreProcessor.translateUnits.pre violated' +
                'units is null or undefined');
        }
        var result = '{'; //the result of this function {@type String}
        var unitsArray = UnitPass.prototype.splitUnits(units); //the elements of the units {@type String[]}
        var inverted = false; //true when a / has occurred. All dimensions are inversed when true {@type boolean}
        for (var i = 0; i < unitsArray.length; i++) {
            if (unitsArray[i].match(/[a-zA-Z]/)) {
                result += '\'' + unitsArray[i] + '\': ';
            } else if (unitsArray[i].match(/[0-9]/)) {
                if (inverted) {
                    result += '-';
                }
                result += unitsArray[i];
            } else if (unitsArray[i] === '.') {
                result += ', ';
            } else if (unitsArray[i] === '/') {
                inverted = true;
                result += ', ';
            }
        }
        result += '}';
        return result;
    };

    /**
     * Splits the string units into different components, which consists of only
     * letters, digits or symbols.
     * @param  {String} units the units in a String format
     * @return {String[]} all components of the units
     */
    UnitPass.prototype.splitUnits = function(units) {
        var result = [];
        var regex = /(([a-zA-Z]*)([0-9]*)([.\/]?)([a-zA-Z]*)([0-9]*))/g;
        var match = units.match(regex);
        var split = units.split(regex);
        for (var i = 0; i < split.length; i++) {
            if (split[i] !== '' && !(match.indexOf(split[i]) > -1)) {
                result.push(split[i]);
            }
        }
        result = this.addDimensionOne(result);
        return result;
    };

    /**
     * Adds the dimension one to the array of units where it is explicit.
     * @pre unitArray != null
     * @pre unitArray != undefined
     * @param {String[]} unitArray the elements of the units
     * @return {String[]} the same unit array, with implicit dimension one added
     */
    UnitPass.prototype.addDimensionOne = function(unitArray) {
        if (!unitArray) {
            throw new Error('PreProcessor.translateUnits.pre violated' +
                'units is null or undefined');
        }
        var result = [];
        for (var i = 0; i < unitArray.length; i++) {
            result.push(unitArray[i]);
            //if the current character is a letter and we are either at the end or the next character is not a number, we add dimension one
            if (unitArray[i].match(/[a-zA-Z]/) && ((i === unitArray.length - 1) || !unitArray[i + 1].match(/[0-9]/))) {
                result.push('1');
            }
        }
        return result;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return UnitPass;
});