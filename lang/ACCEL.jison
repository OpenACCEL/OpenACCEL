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
"|"                                                         { return '|';       }
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

/**
 * An OpenACCEL script consists of multiple lines.
 * Each script line gets wrapped inside the 'func' macro, which gets expanded by sweet, but
 * in the future may be delegated to this file instead.
 * 
 * An example of a script would be:
 * x = 5 <LINEBREAK>
 * // myComment <LINEBREAK>
 * y = x + 6
 *
 * The 'func' macro expansion adds for each quantity (scriptline) a few functions that are required
 * to retrieve its value.
 * 
 * Comments and linebreaks are considered scriptlines, but whatever they could possibly return should
 * not be in the func macro. Hence, when they are deteced they return '$$ = null', such that we can
 * skip the wrapping of the func macro for them.
 */
script                  :   (scriptLine)* (scriptFinalLine)?
                        {{
                            var output = "";

                            // If there are one or multiple scriptlines, wrap each single line in the func macro.
                            if ($1) {
                                var length = $1.length;
                                for (var i = 0; i < length; i++) {
                                    if($1[i]) {
                                        output += "func(" + $1[i] + ")\n";
                                    }
                                }
                            }

                            if ($2) {
                                output += "func(" + $2 + ")\n";
                            }

                            return output;
                        }}
                        ;

/**
 * A single script line is either a line break by itself, or a either a quantity or comment, followed by a line break.
 * 
 * Line breaks and comments (with linebreaks) are not needed for the compilation and creation of the executable,
 * hence they get dropped from the output of the parser.
 */
scriptLine              :   LINEBREAK
                        {{
                            $$ = null;
                        }}
                        |   quantity LINEBREAK
                        |   comment LINEBREAK
                        ;

/**
 * The last line of a script is exactly like a normal scriptLine, except for the fact that it does not end with a linebreak.
 */
scriptFinalLine         :   quantity
                        |   comment
                        ;










/** Single ACCEL script lines */

/**
 * Comments need not to be wrapped inside the 'func' macro, hence we return null.
 */
comment                 :   COMMENT
                            { $$ = null; }
                        ;

/**
 * A quantity is a script line in the form:
 * <name> = <expr>
 * <name> = <input function>
 * <function>(<arguments>) = <expr>
 * 
 * That is, a quantity can be a simple quantity definition, or it can be a function which takes arguments.
 */
quantity                :   (quantityDef | quantityInput | quantityFuncDef)
                        {{
                            // Parsing a possible previous line may have filled in the dummies array
                            // if it were a function definition with arguments. Clean it for now.
                            yy.dummies = [];
                            $$ = $1;
                        }}
                        ;

/**
 * A quantity definition is just like a mathematical equation.
 * 
 * On the left hand side there will be the name of the quantity.
 * On the right hand side the expression of that quantity is placed.
 * Additionally, a quantity may have a unit, which gets ignored as these are parsed seperately.
 */
quantityDef             :   quantityName '=' expr (UNIT)?
                        {{
                            // Ignore units, there is a seperate parser for those.
                            $$ = $1 + $2 + $3;
                        }}
                        ;

/**
 * A quantity input is exactly like a normal quantity definition, but instead of an expression
 * the right hand side will be a call to one of the defined user input functions.
 */
quantityInput           :   quantityName '=' inputCall (UNIT)?
                        {{
                            // Ignore units, there is a seperate parser for those.
                            $$ = $1 + $2 + $3;
                        }}
                        ;

/**
 * The quantity name is really an identifier, which means it can be anything.
 * However, in order to allow starting quantity names with numbers, we put the quantity name
 * between underscores.
 */
quantityName            :   IDENTIFIER
                        {{
                            $$ = "__" + $1 + "__";
                        }}
                        ;

/**
 * A quantity function is just like a normal quantitify definition as well, except for a quantity name,
 * it takes parenthesis and additional arguments as well.
 */
quantityFuncDef         :   quantityFuncName '=' expr
                        {{
                            $$ = $1 + $2 + $3;
                        }}
                        ;

/**
 * In addition to a quantity name, a quantity function name takes on parenthesis with optional
 * arguments as well. These arguments will be referred to as 'dummy' variables, because they
 * overshadow any previously defined variable (like a quantity) sharing the same name.
 */
