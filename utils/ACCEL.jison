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
"@"                                                         { return '@'; }

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
script              : (scriptLine*) (scriptFinalLine)?;
scriptLine          : 
        LINEBREAK 
    |   quantity LINEBREAK 
    |   comment LINEBREAK;
scriptFinalLine     : quantity | comment;


/* Single ACCEL script lines */
quantity            : quantityDef | quantityFuncDef;
quantityFuncDef     : funcDef '=' expr;
funcDef             : IDENTIFIER '(' IDENTIFIER (',' IDENTIFIER)* ')';
comment             : COMMENT;
quantityDef         : IDENTIFIER '=' expr (UNIT)?;


/* Expressions */
expr                : term | arith;
term                : scalarTerm | vectorExpr;


/* Arithmetic */
arith               : uniArith | binArith;
uniArith            : 
        '-' expr %prec '!'      /* _unary_ minus and plus should have same precedence as negation operator! */
    |   '+' expr %prec '!'
    |   '!' expr;
binArith            : 			/* Operator precedence defined above */
        expr '+' expr
    |   expr '-' expr
    |   expr '*' expr
    |   expr '/' expr
    |   expr '%' expr
    |   expr '<=' expr
    |   expr '<' expr
    |   expr '>=' expr
    |   expr '==' expr
    |   expr '!=' expr
    |   expr '&&' expr
    |   expr '||' expr;


/* Scalars */
scalarTerm          : scalarVar | scalarConst | funcCall | quantifier | brackets | vectorCall;
scalarVar           : historyVar | normalVar;
normalVar           : IDENTIFIER;
historyVar          : IDENTIFIER '{' expr '}';
scalarConst         : NUMBER | STRING | predefinedConstant;
predefinedConstant  : PI | E | TRUE | FALSE;

funcCall            : IDENTIFIER '(' (argList)? ')';
argList             : expr (',' expr)*;

quantifier          : '#(' IDENTIFIER ',' expr ',' expr ',' IDENTIFIER ')';
brackets            : '(' expr ')';


/* Vectors */
vectorExpr          : '[' (vectorArgList)? ']';
vectorArgList       : vectorElem (',' vectorElem)*;
vectorElem          : 
        STRING ':' expr 
    |   IDENTIFIER ':' expr 
    |   expr;

vectorCall          :
        scalarTerm '[' expr ']'
    |   scalarTerm '.' (IDENTIFIER | NUMBER);
