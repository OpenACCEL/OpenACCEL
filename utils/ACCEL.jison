/**
 * This file contains the ACCEL language definition in (E)BNF format and is used
 * to generate a parser for ACCEL script using Jison.
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

/** Macros used in the lexer */
digit       [0-9]
esc         \\\\
int         (?:\d+)
exp         (?:[eE][0-9]+)
frac        (?:\.[0-9]+)

/** Initialization code */
%{
    /** Define error handler */
    yy.parser.parseError = this.parseError = yy.parseError = function(message, hash) {
        yy.dummies = [];
        throw {message: message, hash: hash};
    }

    /** List of all ACCEL user-input functions */
    yy.inputfunctions = [
        /* Input elements */
        'slider',
        'input',
        'check',
        'button'
    ];

    /** List of all built-in ACCEL functions */
    yy.stdfunctions = [
        /** Functions */
        'abs',
        'acos',
        'add',
        'and',
        'asin',
        'atan',
        'atan2',
        'bin',
        'ceil',
        'cond',
        'cos',
        'cursorB',
        'cursorX',
        'cursorY',
        'debug',
        'divide',
        'do',
        'equal',
        'exp',
        'factorial',
        'floor',
        'getChan',
        'getTime',
        'getUrl',
        'greaterThan',
        'greaterThanEqual',
        'iConvolve',
        'iGaussian',
        'iMake',
        'iMedian',
        'iSpike',
        'if',
        'imply',
        'lessThan',
        'lessThanEqual',
        'ln',
        'log',
        'max',
        'min',
        'modulo',
        'multiply',
        'not',
        'notEqual',
        'or',
        'paretoHor',
        'paretoMax',
        'paretoMin',
        'paretoVer',
        'plot',
        'poisson',
        'pow',
        'putChan',
        'ramp',
        'random',
        'round',
        'sin',
        'sqrt',
        'subtract',
        'tan',
        'uniminus',
        'vAggregate',
        'vAppend',
        'vConcat',
        'vConvolve',
        'vDom',
        'vDot',
        'vEigenSystem',
        'vExtend',
        'vGaussian',
        'vLen',
        'vMake',
        'vMatInverse',
        'vMatMatMul',
        'vMatSolve',
        'vNormAbs',
        'vNormEuclid',
        'vNormFlat',
        'vNormSq',
        'vNormalize',
        'vRange',
        'vSegment',
        'vSeq',
        'vSequence',
        'vSpike',
        'vTranspose',
        'vVecRamp'
    ];

    yy.reservedwords =
    [
        'true',
        'false',
        'PI',
        'E'
    ];
    yy.reservedwords.push.apply(yy.reservedwords, yy.inputfunctions);
    yy.reservedwords.push.apply(yy.reservedwords, yy.stdfunctions);

    // Create a unit translator.
    var unitTranslator = {};
    unitTranslator.errorMsg = '\'error\': \'uniterror\'';

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
(\r)?\n                                                     { return 'LINEBREAK';   }
{int}{frac}?{exp}?\b                                        { return 'NUMBER';      }

\/\/([^\n])*                                                { yytext = yytext.slice(2); return 'COMMENT'; }

(["][^\"]*["])|(['][^\']*['])                               { return 'STRING';      }

\s*\;(.*)                                                   { yytext = this.matches[1].trim(); return 'UNIT'; }

\bPI\b                                                      { return 'PI';          }
\bE\b                                                       { return 'E';           }
\btrue\b                                                    { return 'TRUE';        }
\bfalse\b                                                   { return 'FALSE';       }
\b\w*[a-zA-Z_]\w*\b                                         %{
                                                                if (yy.stdfunctions.indexOf(yytext) > -1) {
                                                                    return 'STDFUNCTION';
                                                                } else if (yy.inputfunctions.indexOf(yytext) > -1) {
                                                                    return 'INPUTFUNCTION';
                                                                } else {
                                                                    return 'IDENTIFIER';
                                                                }
                                                            %}
"("                                                         { return '(';       }
")"                                                         { return ')';       }
"{"                                                         { return '{';       }
"}"                                                         { return '}';       }
"["                                                         { return '[';       }
"]"                                                         { return ']';       }
"."                                                         { return '.';       }
","                                                         { return ',';       }
":"                                                         { return ':';       }
";"                                                         { return ';';       }
"#("                                                        { return '#(';      }
"@("                                                        { return '@(';      }
"+"                                                         { return '+';       }
"-"                                                         { return '-';       }
"!="                                                        { return '!=';      }
"!"                                                         { return '!';       }
"*"                                                         { return '*';       }
"/"                                                         { return '/';       }
"%"                                                         { return '%';       }
"<="                                                        { return '<=';      }
"<"                                                         { return '<';       }
">="                                                        { return '>=';      }
">"                                                         { return '>';       }
"=="                                                        { return '==';      }
"&&"                                                        { return '&&';      }
"||"                                                        { return '||';      }
"="                                                         { return '=';       }

/lex



/** --------- Parser declarations section --------- */

/** Association and precedence of the various operators */
%nonassoc   ';'
%right      '='
%left       '||'
%left       '&&'
%left       '=='    '!='
%left       '<='    '<'     '>='    '>'
%left       '+'     '-'
%left       '*'     '/'     '%'
%right      '!'
%left       '['     ']'     '.'
%left       '{'     '}'
%left       '('     ')'


/** Parser configuration directives */
%ebnf               /** Enable extended BNF syntax! */
%start script       /** The non-terminal to start at */



%%
/** --------- Language grammar section --------- */

/** Structure of ACCEL script */
script                  : (scriptLine)* (scriptFinalLine)?
                        {{
                            var output = "";

                            if ($1) {
                                var length = $1.length;
                                for (var i = 0; i < length; i++) {
                                    if($1[i]) {
                                        output += "\n func(" + $1[i] + ")";
                                    }
                                }
                            }

                            if ($2) {
                                output += "\n func(" + $2 + ")";
                            }

                            return output;
                        }}
                        ;
scriptLine              :   LINEBREAK
                            { $$ = null }
                        |   quantity LINEBREAK
                        |   comment LINEBREAK
                            { $$ = null }
                        ;
scriptFinalLine         :   quantity
                        |   comment;


/** Single ACCEL script lines */
quantity                :   (quantityDef | quantityFuncDef | inputQuantityDef)
                        {{
                            // clear dummies after line has been processed
                            yy.dummies = [];
                            $$ = $1;
                        }}
                        ;
quantityFuncDef         :   funcDef '=' expr
                        {{
                            $$ = $1 + $2 + $3;
                        }}
                        ;
quantityName            :   IDENTIFIER
                            { $$ = '__' + $1 + '__'; }
                        ;
dummy                   : (STDFUNCTION | INPUTFUNCTION | quantityName)
                        {{
                            // intiialize dummies array
                            if (!yy.dummies) {
                                yy.dummies = [];
                            }
                            if (yy.dummies.indexOf($1) > -1) {
                                // already defined, which is not allowed
                                yy.parseError($1 + ' is already defined as dummy-variable', {
                                    text: $1,
                                    loc: this._$
                                });
                            }
                            yy.dummies.push($1);
                            $$ = $1;

                        }};
funcDef                 :  quantityName '(' dummy (funcDefAdditionalArg)* ')'
                        {{
                            var funcName = $1 + $2 + $3;
                            if ($4 && $4.length > 0) {
                                $$ = funcName + ',' + $4 + $5;
                            } else {
                                $$ = funcName + $5;
                            }
                        }}
                        ;
funcDefAdditionalArg    :   ',' dummy
                            { $$ = $2 }
                        ;
quantityDef             :   quantityName '=' expr (UNIT)?
                        {{
                            var defStr = $1 + $2 + $3;

                            // Translate units to objects if present.
                            if ($4 && $4.length > 0) {
                                defStr += " ; " + yy.unitTranslator.translateUnits($4);
                            }

                            $$ = defStr;
                        }}
                        ;
inputQuantityDef        :   quantityName '=' inputCall (UNIT)?
                        {{
                            var defStr = $1 + $2 + $3;

                            // Translate units to objects if present.
                            if ($4 && $4.length > 0) {
                                defStr += " ; " + yy.unitTranslator.translateUnits($4);
                            }

                            $$ = defStr;
                        }}
                        ;
comment                 :   COMMENT
                            { $$ = ""; }
                        ;


/** Expressions */
expr                    :   term | arith;
term                    :   scalarTerm | vectorExpr | scalarConst;


/* Arithmetic */
arith                   :   uniArith | binArith;
uniArith                :   '-' expr %prec '!'
                            { $$ = 'uniminus(' + $2 + ')'; }
                        |  '+' expr %prec '!'
                            { $$ = $2; }
                        |  '!' expr
                            { $$ = 'not(' + $2 + ')'; }
                        ;
binArith                :  /* Operator precedence defined above */
                            expr '+' expr
                            { $$ = 'add(' + $1 + ',' + $3 + ')'; }
                        |   expr '-' expr
                            { $$ = 'subtract(' + $1 + ',' + $3 + ')'; }
                        |   expr '*' expr
                            { $$ = 'multiply(' + $1 + ',' + $3 + ')'; }
                        |   expr '/' expr
                            { $$ = 'divide(' + $1 + ',' + $3 + ')'; }
                        |   expr '%' expr
                            { $$ = 'modulo(' + $1 + ',' + $3 + ')'; }
                        |   expr '<=' expr
                            { $$ = 'lessThanEqual(' + $1 + ',' + $3 + ')'; }
                        |   expr '<' expr
                            { $$ = 'lessThan(' + $1 + ',' + $3 + ')'; }
                        |   expr '>=' expr
                            { $$ = 'greaterThanEqual(' + $1 + ',' + $3 + ')'; }
                        |   expr '>' expr
                            { $$ = 'greaterThan(' + $1 + ',' + $3 + ')'; }
                        |   expr '==' expr
                            { $$ = 'equal(' + $1 + ',' + $3 + ')'; }
                        |   expr '!=' expr
                            { $$ = 'notEqual(' + $1 + ',' + $3 + ')'; }
                        |   expr '&&' expr
                            { $$ = 'and(' + $1 + ',' + $3 + ')'; }
                        |   expr '||' expr
                            { $$ = 'or(' + $1 + ',' + $3 + ')'; }
                        ;


/* Scalars */
scalarTerm              :   scalarVar | funcCall | quantifier | brackets | vectorCall | historyVar | at;
scalarVar               :   quantityName
                        {{
                            if (yy.dummies && yy.dummies.indexOf($1) > -1) {
                                $$ = $1;
                            } else {
                                $$ = 'this.' + $1 + '()';
                            }

                            //$$ = '((typeof ' + $1 + ' !== \'undefined\') ? ' + $1 + ' : this.' + $1 + '())';
                        }}
                        |   (STDFUNCTION | INPUTFUNCTION)
                        {{
                            // check if this function name is used as a parameter or dummy
                            // which is allowed. But using a function name as quantity
                            // is not.
                            if (yy.dummies && yy.dummies.indexOf($1) > -1) {
                                $$ = $1;
                            } else {
                                yy.parseError($1 + ' is a standard ACCEL function', {
                                    text: $1,
                                    loc: this._$
                                });
                            }
                        }}
                        ;
historyVar              :   scalarVar '{' expr '}'
                        {{
                            if (yy.dummies && yy.dummies.indexOf($1) > -1) {
                                // Cannot ask for the history of a parameter
                                yy.parseError('Dummy variables cannot have history', {
                                    text: 'history of ' + $1,
                                    loc: this._$
                                });
                            }
                            $$ = "history(" + $1 + "," + $3 + ")";
                        }}
                        ;
scalarConst             :   NUMBER | STRING | predefinedConstant;
predefinedConstant      :   PI
                            { $$ = 'Math.PI'; }
                        |   E
                            { $$ = 'Math.E'; }
                        |   TRUE
                            { $$ = 'true'; }
                        |   FALSE
                            { $$ = 'false'; }
                        ;

funcCall                :   STDFUNCTION '(' expr? (funcCallArgList)* ')'
                        {{
                            var funcname;
                            if($1 === 'if' || $1 === 'do') {
                                //needs underscores as it is a javascript keyword
                                funcname = '__' + $1 + '__';
                            } else {
                                funcname = $1;
                            }
                            var funcCall = funcname + $2 + ($3 || '');
                            if ($4 && $4.length > 0) {
                                $$ = funcCall + ',' + $4 + $5;
                            } else {
                                $$ = funcCall + $5;
                            }
                        }}
                        |   quantityName '(' expr? (funcCallArgList)* ')'
                        {{
                            var funcCall = 'this.' + $1 + $2 + ($3 || '');
                            if ($4 && $4.length > 0) {
                                $$ = funcCall + ',' + $4 + $5;
                            } else {
                                $$ = funcCall + $5;
                            }
                       }}
                        ;
inputCall               :   INPUTFUNCTION '(' (scalarConst | (('+'|'-') NUMBER))? (inputCallArgList)* ')'
                        {{
                            $$ = 'null';
                        }}
                        ;
funcCallArgList         :   ',' expr
                            { $$ = $2; }
                        ;
inputCallArgList        :   ',' (scalarConst | (('+'|'-') NUMBER))
                            { $$ = $2; }
                        ;

quantifier              :  '#(' dummy ',' expr ',' expr ',' STDFUNCTION ')'
                            {{
                                // Remove the dummy variable from the list of
                                var idx = yy.dummies.indexOf($2);
                                yy.dummies.splice(idx,1);
                                $$ = "quantifier(" + $2 + $3 + $4 + $5 + $6 + $7 + $8 + $9;
                            }}
                        ;
at                      :   '@(' expr  ','  expr  ')'
                            { $$ = 'at(' + $2 + $3 + $4 +  $5; }
                        ;
brackets                :   '(' expr ')'
                            { $$ = $1 + $2 + $3; }
                        ;


/** Vectors */
vectorExpr              :   '[' (vectorArgList)? ']'
                            { $$ = 'objectToArray({' + ($2 || '') + '})'; };
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
                            { $$ = $2 }
                        ;
vectorElem              :   STRING ':' expr
                            { $$ = { index:$1, value:$3}; }
                        |   IDENTIFIER ':' expr
                            { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                        |   STDFUNCTION ':' expr
                            { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                        |   INPUTFUNCTION ':' expr
                            { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                        |   NUMBER ':' expr
                            { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                        |   expr
                            { $$ = { value:$1 }; }
                        ;

vectorCall              :   scalarTerm '[' expr ']'
                            { $$ = 'at(' + $1 + ', ' + $3 + ')'; }
                        |   scalarTerm '.' IDENTIFIER
                            { $$ = 'at(' + $1 + ', \'' + $3 + '\')'; }
                        |   scalarTerm '.' STDFUNCTION
                            { $$ = 'at(' + $1 + ', \'' + $3 + '\')'; }
                        |   scalarTerm '.' INPUTFUNCTION
                            { $$ = 'at(' + $1 + ', \'' + $3 + '\')'; }
                        |   scalarTerm '.' NUMBER
                            { $$ = 'at(' + $1 + ', ' + $3 + ')'; }
                        ;

%%