quantityFuncName        :   quantityName '(' dummy (dummyAdditional)* ')'
                        {{
                            var funcName = $1 + $2 + $3;
                            if ($4 && $4.length > 0) {
                                $$ = funcName + "," + $4 + $5;
                            } else {
                                $$ = funcName + $5;
                            }
                        }}
                        ;

/**
 * A dummy variable is one of the arguments of a quantity function.
 * Dummies can have the same name as anything but constants, and overshadow
 * the variable in an outer scope that share the same name.
 */
dummy                   :   (STDFUNCTION | INPUTFUNCTION | quantityName)
                        {{
                            // Intiialize dummies array.
                            if (!yy.dummies) {
                                yy.dummies = [];
                            }

                            if (yy.dummies.indexOf($1) > -1) {
                                // Already defined, which is not allowed.
                                yy.parseError($1 + " is already defined as dummy-variable", {
                                    text: $1,
                                    loc: this._$
                                });
                            }

                            yy.dummies.push($1);
                            $$ = $1;
                        }}
                        ;

/**
 * Additional dummies in a quantity function definition are comma seperated, we only need the dummy name.
 */
dummyAdditional         :   ',' dummy
                        {{
                            $$ = $2;
                        }}
                        ;










/** Expressions */

/**
 * Expressions are either simple arithmetic expressions, or 'terms'.
 */
expr                    :   arith | term;

/**
 * Arithmetics are computed using symbols. OpenACCEL supports mathematical operators that take
 * one argument, the so called unary operators, and mathematical operators that take 
 * two arguments, the so called binary operators.
 * 
 * Both unary and binary operators get translated into their corresponding library function names.
 */
arith                   :   uniArith | binArith;

/**
 * Unary operators are mathematical symbols followed by an arbitrary expression.
 */
uniArith                :  '-' expr %prec '!'
                            { $$ = "uniminus(" + $2 + ")"; }
                        |  '+' expr %prec '!'
                            { $$ = $2; }
                        |  '!' expr
                            { $$ = "not(" + $2 + ")"; }
                        ;

/**
 * Binary operarators are mathematical symbols that go between an arbitray expression
 * on the left, and an arbitrary expression on the right.
 */
binArith                :   /* Operator precedence defined above */
                            expr '+' expr
                            { $$ = "add(" + $1 + "," + $3 + ")"; }
                        |   expr '-' expr
                            { $$ = "subtract(" + $1 + "," + $3 + ")"; }
                        |   expr '*' expr
                            { $$ = "multiply(" + $1 + "," + $3 + ")"; }
                        |   expr '/' expr
                            { $$ = "divide(" + $1 + "," + $3 + ")"; }
                        |   expr '%' expr
                            { $$ = "modulo(" + $1 + "," + $3 + ")"; }
                        |   expr '<=' expr
                            { $$ = "lessThanEqual(" + $1 + "," + $3 + ")"; }
                        |   expr '<' expr
                            { $$ = "lessThan(" + $1 + "," + $3 + ")"; }
                        |   expr '>=' expr
                            { $$ = "greaterThanEqual(" + $1 + "," + $3 + ")"; }
                        |   expr '>' expr
                            { $$ = "greaterThan(" + $1 + "," + $3 + ")"; }
                        |   expr '==' expr
                            { $$ = "equal(" + $1 + "," + $3 + ")"; }
                        |   expr '!=' expr
                            { $$ = "notEqual(" + $1 + "," + $3 + ")"; }
                        |   expr '&&' expr
                            { $$ = "and(" + $1 + "," + $3 + ")"; }
                        |   expr '||' expr
                            { $$ = "or(" + $1 + "," + $3 + ")"; }
                        ;

/**
 * A term is basically a sub-expressions that is not tied to any of the mathmatical operators.
 * This includes vector expressions, constants and scalar terms.
 */
term                    :   scalarConst | scalarTerm | vectorExpr;

/**
 * Scalar constants are exactly what they are, constants. They do not need any more computations
 * or modifications. Aside from numbers and strings, there are a few predefined constants in OpenACCEl.
 */
scalarConst             :   NUMBER | STRING | predefinedConstant;
predefinedConstant      :   PI
                            {{ $$ = "Math.PI"; }}
                        |   E
                            {{ $$ = "Math.E"; }}
                        |   TRUE
                            {{ $$ = "true"; }}
                        |   FALSE
                            {{ $$ = "false"; }}
                        ;

/**
 * A scalar term is an action based on a single entity. Aside from vector calls, they do not
 * rely on how vectors work.
 */
