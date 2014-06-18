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
int         (-)?(?:[0-9]|[1-9][0-9]+)
exp         (?:[eE][-+]?[0-9]+)
frac        (?:\.[0-9]+)
unit        [a-zA-Z]+[0-9]*  


/** Initialization code */
%{
    /** Define error handler */
    yy.parser.parseError = this.parseError = yy.parseError = function(message, hash) {
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
[ \t]                                                       { /* Ignore all whitespace characters except newlines */; }
(\r)?\n                                                     { return 'LINEBREAK';   }
{int}{frac}?{exp}?\b                                        { return 'NUMBER';      }

\/\/([^\n])*                                                { yytext = yytext.slice(2); return 'COMMENT'; }

(\"[^"]*\")|(\'[^']*\')                                     { return 'STRING';      }

\;.* { yytext = this.matches[1]; return 'UNIT'; }

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
quantity                :   quantityDef | quantityFuncDef | inputQuantityDef;
quantityFuncDef         :   funcDef '=' expr
                            { $$ = $1 + $2 + $3; }
                        ;
quantityName            :   IDENTIFIER
                            { $$ = '__' + $1 + '__'; } 
                        ;                    
dummy                   : STDFUNCTION | INPUTFUNCTION | quantityName;
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
                            $$ = defStr;
                        }}
                        ;
inputQuantityDef        :   quantityName '=' inputCall (UNIT)?
                        {{ 
                            var defStr = $1 + $2 + $3;
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
                            { $$ = '((typeof ' + $1 + ' !== \'undefined\') ? ' + $1 + ' : this.' + $1 + '())'; }
                        |   STDFUNCTION
                        |   INPUTFUNCTION
                        ;
historyVar              :   scalarVar '{' expr '}'
                            { $$ = "history(" + $1 + "," + $3 + ")"; }
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
inputCall               :   INPUTFUNCTION '(' scalarConst? (inputCallArgList)* ')'
                        {{
                            $$ = 'null';
                        }}
                        ;
funcCallArgList         :   ',' expr
                            { $$ = $2; }
                        ;
inputCallArgList        :   ',' scalarConst
                            { $$ = $2; }
                        ;

quantifier              :  '#(' dummy ',' expr ',' expr ',' STDFUNCTION ')'
                            { $$ = "quantifier(" + $2 + $3 + $4 + $5 + $6 + $7 + $8 + $9; }
                        ;
at                      :   '@(' expr  ','  expr  ')'
                            { $$ = 'at(' + $2 + $3 + $4 +  $5; }
                        ;
brackets                :   '(' expr ')'
                            { $$ = $1 + $2 + $3; }
                        ;


/** Vectors */
vectorExpr              :   '[' (vectorArgList)? ']'
                            { $$ = '{' + ($2 || '') + '}'; };
vectorArgList           :   vectorElem (vectorAdditionalArg)*
                        {{ 
                            var counter = 0;

                            function createElement(elemObj) {
                                return (elemObj.index || '\'' + counter++ + '\'') + ':' + elemObj.value
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
