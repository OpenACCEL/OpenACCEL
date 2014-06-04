$(document).ready(
    function() {
        $('#scriptline').keypress(
            function(e) {
                if (e.which == 13) {
                    $('#enterline').click();
                }
            }
        );

        //Hide what needs hiding
        Report.todolistBuffer.hideIfEmpty('#tododiv');
        Report.arglistBuffer.hideIfEmpty('#arglistdiv');
        Report.argtolistBuffer.hideIfEmpty('#argtodiv');
        userinputBuffer.hideIfEmpty('#userinputdiv');
        Report.resultBuffer.hideIfEmpty('#resultdiv');
        $('#plotdiv').toggle(false);
    }
);

function deleteQuantity(quantity) {
    console.log('deleting ' + quantity);

    controller.deleteQuantity(quantity);
}

var linenr = 0;

function addQuantity(string) {
    var split = string.split('=');

    //Approximate Script list
    split = [split[0].split(' ').join(''), split[1].split(' ').join('')];
    addScriptlistLine(linenr++, split[0], split[0], split[1], '?');
    scriptlistBuffer.flip();

    console.log('Pre-added line: ' + string);
    $('#scriptline').select();

    setTimeout(
        function() {
            controller.addQuantity(string);
            console.log('Compiled script.');
        },
        10
    );
}

function toggleExecution(action) {
    if (action == 'Run') {
        controller.run();
    } else {
        controller.pause();
    }
}

function newScript() {
    if (confirm("Are you sure you want to stop your current script and delete all existing script lines? It can not be undone.")) {
        controller.newScript();
    }
}

function setIterations(iterations) {
    controller.setIterations(iterations);
}

//------------------------------------------------------------------------------

function setExecuting(executing) {
    if (executing) {
        $('#runscript').val('Pause');
    } else {
        $('#runscript').val('Run');
    }
}

/**
 * Synchronize the content of the #scriptlist div with the model
 *
 * @param  {Object} quantities All quantities registered in the model
 */
