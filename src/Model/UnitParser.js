

define([], function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"start":3,"unit":4,"UNIT":5,"[":6,"vectorArgList":7,"]":8,"vectorElem":9,"vectorArgList_repetition0":10,"vectorAdditionalArg":11,",":12,":":13,"STRING":14,"$accept":0,"$end":1},
terminals_: {2:"error",5:"UNIT",6:"[",8:"]",12:",",13:":",14:"STRING"},
productions_: [0,[3,1],[4,1],[4,3],[7,2],[11,2],[9,3],[9,3],[9,1],[10,0],[10,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
                            return $$[$0];
                        
break;
case 2:
                            this.$ = yy.unitTranslator.translateUnits($$[$0]);
                        
break;
case 3:
                            this.$ = 'objectToArray({' + $$[$0-1] + '}, true)';
                        
break;
case 4:
                            var counter = 0;

                            function createElement(elemObj) {
                                return (elemObj.index || '\'' + counter++ + '\'') + ':' + elemObj.value;
                            }

                            var result = createElement($$[$0-1]);

                            for(var key in $$[$0]) {
                                result += ',' + createElement($$[$0][key]);
                            }

                            this.$ = result;
                        
break;
case 5:
                            this.$ = $$[$0]
                        
break;
case 6:
                                this.$ = { index: $$[$0-2], value: $$[$0]};
                            
break;
case 7:
                                this.$ = { index: $$[$0-2], value: $$[$0]};
                            
break;
case 8:
                                this.$ = { value: $$[$0] };
                            
break;
case 9:this.$ = [];
break;
case 10:$$[$0-1].push($$[$0]);
break;
}
},
table: [{3:1,4:2,5:[1,3],6:[1,4]},{1:[3]},{1:[2,1]},{1:[2,2],8:[2,2],12:[2,2]},{4:9,5:[1,7],6:[1,4],7:5,9:6,14:[1,8]},{8:[1,10]},{8:[2,9],10:11,12:[2,9]},{8:[2,2],12:[2,2],13:[1,12]},{13:[1,13]},{8:[2,8],12:[2,8]},{1:[2,3],8:[2,3],12:[2,3]},{8:[2,4],11:14,12:[1,15]},{4:16,5:[1,3],6:[1,4]},{4:17,5:[1,3],6:[1,4]},{8:[2,10],12:[2,10]},{4:9,5:[1,7],6:[1,4],9:18,14:[1,8]},{8:[2,6],12:[2,6]},{8:[2,7],12:[2,7]},{8:[2,5],12:[2,5]}],
defaultActions: {2:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

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

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0: /* Ignore all whitespace characters except newlines */ 
break;
case 1: return 5;        
break;
case 2: return 14;      
break;
case 3: return 6;           
break;
case 4: return 8;           
break;
case 5: return 13;           
break;
case 6: return 12;           
break;
}
},
rules: [/^(?:[^\S\n]+)/,/^(?:\b[a-zA-Z0-9\.\/]+\b)/,/^(?:(["][^\"]*["])|(['][^\']*[']))/,/^(?:\[)/,/^(?:\])/,/^(?::)/,/^(?:,)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
return parser;
});