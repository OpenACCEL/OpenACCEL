/* lexical grammar */

%lex

/* Lexical definitions of tokens etc. */
digit                       [0-9]
esc                         \\\\
int                         (-)?(?:[0-9]|[1-9][0-9]+)
exp                         (?:[eE][-+]?[0-9]+)
frac                        (?:\\.[0-9]+)
unit                        [a-zA-Z]+[0-9]*  

/* Initialization code. Define the error handling function here */
%{
    this.yy.parser.parseError = function(message, hash) {
        throw {message: message, hash: hash};
    }  
%}               


%%

[ \t]                                                       { /* Ignore all whitespace characters except newlines */; }
(\r)?\n                                                     { return 'LINEBREAK'; }
{int}{frac}?{exp}?\b                                        { return 'NUMBER'; }
\/\/([^\n])*                                                { return 'COMMENT'; }
(?:\"[^"]*\")|(?:\'[^']*\')                                 { return 'STRING'; }
\;\s*(1|({unit}(\.{unit})?))(\s*\/\s*({unit}(\.{unit})?))?  { return 'UNIT'; }
\b\w*[a-zA-Z_]\w*\b                                         { return 'IDENTIFIER'; }
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
"#("                                                       { return '#('; }
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
"@("                                                        { return '@('; }

/lex

/* operator associations and precedence */
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


%ebnf                   /* Enable extended BNF syntax! */
%start script           /* The non-terminal to start at */


%% /* language grammar */

/* Structure of ACCEL script */
script              : (scriptLine)* (scriptFinalLine)?
                      {{
                          // For now, we only print out the final line.
                          return $2;
                      }}
                    ;
scriptLine          : 
                       LINEBREAK 
                    |  quantity LINEBREAK 
                    |  comment LINEBREAK;
scriptFinalLine     :  quantity
                    |  comment;


/* Single ACCEL script lines */
quantity            :  quantityDef | quantityFuncDef;
quantityFuncDef     :  funcDef '=' expr
                       { $$ = $1 + $2 + $3; }
                    ;
funcDef             :  IDENTIFIER '(' IDENTIFIER funcDefAdditionalArg* ')'
                       {{
                           var funcName = $1 + $2 + $3;
                           if ($4) {
                               $$ = funcName + ',' + $4 + $5;
                           } else {
                               $$ = funcName + $5;
                           }
                       }}
                    ;
funcDefAdditionalArg:  ',' IDENTIFIER
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
scalarTerm          :  scalarVar | scalarConst | funcCall | quantifier | brackets | vectorCall | historyVar | IDENTIFIER;
historyVar          :  IDENTIFIER '{' expr '}'
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

funcCall            :  IDENTIFIER '(' (argList)? ')'
                       { $$ = $1 + $2 + $3 + $4; };
argList             :  expr (',' expr)*;

quantifier          :  '#(' IDENTIFIER ',' expr ',' expr ',' IDENTIFIER ')'
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
                       { $$ = {index:$1, value:$3}; }
                    |  IDENTIFIER ':' expr
                       { $$ = {index:'\'' + $1 + '\'', value:$3}; }
                    |  expr
                       { $$ = {value:$1}; }
                    ;

vectorCall          :  scalarTerm '[' expr ']'
                       { $$ = $1 + $2 + $3 + $4; }
                    |  scalarTerm '.' IDENTIFIER
                       { $$ = $1 + $2 + $3; }
                    |  scalarTerm '.' NUMBER
                       { $$ = $1 + '[' + $3 + ']'; } 
                    ;


%%

/* Additional user code can be put here */