function synchronizeScriptList(quantities) {
    scriptlistBuffer.empty();
    Report.todolistBuffer.empty();
    userinputBuffer.empty();

    var i = 0;
    for (var q in quantities) {
        var quantity = quantities[q];
        console.log(quantity);

        //TODOs
        if (quantity.todo) {
            Report.addTodo(quantity.name);
        } else {
            addScriptlistLine(i++, quantity.name, quantity.LHS, quantity.definition, quantity.category);
        }

        //User Input
        if (quantity.category == 1) {
            switch (quantity.input.type) {
                case 'slider':
                    addInput(new SliderInput(i, quantity.name, quantity.name, parseInt(quantity.input.parameters[0]), parseInt(quantity.input.parameters[1]), parseInt(quantity.input.parameters[2])));
                    break;
                case 'check':
                    addInput(new CheckboxInput(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                    break;
                case 'button':
                    addInput(new ButtonInput(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                    break;
                case 'text':
                    addInput(new TextInput(i, quantity.name, quantity.name));
                    break;
                default:
                    //Unknown input type
                    console.log('Unknown input type');
                    break;
            }
        }
    }

    scriptlistBuffer.flip();
    Report.todolistBuffer.flip();
    initInputs();

    //Hide what needs hiding
    Report.todolistBuffer.hideIfEmpty('#tododiv');
    Report.arglistBuffer.hideIfEmpty('#arglistdiv');
    Report.argtolistBuffer.hideIfEmpty('#argtodiv');
    userinputBuffer.hideIfEmpty('#userinputdiv');
    Report.resultBuffer.hideIfEmpty('#resultdiv');
    $('#plotdiv').toggle(false);
}

/**
 * Synchronize the content of the #result div with the model
 *
 * @param  {Object} quantities All category 2 quantities registered in the model
 */
function synchronizeResults(quantities) {
    Report.resultBuffer.empty();

    for (var q in quantities) {
        var quantity = quantities[q];

        try {
            Report.addResult(quantity.name, objectToString(controller.getQuantityValue(quantity.name)));
        } catch (e) {
            console.log(e);
        }
    }
    Report.resultBuffer.flip();
    Report.resultBuffer.hideIfEmpty('#resultdiv');
}

function objectToString(obj) {
    if (obj instanceof Object) {
        var results = [];
        for (var key in obj) {
            var elem = '';
            if (!(/^\d+$/.test(key))) {
                // Key is not a number
                elem += key + ':';
            }
            elem += objectToString(obj[key]);
            results.push(elem);
        }
        return '[' + results.join(',') + ']';
    } else {
        return obj.toString();
    }
}

//------------------------------------------------------------------------------

/**
 * Selects indicated line and puts it's contents in the #scriptline element
 *
 * @param  {Number} line  Identifier of the to be selected line
 * @param  {String} value To be put in the #scriptline element
 */
function selectScriptline(linenr, quantityname) {
    console.log('select ' + linenr + ' - [' + quantityname + ']');
    if ($('#line' + linenr).length > 0) {
        var quantity = controller.getQuantity(quantityname);

        var scriptline = $('#scriptline');
        scriptline.val(quantity.source);

        $('.quantityname').html(quantityname);

        Report.arglistBuffer.empty();
        Report.argtolistBuffer.empty();

        //list parameters (type = dummy)
        for (var p in quantity.parameters) {
            Report.addArg(quantity.parameters[p], 'dummy');
        }

        //list dependencies (type = regular)
        for (var d in quantity.dependencies) {
            Report.addArg(quantity.dependencies[d], 'regular');
        }

        //list used standard functions (type = standard function)
        //TODO
                
        //list reverse dependencies (type = regular)
        for (var r in quantity.reverseDeps) {
            Report.addArgto(quantity.reverseDeps[r], 'regular');
        }

        Report.arglistBuffer.flip();
        Report.argtolistBuffer.flip();

        Report.arglistBuffer.hideIfEmpty('#arglistdiv');
        Report.argtolistBuffer.hideIfEmpty('#argtodiv');
    }
}

//------------------------------------------------------------------------------

/**
 * Constructs a buffer object to contain updated content of a div and update the div when desired
 *
 * @param {String} div Id of the div who's content is to be buffered
 * @class
 * @classdesc Buffer class to contain updated content of a div and update the div when desired
 */
function HTMLbuffer(div) {
    this.div = div;
    this.html = '';

    /**
     * Clears the buffer
     */
    this.empty = function() {
        this.html = '';
    }

    /**
     * Checks whether the buffer is empty
     *
     * @return {Boolean} True if and only if buffer is empty
     */
    this.isEmpty = function() {
        return (this.html == '');
    }

    /**
     * Hides the target html element if the buffer is empty, show otherwise
     *
     * @param {String} selector to indicate which element should be hidden
     */
    this.hideIfEmpty = function(target) {
        $(target).toggle(!this.isEmpty());
    }

    /**
     * Appends html to the buffer
     *
     * @param {String} html String to be appended to the buffer
     */
    this.append = function(html) {
        this.html = this.html + html;
    }

    /**
     * Replaces the content in the div with the content in the buffer
     */
    this.flip = function() {
        $(this.div).html(this.html);
    }
}

//------------------------------------------------------------------------------

/**
 * Buffer to contain updated #scriptlist content
 * @type {HTMLbuffer}
 */
var scriptlistBuffer = new HTMLbuffer('#scriptlist');

/**
 * Generates HTML for a line of ACCEL code to be added to the listing in the #scriptlist element
 *
 * @param {Number} line     Line number to identify this line of code
 * @param {String} left     Left-hand of the equation
 * @param {String} right    Right-hand side of the equation
 * @param {Number} category Category to which the left-hand side belongs
 */
function getScriptlistLineHTML(linenr, quantity, left, right, category) {
    return '\
        <input type="radio" name="script" id="line' + linenr + '" value="' + left + ' = ' + right + '">\
        <label for="line' + linenr + '" onclick = "selectScriptline(' + linenr + ', \'' + quantity + '\');">\
            <div class="inline ellipsis max256w">' + left + '</div>\
            <div class="inline operator">=</div>\
            <div class="inline ellipsis max256w">' + right + '</div>\
            <div class="inline comment">(cat.=' + category + ')</div>\
            <a onclick="deleteQuantity(\'' + quantity + '\')" class="inline lineoption">delete</a>\
        </label>\
    ';
}

/**
 * Adds HTML for a line of ACCEL code to the buffer
 *
 * @param {Number} line     Line number to identify this line of code
 * @param {String} left     Left-hand of the equation
 * @param {String} right    Right-hand side of the equation
 * @param {Number} category Category to which the left-hand side belongs
 */
function addScriptlistLine(linenr, quantity, left, right, category) {
    scriptlistBuffer.append(getScriptlistLineHTML(linenr, quantity, left, right, category));
}

/**
 * Buffer to contain updated #userinput content
 * @type {HTMLbuffer}
 */
var userinputBuffer = new HTMLbuffer('#userinput');

/**
 * Constructs a base input element
 *
 * @class
 * @classdesc Base input element to be extended
 */
function Input() {
    this.bufferInput = function() {
        userinputBuffer.append(this.getHTML());
    }
}
Input.prototype.getHTML = function() {};
Input.prototype.initialize = function() {};

/**
 * Constructs a dynamic slider input object
 *
 * @param {String} identifier String to be used as a suffix in the id values of the generated html elements
 * @param {Object} quantity   Object which the input element affects
 * @param {String} label      String to be used as a label for the input element in the UI
 * @param {Number} val        Initial value of the slider
 * @param {Number} min        Minimal value of the slider
 * @param {Number} max        Maximal value of the slider
 *
 * @class
 * @classdesc Dynamic slider input class to be generated according to ACCEL script requirements
 */
function SliderInput(identifier, quantity, label, val, min, max) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;

    this.val = val;
    this.min = min;
    this.max = max;
    this.properties = {
        range: "min",
        value: this.val,
        min: this.min,
        max: this.max,
        quantity: this.quantity, //Non-jquery addition to get the associated quantity within the slide function's scope
        slide: function(event, ui) {
            controller.setUserInputQuantity(quantity, ui.value);
        }
    };
}
SliderInput.prototype = new Input();
SliderInput.prototype.getHTML = function() {
    return '\
        <div id = "userinput' + this.identifier + '">\
            <div class = "inline">' + this.label + '</div>\
            <div id = "userslider' + this.identifier + '"></div>\
        </div>\
    ';
};
SliderInput.prototype.initialize = function() {
    controller.setUserInputQuantity(this.quantity, this.val);

    $('#userslider' + this.identifier).slider(this.properties);
};

/**
 * Constructs a dynamic checkbox input object
 *
 * @param {String}  identifier String to be used as a suffix in the id values of the generated html elements
 * @param {Object}  quantity   Object which the input element affects
 * @param {String}  label      String to be used as a label for the input element in the UI
 * @param {Boolean} val        Initial value of the checkbox
 *
 * @class
 * @classdesc Dynamic checkbox input class to be generated according to ACCEL script requirements
 */
function CheckboxInput(identifier, quantity, label, val) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;

    this.val = val;
};
CheckboxInput.prototype = new Input();
CheckboxInput.prototype.getHTML = function() {
    return '\
        <div id = "userinput' + this.identifier + '">\
            <label for = "usercheck' + this.identifier + '">' + this.label + '</label>\
            <div class = "inline checkboxin">\
                <input type = "checkbox" id = "usercheck' + this.identifier + '" checked = "' + this.val + '">\
                <label for = "usercheck' + this.identifier + '"></label>\
            </div>\
        </div>\
    ';
};
CheckboxInput.prototype.initialize = function() {
    controller.setUserInputQuantity(this.quantity, this.val);

    var checkboxinput = this;
    $('#usercheck' + checkboxinput.identifier).on('change',
        function() {
            controller.setUserInputQuantity(checkboxinput.quantity, this.checked);
        }
    );
};

/**
 * Constructs a dynamic text input object
 *
 * @param {String} identifier String to be used as a suffix in the id values of the generated html elements
 * @param {Object} quantity   Object which the input element affects
 * @param {String} label      String to be used as a label for the input element in the UI
 * @param {String} val        Initial value of the text input field
 *
 * @class
 * @classdesc Dynamic text input class to be generated according to ACCEL script requirements
 */
function TextInput(identifier, quantity, label, val) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;

    this.val = val;
};
TextInput.prototype = new Input();
TextInput.prototype.getHTML = function() {
    return '\
        <div id = "userinput' + this.identifier + '">\
            <label for = "usertext' + this.identifier + '">' + this.label + '</label>\
            <input type = "text" id = "usertext' + this.identifier + '" class = "textin" value = "' + this.val + '">\
        </div>\
    ';
};
TextInput.prototype.initialize = function() {
    controller.setUserInputQuantity(this.quantity, this.val);

    var textinput = this;
    $('#usertext' + textinput.identifier).on('input',
        function() {
            console.log('textinput');
            controller.setUserInputQuantity(textinput.quantity, this.value);
        }
    );
};

/**
 * Constructs a dynamic button input object
 *
 * @param {String} identifier String to be used as a suffix in the id values of the generated html elements
 * @param {Object} quantity   Object which the input element affects
 * @param {String} label      String to be used as a label for the input element in the UI
 *
 * @class
 * @classdesc Dynamic button input class to be generated according to ACCEL script requirements
 */
function ButtonInput(identifier, quantity, label) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;
};
ButtonInput.prototype = new Input();
ButtonInput.prototype.getHTML = function() {
    return '\
        <div id = "userinput' + this.identifier + '">\
            <label for = "userbutton' + this.identifier + '">' + this.label + '</label>\
            <input type = "button" id = "userbutton' + this.identifier + '" class = "buttonin" value = "' + this.label + '">\
        </div>\
    ';
};
ButtonInput.prototype.initialize = function() {
    controller.setUserInputQuantity(this.quantity, false);
    
    var buttoninput = this;
    $('#userbutton' + buttoninput.identifier).on('mousedown',
        function() {
            controller.setUserInputQuantity(buttoninput.quantity, true);
        }
    );
    $('#userbutton' + buttoninput.identifier).on('mouseup',
        function() {
            controller.setUserInputQuantity(buttoninput.quantity, false);
        }
    );
};

