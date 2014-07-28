/**
 * This file contains the ACCEL language unit definition in (E)BNF format and is used
 * to generate a parser for ACCEL units using Jison.
 *
 * The syntax is largely the same as that of the input files for Flex and Bison,
 * see:
 *
 * Jison documentation: http://zaach.github.io/jison/docs/#specifying-a-language
 * Flex input file: http://dinosaur.compilertools.net/flex/flex_6.html#SEC6
 * Bison input file: http://dinosaur.compilertools.net/bison/bison_6.html#SEC41
 */

%lex
/** --------- Lexer macros and initialization section --------- */

/** Initialization code */
%{
    /** Define error handler */
    yy.parser.parseError = this.parseError = yy.parseError = function(message, hash) {
        yy.dummies = [];
        throw {message: message, hash: hash};
    }

    // Create a unit translator.
    var unitTranslator = {};
    unitTranslator.errorMsg = '\'error\': \'Translation error.\'';

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
     * "{'error': 'Translation error.'}"
     *
     * @param  {String} units The units to translate
     * @return {String}       Translated units
     * @pre units != null && units != undefined && units != ''
     */
    unitTranslator.translateUnits = function(units) {
        if (!units) {
            throw new Error('UnitTranslator.translateUnits.pre violated' +
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
    unitTranslator.translateUnitProduct = function(unitproduct, negate) {
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
    unitTranslator.translateSingleUnit = function(unit, negate) {
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

    yy.unitTranslator = unitTranslator;
%}

%%
/* --------- Lexer definitions section --------- */
[^\S\n]+                                                    { /* Ignore all whitespace characters except newlines */ }
\b[a-zA-Z0-9\.\/]+\b                                        { return 'UNIT';        }
(["][^\"]*["])|(['][^\']*['])                               { return 'STRING';      }
"["                                                         { return '[';           }
"]"                                                         { return ']';           }
":"                                                         { return ':';           }
","                                                         { return ',';           }

/lex

/** --------- Parser declarations section --------- */

/** Parser configuration directives */
%ebnf               /** Enable extended BNF syntax! */
%start start        /** The non-terminal to start at */

%%
/** --------- Language grammar section --------- */

start                   :   unit
                        {{
                            return $1;
                        }}
                        ;

unit                    :   UNIT
                        {{
                            $$ = yy.unitTranslator.translateUnits($1);
                        }}
                        |   '[' vectorArgList ']'
                        {{
                            $$ = 'objectToArray({' + $2 + '}, true)';
                        }}
                        ;

vectorArgList           :   vectorElem (vectorAdditionalArg)*
                        {{
                            var counter = 0;

                            function createElement(elemObj) {
                                return (elemObj.index || '\'' + counter++ + '\'') + ':' + elemObj.value;
                            }

                            var result = createElement($1);

                            for(var key in $2) {
                                result += ',' + createElement($2[key]);
                            }

                            $$ = result;
                        }}
                        ;

vectorAdditionalArg     :   ',' vectorElem
                        {{
                            $$ = $2
                        }}
                        ;

vectorElem              :   UNIT ':' unit
                            {{
                                $$ = { index: $1, value: $3};
                            }}
                        |   STRING ':' unit
                            {{
                                $$ = { index: $1, value: $3};
                            }}
                        |   unit
                            {{
                                $$ = { value: $1 };
                            }}
                        ;
