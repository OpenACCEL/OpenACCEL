/*
This file contains the ACCEL language definition in (E)BNF format and is used
to generate a parser for ACCEL script using Jison.

The syntax is largely the same as that of the input files for Flex and Bison,
see:

Jison documentation: http://zaach.github.io/jison/docs/#specifying-a-language
Flex input file: http://dinosaur.compilertools.net/flex/flex_6.html#SEC6
Bison input file: http://dinosaur.compilertools.net/bison/bison_6.html#SEC41
*/


%lex 
/* --------- Lexer macros and initialization section --------- */   

/* Macros used in the lexer */
digit                       [0-9]
esc                         \\\\
int                         (-)?(?:[0-9]|[1-9][0-9]+)
exp                         (?:[eE][-+]?[0-9]+)
frac                        (?:\\.[0-9]+)
unit                        [a-zA-Z]+[0-9]*  


/* Initialization code */
%{
    /* Variables accesible in actions and user code at the end of this file */ 
    var parser = yy.parser;

    /* Define error handler */
    parser.parseError = function(message, hash) {
        throw {message: message, hash: hash};
    }

    /* List of all built-in ACCEL functions */
    parser.stdfunctions = [
      'slider',
      'input',
      'check',
      'button',
      '@',
      'abs',
      'acos',
      'add',
      'and',
      'asin',
      'atan',
      'atan2',
      'bin',
      'button',
      'ceil',
      'check',
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
      'input',
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
      'slider',
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

%}               



%%
/* --------- Lexer definitions section --------- */
[ \t]                                                       { /* Ignore all whitespace characters except newlines */; }
(\r)?\n                                                     { return 'LINEBREAK'; }
{int}{frac}?{exp}?\b                                        { return 'NUMBER'; }

\/\/([^\n])*                                                { yytext = yytext.slice(2); return 'COMMENT'; }

(\"[^"]*\")|(\'[^']*\')                                     { yytext = yytext.slice(1,yyleng-1); return 'STRING'; }

\;\s*((1|({unit}(\.{unit})?))(\s*\/\s*({unit}(\.{unit})?))?) { yytext = this.matches[1]; return 'UNIT'; }

\b\w*[a-zA-Z_]\w*\b                                         %{ if (parser.stdfunctions.indexOf(yytext) == -1) { 
                                                                  return 'IDENTIFIER'; 
                                                               } else { 
                                                                  return 'STDFUNCTION'; 
                                                               } 
                                                            %}

\bPI\b                                                      { return 'PI'; }
\bE\b                                                       { return 'E'; }
\btrue\b                                                    { return 'TRUE'; }
\bfalse\b                                                   { return 'FALSE'; }
"("                                                         { return '('; }
")"                                                         { return ')'; }
"{"                                                         { return '{'; }
"}"                                                         { return '}'; }
"["                                                         { return '['; }
"]"                                                         { return ']'; }
"."                                                         { return '.'; }
","                                                         { return ','; }
":"                                                         { return ':'; }
";"                                                         { return ';'; }
"#("                                                        { return '#('; }
"+"                                                         { return '+'; }
"-"                                                         { return '-'; }
"!"                                                         { return '!'; }
"*"                                                         { return '*'; }
"/"                                                         { return '/'; }
"%"                                                         { return '%'; }
"<="                                                        { return '<='; }
"<"                                                         { return '<'; }
">="                                                        { return '>='; }
">"                                                         { return '>'; }
"=="                                                        { return '=='; }
"!="                                                        { return '!='; }
"&&"                                                        { return '&&'; }
"||"                                                        { return '||'; }
"="                                                         { return '='; }

/lex



/* --------- Parser declarations section --------- */

/* Association and precedence of the various operators */
%nonassoc ';'
%right '='
%left '||'
%left '&&'
%left '==' '!='
%left '<=' '<' '>=' '>'
%left '+' '-'
%left '*' '/' '%'
%right '!'
%left '[' ']' '.'
%left '{' '}'
%left '(' ')'


/* Parser configuration directives */
%ebnf                   /* Enable extended BNF syntax! */
%start script           /* The non-terminal to start at */



%% 
/* --------- Language grammar section --------- */

/* Structure of ACCEL script */
script              : (scriptLine)* (scriptFinalLine)?
                      {{
                            var output = "";

                            if ($1) {
                                var length = $1.length;
                                for (var i = 0; i < length; i++) {
                                    output += "func(" + $1[i] + ")";
                                }
                            }

                            if ($2) {
                                output += "func(" + $2 + ")";
                            }

                            return output;
                      }}
                    ;
scriptLine          :  LINEBREAK 
                    |  quantity LINEBREAK 
                    |  comment LINEBREAK;
scriptFinalLine     :  quantity
                    |  comment;


/* Single ACCEL script lines */
quantity            :  quantityDef | quantityFuncDef;
quantityFuncDef     :  funcDef '=' expr
                       { $$ = $1 + $2 + $3; }
                    ;
funcDef             :  IDENTIFIER '(' (STDFUNCTION | IDENTIFIER) (funcDefAdditionalArg)* ')'
                       {{
                           var funcName = $1 + $2 + $3;
                           if ($4 && $4.length > 0) {
                               $$ = funcName + ',' + $4 + $5;
                           } else {
                               $$ = funcName + $5;
                           }
                       }}
                    ;
funcDefAdditionalArg:  ',' (STDFUNCTION | IDENTIFIER)
                       { $$ = $2 }
                    ;
quantityDef         :  IDENTIFIER '=' expr (UNIT)?
                       {{ 
                           var defStr = $1 + $2 + $3;
                           $$ = defStr;
                       }}
                    ;
comment             :  COMMENT
                       { $$ = ""; }
                    ;


/* Expressions */
expr                :  term | arith;
term                :  scalarTerm | vectorExpr;


/* Arithmetic */
arith               :  uniArith | binArith;
uniArith            :  '-' expr %prec '!'
                       { $$ = 'uniminus(' + $2 + ')'; }
                    |  '+' expr %prec '!'
                       { $$ = $2; }
                    |  '!' expr
                       { $$ = 'not(' + $2 + ')'; }
                    ;
binArith            :  /* Operator precedence defined above */
                       expr '+' expr
                       { $$ = 'add(' + $1 + ',' + $3 + ')'; }
                    |  expr '-' expr
                       { $$ = 'substract(' + $1 + ',' + $3 + ')'; }
                    |  expr '*' expr
                       { $$ = 'multiply(' + $1 + ',' + $3 + ')'; }
                    |  expr '/' expr
                       { $$ = 'divide(' + $1 + ',' + $3 + ')'; }
                    |  expr '%' expr
                       { $$ = 'modulo(' + $1 + ',' + $3 + ')'; }
                    |  expr '<=' expr
                       { $$ = 'lessThanEqual(' + $1 + ',' + $3 + ')'; }
                    |  expr '<' expr
                       { $$ = 'lessThan(' + $1 + ',' + $3 + ')'; }
                    |  expr '>=' expr
                       { $$ = 'greaterThanEqual(' + $1 + ',' + $3 + ')'; }
                    |  expr '==' expr
                       { $$ = 'equal(' + $1 + ',' + $3 + ')'; }
                    |  expr '!=' expr
                       { $$ = 'notEqual(' + $1 + ',' + $3 + ')'; }
                    |  expr '&&' expr
                       { $$ = 'and(' + $1 + ',' + $3 + ')'; }
                    |  expr '||' expr
                       { $$ = 'or(' + $1 + ',' + $3 + ')'; }
                    ;


/* Scalars */
scalarTerm          :  scalarVar | scalarConst | funcCall | quantifier | brackets | vectorCall | historyVar;
scalarVar           :  IDENTIFIER
                       { $$ = '(' + $1 + '|| exe.' + $1 + '())'; }
                    |  STDFUNCTION
                    ;
historyVar          :  scalarVar '{' expr '}'
                       { $$ = "__history__(" + $1 + "," + $3 + ")"; }
                    ;
scalarConst         :  NUMBER | STRING | predefinedConstant;
predefinedConstant  :  PI
                       { $$ = 'Math.PI'; }
                    |  E
                       { $$ = 'Math.E'; }
                    |  TRUE
                       { $$ = 'true'; }
                    |  FALSE
                       { $$ = 'false'; }
                    ;

funcCall            :  STDFUNCTION '(' expr? (funcCallArgList)* ')'
                       {{
                            var funcCall = $1 + $2 + ($3 || '');
                            if ($4 && $4.length > 0) {
                               $$ = funcCall + ',' + $4 + $5;
                           } else {
                               $$ = funcCall + $5;
                           }
                       }}
                    |  IDENTIFIER '(' expr? (funcCallArgList)* ')'
                       {{
                            var funcCall = 'exe.' + $1 + $2 + ($3 || '');
                            if ($4 && $4.length > 0) {
                               $$ = funcCall + ',' + $4 + $5;
                           } else {
                               $$ = funcCall + $5;
                           }
                       }}   
                    ;
funcCallArgList     :  ',' expr
                       { $$ = $2; }
                    ;

quantifier          :  '#(' (IDENTIFIER | STDFUNCTION) ',' expr ',' expr ',' STDFUNCTION ')'
                       { $$ = "__quantifier__(" + $2 + $3 + $4 + $5 + $6 + $7 + $8 + $9; }
                    ;
brackets            :  '(' expr ')'
                       { $$ = $1 + $2 + $3; }
                    ;


/* Vectors */
vectorExpr          : '[' (vectorArgList)? ']'
                       { $$ = '{' + ($2 || '') + '}'; };
vectorArgList       :  vectorElem (vectorAdditionalArg)*
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
vectorAdditionalArg :  ',' vectorElem
                       { $$ = $2 }
                    ;
vectorElem          :  STRING ':' expr 
                       { $$ = { index:$1, value:$3}; }
                    |  IDENTIFIER ':' expr
                       { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                    |  STDFUNCTION ':' expr
                       { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                    |  NUMBER ':' expr
                       { $$ = { index:'\'' + $1 + '\'', value:$3}; }
                    |  expr
                       { $$ = { value:$1 }; }
                    ;

vectorCall          :  scalarTerm '[' expr ']'
                       { $$ = $1 + $2 + $3 + $4; }
                    |  scalarTerm '.' IDENTIFIER
                       { $$ = $1 + $2 + $3; }
                    |  scalarTerm '.' STDFUNCTION
                       { $$ = $1 + $2 + $3; }  
                    |  scalarTerm '.' NUMBER
                       { $$ = $1 + '[' + $3 + ']'; } 
                    ;



%%