/**
 * Array of input javascript objects
 * @type {Array}
 */
var inputs = [];

/**
 * Adds a dynamic input element to the #userinput element
 *
 * @param {Object} elements    Object with {@code appendHTML(div, name, identifier)} function to append the corresponding HTML to #userinput
 * @param {String} label       A string displayed near the input element to describe it
 * @param {Number} identifier  A unique number to identify the element later on
 */
function addInput(element) {
    this.inputs.push(element);
    userinputBuffer.append(element.getHTML());
}

/**
 * Initializes the added input elements
 */
function initInputs() {
    console.log(this.inputs);
    userinputBuffer.flip();

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].initialize();
    }
}

/**
 * Object containing methods to modify the contents of the #results element
 * @type {Object}
 */
var Report = {
    getEquationHTML: function(left, right) {
        return '\
            <div>\
                <div class="ellipsis max256w">' + left + '</div>\
                <div class="operator"> = </div>\
                <div class="ellipsis max256w">' + right + '</div>\
            </div>\
        ';
    },

    getPropertyListHTML: function(x, property) {
        return '\
            <div>\
                <div class="ellipsis max256w">' + x + '</div>\
                <div class="property">' + property + '</div>\
            </div>\
        ';
    },

    /**
     * Buffer to contain updated #todolist content
     * @type {HTMLbuffer}
     */
    todolistBuffer: new HTMLbuffer('#todolist'),

    /**
     * Adds a quantity to be defined to the #todo element
     *
     * @param {String} quantity Quantity to be implemented
     */
    addTodo: function(quantity) {
        Report.todolistBuffer.append(this.getPropertyListHTML(quantity, ''));
    },

    /**
     * Buffer to contain updated #arglist content
     * @type {HTMLbuffer}
     */
    arglistBuffer: new HTMLbuffer('#arglist'),

    /**
     * Adds a quantity to the list of quantities which are a parameter to the selected quantity
     *
     * @param {String} quantity Quantity which is an argument for the selected quantity
     * @param {String} property [description]
     */
    addArg: function(quantity, property) {
        console.log('arg');
        Report.arglistBuffer.append(this.getPropertyListHTML(quantity, property));
    },

    /**
     * Buffer to contain updated #argtolist content
     * @type {HTMLbuffer}
     */
    argtolistBuffer: new HTMLbuffer('#argtolist'),

    /**
     * Adds a quantity to the list of quantities which use the selected quantity as a parameter
     *
     * @param {String} quantityQuantity for which the selected quantity is an argument
     * @param {String} property [description]
     */
    addArgto: function(quantity, property) {
        console.log('argto');
        Report.argtolistBuffer.append(this.getPropertyListHTML(quantity, property));
    },

    /**
     * Buffer to contain updated #result content
     * @type {HTMLbuffer}
     */
    resultBuffer: new HTMLbuffer('#result'),

    /**
     * Adds a resulting quantity to the #result element
     *
     * @param {String} quantity Left-hand of the equation
     * @param {String} result   Right-hand side of the equation
     */
    addResult: function(quantity, result) {
        Report.resultBuffer.append(this.getEquationHTML(quantity, result));
    },
};

function Tooltip(id, div, classes) {
    this.id = id;
    this.div = div;
    this.classes = classes;

    this.getHTML = function(message) {
        return '\
            <div id = "tooltip' + this.id + '" class = "' + this.classes + '">\
                ' + message + '\
            </div>\
        ';
    }

    this.initialize = function() {
        $(this.getHTML('')).insertAfter(this.div);
        $('#tooltip' + this.id).toggle(false);

        $('#tooltip' + this.id).on('click', 
            function() {
                $(this).animate({opacity: 0}, 200, 
                    function() {
                        $(this).toggle(false);
                    }
                )
            }
        );
        $('#tooltip' + this.id).on('mouseover', 
            function() {
                $(this).animate({opacity: 0.5}, 200);
            }
        );
        $('#tooltip' + this.id).on('mouseleave', 
            function() {
                $(this).animate({opacity: 1}, 100);
            }
        );
    }

    this.initialize();

    this.set = function(message) {
        $('#tooltip' + this.id).html(message);
        $('#tooltip' + this.id).toggle(true);
    }

    // this.hide = function() {
    //     $('#tooltip' + this.id).toggle(false);
    // }

    this.remove = function() {
        $('#tooltip' + this.id).remove();
    }
}