scalarTerm              :   brackets | scalarVar | history | quantifier | at | funcCall | vectorCall;

/**
 * An expression between brackets is defined as a scalarTerm.
 * It is not defined as an expression itself as well because there were previous issues with operator precedence.
 */
brackets                :   '(' expr ')'
                        {{ 
                            $$ = $1 + $2 + $3;
                        }}
                        ;

/**
 * A scalar variable is a variable pointing to the *value* of a single entity, like a quantity.
 * When it's a dummy quantity name, it should refer to a quantity.
 * Quantity values can be computed with 'this.__qtyName__'.
 * 
 * However, when the quantityName is a dummy variable, it should overshadow the quantity names,
 * and therefore should refer to a local variable. Therefore, it's not a function and not part of 'this'.
 */
scalarVar               :   quantityName
                        {{
                            if (yy.dummies && yy.dummies.indexOf($1) > -1) {
                                $$ = $1;
                            } else {
                                $$ = "this." + $1 + "()";
                            }
                        }}
                        |   (STDFUNCTION | INPUTFUNCTION)
                        {{
                            // check if this function name is used as a parameter or dummy
                            // which is allowed. But using a function name as quantity
                            // is not.
                            if (yy.dummies && yy.dummies.indexOf($1) > -1) {
                                $$ = $1;
                            } else {
                                yy.parseError($1 + " is a standard ACCEL function", {
                                    text: $1,
                                    loc: this._$
                                });
                            }
                        }}
                        ;

/**
 * The history 'operator'. Given a quantity q, one can retrieve a past value 'a' steps ago
 * with the format 'q{a}'. 'a' Can be any expression.
 *
 * Optionally, a user can add a base case 'b' in the form of q{a|b}.
 * This base case will be the default value in case there is no history value 'a' steps back.
 * When this base case is not given, the default value of zero will be returned.
 * 
 * A scalarVar however can also be a dummy variable, which is not supported by the history operator.
 */
history                 :   scalarVar '{' expr (historyBase)?'}'
                        {{
                            if (yy.dummies && yy.dummies.indexOf($1) > -1) {
                                // Cannot ask for the history of a parameter.
                                yy.parseError("Dummy variables cannot have history", {
                                    text: "history of " + $1,
                                    loc: this._$
                                });
                            }

                            // If the quantity is not a dummy variable, we are guaranteed it is in the format
                            // 'this.__$1__()'. We can use this information to pass the quantity string to the library function.
                            var qty = $1.split("__")[1];

                            // Check for a base case 'b'. We wrap this base case 'b' in function instead of directly
                            // executing it, as a means of optimization. This way the value of 'b' will not always be
                            // unnecessaryily calculated. We expect that the base case will not be called often anyway.
                            if ($4 && $4.length > 0) {
                                $$ = "history('__" + qty + "__'," + $3 + ",(function(){return " + $4 + ";}).bind(this))";
                            } else {
                                $$ = "history('__" + qty + "__'," + $3 + ")";
                            }
                        }}
                        ;

/**
 * The optional base case for the hisotry operator.
 * When this base case is not given, the history operator will return zero instead,
 * when there exists no history value that 'a' steps ago.
 */
historyBase             :   '|' expr
                        {{
                            $$ = $2;
                        }}
                        ;

/**
 * Quantifier as defined by the language.
 * 
 * #(i, [1, 2, 3, 4], i * i, add) = 1 * 1 + 2 * 2 + 3 * 3 + 4 * 4 + 5 * 5.
 */
quantifier              :  '#(' dummy ',' expr ',' expr ',' STDFUNCTION ')'
                            {{
                                // Remove the dummy variable from the list.
                                var idx = yy.dummies.indexOf($2);
                                yy.dummies.splice(idx,1);
                                $$ = "quantifier(" + $2 + $3 + $4 + $5 + $6 + $7 + $8 + $9;
                            }}
                        ;

/**
 * Additional syntax of calling the n't element of a vector.
 */
at                      :   '@(' expr  ','  expr  ')'
                            { $$ = "at(" + $2 + $3 + $4 +  $5; }
                        ;

/**
 * A function call is really what is it, a function call.
 * 
 * If the function is a standard function, additional pre-processing is needed.
 */
