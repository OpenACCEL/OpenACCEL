/**
 * We have two environments: the browser and Node. If we are in the browser we should use requirejs and call our functions that way.
 * If we are in node, we should not and instead should just export the various modules for testing purpose.
 *
 * @author Roy Stoof
 */

/** Browser vs. Node ***********************************************/
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
define([sweetModule, "model/pass"], function(sweet, Pass) {
    /**
     * @class
     * @classdesc Classes can be defined as objects. Indiciate this using the @class param.
     */
    function UnitPass() {}

    UnitPass.prototype = new Pass();

    UnitPass.prototype.parse = function(scriptLines) {
        Pass.prototype.parse.call(this, scriptLines);
    };

    /**
     * Translate the units of a certain line into our format, such
     * that it is an object in the executable code.
     * @param  {String} units the units in a String format
     * @pre units != null
     * @pre units != undefined
     * @return {String} a String to be used in our executable code, containing the units.
     */
    translateUnits = function(units) {
        if (!units) {
            throw new Error('PreProcessor.translateUnits.pre violated' +
                'units is null or undefined');
        }
        var result = '{'; //the result of this function {@type String}
        var unitsArray = this.splitUnits(units); //the elements of the units {@type String[]}
        var inversed = false; //true when a / has occurred. All dimensions are inversed when true {@type boolean}
        for (var i = 0; i < unitsArray.length; i++) {
            if (unitsArray[i].match(/[a-zA-Z]/)) {
                result += '\'' + unitsArray[i] + '\':';
            } else if (unitsArray[i].match(/[0-9]/)) {
                if (inversed) {
                    result += '-';
                }
                result += unitsArray[i];
            } else if (unitsArray[i] === '.') {
                result += ', ';
            } else if (unitsArray[i] === '/') {
                inversed = true;
                result += ', ';
            }
        }
    };

    /**
     * Splits the string units into different components, which consists of only
     * letters, digits or symbols.
     * @param  {String} units the units in a String format
     * @return {String[]} all components of the units
     */
    splitUnits = function(units) {
        var result = [];
        var regex = /([a-zA-Z]*)([0-9]*)?(.|\/)?/g;
        var match = units.match(regex);
        var split = units.split(regex);
        for (var i = 0; i < split.length; i++) {
            if (split[i] !== '' && !(match.indexOf(split[i]) > -1)) {
                result.push(split[i]);
            }
        }
        return result;
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return UnitPass;
});