funcCall                :   STDFUNCTION '(' expr? (funcCallArgList)* ')'
                        {{
                            var funcname;
                            if($1 === 'if' || $1 === 'do') {
                                // Needs underscores as it is a javascript keyword.
                                funcname = "__" + $1 + "__";
                            } else {
                                funcname = $1;
                            }
                            var funcCall = funcname + $2 + ($3 || '');
                            if ($4 && $4.length > 0) {
                                $$ = funcCall + "," + $4 + $5;
                            } else {
                                $$ = funcCall + $5;
                            }
                        }}
                        |   quantityName '(' expr? (funcCallArgList)* ')'
                        {{
                            var funcCall = "this." + $1 + $2 + ($3 || "");
                            if ($4 && $4.length > 0) {
                                $$ = funcCall + "," + $4 + $5;
                            } else {
                                $$ = funcCall + $5;
                            }
                        }}
                        ;

funcCallArgList         :   ',' expr
                        {{
                            $$ = $2;
                        }}
                        ;

inputCall               :   INPUTFUNCTION '(' (scalarConst | (('+'|'-') NUMBER))? (inputCallArgList)* ')'
                        {{
                            $$ = "null";
                        }}
                        ;
inputCallArgList        :   ',' (scalarConst | (('+'|'-') NUMBER))
                        {{
                            $$ = $2;
                        }}
                        ;










/** Vectors */

/**
 * A vector expression is an expressions that creates a vector.
 * A vector is defined by a number of comma-separated expressions between [] brackets.
 * 
 * In order to support named vectors, vector actually get created as if they were objects.
 * These objects then get converted into actual javascript arrays. This is because in javascript,
 * arrays do not support named elements.
 * 
 * An empty array is possible.
 */
vectorExpr              :   '[' (vectorArgList)? ']'
                        {{
                            if ($2 && $2.length > 0)  {
                                $$ = "objectToArray({" + ($2 || "") + "})";
                            }
                            else {
                                $$ = "[]";
                            }
                        }}
                        ;

/**
 * A list of vector arguments consists out of one vector element, with possible additional vector elements.
 * 
 * If a vector element is not named, it needs to have an index. Hence, the counter is there to give
 * all non-named elements an index.
 */
vectorArgList           :   vectorElem (vectorAdditionalArg)*
                        {{
                            var counter = 0;

                            function createElement(elemObj) {
                                return (elemObj.index || "'" + counter++ + "'") + ":" + elemObj.value;
                            }

                            var result = createElement($1);

                            for(var key in $2) {
                                result += "," + createElement($2[key]);
                            }
                            $$ = result;
                        }}
                        ;

/**
 * Additional vector elements are comma-separated. We are only interested in the element.
 */
vectorAdditionalArg     :   ',' vectorElem
                        {{
                            $$ = $2;
                        }}
                        ;

/**
 * A vector element can either be just an expression, or be a named object with an expression.
 * 
 * A vector element returns an object, where the expression gets stored into a 'value' property.
 * If the vector is also named, its name gets put into the 'index' property.
 */
vectorElem              :   STRING ':' expr
                        {{
                            $$ = { index:  $1, value: $3};
                        }}
                        |   IDENTIFIER ':' expr
                        {{
                            $$ = { index: "'" + $1 + "'", value: $3};
                        }}
                        |   STDFUNCTION ':' expr
                        {{
                            $$ = { index: "'" + $1 + "'", value: $3};
                        }}
                        |   INPUTFUNCTION ':' expr
                        {{
                            $$ = { index: "'" + $1 + "'", value: $3};
                        }}
                        |   NUMBER ':' expr
                        {{
                            $$ = { index: "'" + $1 + "'", value: $3};
                        }}
                        |   expr
                        {{
                            $$ = { value: $1 };
                        }}
                        ;

/**
 * Calling the value at a specific index of a vector.
 */
vectorCall              :   scalarTerm '[' expr ']'
                            { $$ = "at(" + $1 + ", " + $3 + ")"; }
                        |   scalarTerm '.' IDENTIFIER
                            { $$ = "at(" + $1 + ", '" + $3 + "')"; }
                        |   scalarTerm '.' STDFUNCTION
                            { $$ = "at(" + $1 + ", '" + $3 + "')"; }
                        |   scalarTerm '.' INPUTFUNCTION
                            { $$ = "at(" + $1 + ", '" + $3 + "')"; }
                        |   scalarTerm '.' NUMBER
                            { $$ = "at(" + $1 + ", " + $3 + ")"; }
                        ;

%%
