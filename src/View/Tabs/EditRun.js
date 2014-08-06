$(document).ready(
    function() {
        $('#scriptline').keypress(
            function(e) {
                if (e.which === 13) {
                    $('#enterline').click();
                }
            }
        );

        //Hide what needs hiding
        Report.todolistBuffer.hideIfEmpty('#tododiv');
        Report.arglistBuffer.hideIfEmpty('#arglistdiv');
        Report.argtolistBuffer.hideIfEmpty('#argtodiv');
        userinputBuffer.hideIfEmpty('#userinputdiv');
        Report.resultList.buffer.hideIfEmpty('#resultdiv');
        $('#plotdiv').toggle(false);
    }
);

/**
 * Number of object-elements the objectToString function
 * should generate before it is terminated.
 *
 * @memberof View
 * @type {Number}
 */
var maxPrintElements = 1000;

//------------------------------------------------------------------------------

function deleteQuantity(quantity) {
    controller.deleteQuantity(quantity);
}

var linenr = 0;

function addQuantity(string) {
    setPendingScriptLine(string);

    string = string.trim();
    if (string === '') {
        //Do nothing if nothing was entered
        setPendingScriptLine(null);
    } else {
        setTimeout(
            function() {
                $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');

                try {
                    controller.addQuantity(string);
                } catch (error) {
                    console.log(error);
                    handleError(error);
                }

                setPendingScriptLine(null);

                selectContent('#scriptline');
            },
            10
        );
    }
}

function toggleExecution(action) {
    if (action === 'Run') {
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
    controller.stop();
    controller.run();
}

//------------------------------------------------------------------------------

function setExecuting(executing) {
    if (executing) {
        $('#runscript').val('Pause');
    } else {
        $('#runscript').val('Run');
    }
}

var lineNumber = {};

/**
 * Synchronize the content of the #scriptlist div with the model
 *
 * @memberof View
 * @param  {Object} quantities All quantities registered in the model
 */
function synchronizeScriptList(quantities) {
    scriptlistBuffer.empty();
    lineNumber = {};
    Report.todolistBuffer.empty();
    resetInputs();

    var i = 0;
    for (var q in quantities) {
        var quantity = quantities[q];

        //TODOs
        if (quantity.todo) {
            Report.addTodo(quantity.name);
        } else {
            i++;
            lineNumber[quantity.name] = i;
            addScriptlistLine(i, quantity.name, quantity.LHS, quantity.definition, quantity.category);
        }

        //User Input
        if (quantity.category == 1) {
            switch (quantity.input.type) {
                case 'slider':
                    addInput(new SliderInput(i, quantity.name, quantity.name, parseFloat(quantity.input.parameters[0]), parseFloat(quantity.input.parameters[1]), parseFloat(quantity.input.parameters[2])));
                    break;
                case 'check':
                    addInput(new CheckboxInput(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                    break;
                case 'button':
                    addInput(new ButtonInput(i, quantity.name, 'Click me', quantity.input.parameters[0]));
                    break;
                case 'text':
                    addInput(new TextInput(i, quantity.name, quantity.name, quantity.input.parameters[0]));
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
    Report.resultList.buffer.hideIfEmpty('#resultdiv');
    $('#plotdiv').toggle(false);
}

/**
 * Synchronize the content of the #result div with the model
 *
 * @memberof View
 * @param  {Object} quantities All category 2 quantities registered in the model
 */
function synchronizeResults(quantities) {
    var resultValues = {};

    for (var q in quantities) {
        var quantity = quantities[q];
        resultValues[quantity.name] = objectToString(controller.getQuantityValue(quantity.name), maxPrintElements);
    }

    Report.resultList.set(resultValues);
    Report.resultList.buffer.hideIfEmpty('#resultdiv');
}

//------------------------------------------------------------------------------

/**
 * Selects indicated line and puts it's contents in the #scriptline element
 *
 * @memberof View
 * @param  {Number} line  Identifier of the to be selected line
 * @param  {String} value To be put in the #scriptline element
 */
function selectScriptline(linenr, quantityname) {
    Report.arglistBuffer.empty();
    Report.argtolistBuffer.empty();

    if ($('#line' + linenr).length > 0) {
        var quantity = controller.getQuantity(quantityname);

        var scriptline = $('#scriptline');
        scriptline.text(quantity.source);

        $('.quantityname').text(quantityname);

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
    }

    Report.arglistBuffer.flip();
    Report.argtolistBuffer.flip();

    Report.arglistBuffer.hideIfEmpty('#arglistdiv');
    Report.argtolistBuffer.hideIfEmpty('#argtodiv');
}

/**
 * Deselects the previously selected line and hides the argument lists
 * @memberof View
 */
function deselectScriptline() {
    selectScriptline(null, null);
    $('#scriptline').text('');

    Report.arglistBuffer.hideIfEmpty('#arglistdiv');
    Report.argtolistBuffer.hideIfEmpty('#argtodiv');
}

/**
 * Resets the edit/run tab to it's initial state
 * @memberof View
 */
function resetEditRun() {
    synchronizeScriptList(null);
    synchronizeResults(null);
    selectScriptline(null, null);
    $('#scriptline').text('');

    Report.todolistBuffer.hideIfEmpty('#tododiv');
    Report.arglistBuffer.hideIfEmpty('#arglistdiv');
    Report.argtolistBuffer.hideIfEmpty('#argtodiv');
    userinputBuffer.hideIfEmpty('#userinputdiv');
    Report.resultList.buffer.hideIfEmpty('#resultdiv');
    $('#plotdiv').toggle(false);
}

//------------------------------------------------------------------------------

/**
 * Buffer to contain updated #scriptlist content
 * @memberof View
 * @type {HTMLbuffer}
 */
var scriptlistBuffer = new HTMLbuffer('#scriptlist');

/**
 * Generates HTML for a line of ACCEL code to be added to the listing in the #scriptlist element
 *
 * @memberof View
 * @param {Number} line     Line number to identify this line of code
 * @param {String} left     Left-hand of the equation
 * @param {String} right    Right-hand side of the equation
 * @param {Number} category Category to which the left-hand side belongs
 */
function getScriptlistLineHTML(linenr, quantity, left, right, category) {
    return '' +
        '<input type="radio" name="script" id="line' + linenr + '" value="' + left + ' = ' + right + '">' +
        '<label for="line' + linenr + '" onclick = "selectScriptline(' + linenr + ', \'' + quantity + '\');">' +
            '<div class="inline ellipsis max128w">' + left + '</div>' +
            '<div class="inline operator">=</div>' +
            '<div class="inline ellipsis max128w">' + right + '</div>' +
            '<div class="inline comment">(cat.=' + category + ')</div>' +
            '<a onclick="deleteQuantity(\'' + quantity + '\')" class="inline lineoption">delete</a>' +
        '</label>';
}

/**
 * Adds HTML for a line of ACCEL code to the buffer
 *
 * @memberof View
 * @param {Number} line     Line number to identify this line of code
 * @param {String} left     Left-hand of the equation
 * @param {String} right    Right-hand side of the equation
 * @param {Number} category Category to which the left-hand side belongs
 */
function addScriptlistLine(linenr, quantity, left, right, category) {
    //Secure right hand from input
    right = encodeHTML(right);

    scriptlistBuffer.append(getScriptlistLineHTML(linenr, quantity, left, right, category));
}


function setPendingScriptLine(line) {
    var pendingline = $('#pendingscriptline');

    if (line === null) {
        pendingline.animate({height: 0, opacity: 0}, 400,
            function() {
                pendingline.toggle(false);
                $('#pendingloader').toggle(false);
            }
        );
    } else {
        $('#pendingscriptline > div').first().html(line);
        pendingline.toggle(true);
        $('#pendingloader').toggle(true);
        pendingline.css({height: '20px', opacity: 1});
    }
}

/**
 * Buffer to contain updated #userinput content
 * @memberof View
 * @type {HTMLbuffer}
 */
var userinputBuffer = new HTMLbuffer('#userinput');

/**
 * Constructs a base input element
 *
 * @memberof View
 * @class
 * @classdesc Base input element to be extended
 */
function Input() {
    this.bufferInput = function() {
        userinputBuffer.append(this.getHTML());
    };
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
 * @memberof View
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

    this.getStepSize = function(val, min, max) {
        var stepsizes = [Math.pow(10, -getPrecision(val)),
                         Math.pow(10, -getPrecision(min)),
                         Math.pow(10, -getPrecision(max))];

        return Math.min.apply(Math, stepsizes);
    };

    this.properties = {
        range: "min",
        value: this.val,
        min: this.min,
        max: this.max,
        step: this.getStepSize(this.val, this.min, this.max),

        quantity: this.quantity, //Non-jquery addition to get the associated quantity within the slide function's scope
        identifier: this.identifier, //Non-jquery addition to get the associated quantity within the slide function's scope
        slide: function(event, ui) {
            controller.setUserInputQuantity(quantity, ui.value);
            $('#userslider' + identifier + 'value').html('(' + ui.value + ')');
        }
    };
}
SliderInput.prototype = new Input();
SliderInput.prototype.getHTML = function() {
    return '' +
        '<div id = "userinput' + this.identifier + '">' +
            '<div class = "inline">' + this.label + '</div>' +
            '<div id = "userslider' + this.identifier + 'value" class = "inline">(' + this.val + ')</div>' +
            '<div id = "userslider' + this.identifier + '"></div>' +
        '</div>';
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
 * @memberof View
 * @class
 * @classdesc Dynamic checkbox input class to be generated according to ACCEL script requirements
 */
function CheckboxInput(identifier, quantity, label, val) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;

    this.val = val;
}
CheckboxInput.prototype = new Input();
CheckboxInput.prototype.getHTML = function() {
    return '' +
        '<div id = "userinput' + this.identifier + '">' +
            '<label for = "usercheck' + this.identifier + '">' + this.label + '</label>' +
            '<div class = "inline checkboxin">' +
                '<input type = "checkbox" id = "usercheck' + this.identifier + '" ' + (this.val === true ? 'checked' : '') + '>' +
                '<label for = "usercheck' + this.identifier + '"></label>' +
            '</div>' +
        '</div>';
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
 * @memberof View
 * @class
 * @classdesc Dynamic text input class to be generated according to ACCEL script requirements
 */
function TextInput(identifier, quantity, label, val) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;

    this.val = val;
}
TextInput.prototype = new Input();
TextInput.prototype.getHTML = function() {
    return '' +
        '<div id = "userinput' + this.identifier + '">' +
            '<label for = "usertext' + this.identifier + '">' + this.label + '</label>' +
            '<input type = "text" id = "usertext' + this.identifier + '" class = "textin" value = "' + this.val + '">' +
        '</div>';
};
TextInput.prototype.initialize = function() {
    controller.setUserInputQuantity(this.quantity, this.val);

    var textinput = this;
    $('#usertext' + textinput.identifier).on('input',
        function() {
            var val = this.value;
            if ($.isNumeric(val) && !(/[a-zA-Z]/.test(val))) {
                val = parseFloat(val);
            }
            controller.setUserInputQuantity(textinput.quantity, val);
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
 * @memberof View
 * @class
 * @classdesc Dynamic button input class to be generated according to ACCEL script requirements
 */
function ButtonInput(identifier, quantity, label) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;
}
ButtonInput.prototype = new Input();
ButtonInput.prototype.getHTML = function() {
    return '' +
        '<div id = "userinput' + this.identifier + '">' +
            '<label for = "userbutton' + this.identifier + '">' + this.quantity + '</label>' +
            '<input type = "button" id = "userbutton' + this.identifier + '" class = "buttonin" value = "' + this.label + '">' +
        '</div>';
};
ButtonInput.prototype.initialize = function() {
    controller.setUserInputQuantity(this.quantity, false);

    var buttoninput = this;
    $('#userbutton' + buttoninput.identifier).on('click',
        function() {
            controller.setUserInputQuantity(buttoninput.quantity, true);
        }
    );
};

/**
 * Array of input javascript objects
 * @memberof View
 * @type {Array}
 */
var inputs = [];

/**
 * Removes the existing input elements and empties the associated buffer
 * @memberof View
 */
function resetInputs() {
    userinputBuffer.empty();

    inputs = [];
}

/**
 * Adds a dynamic input element to the #userinput element
 *
 * @memberof View
 * @param {Object} elements    Object with functions to generate the corresponding HTML to be put in #userinput
 */
function addInput(element) {
    userinputBuffer.append(element.getHTML());

    this.inputs.push(element);
}

/**
 * Initializes the added input elements
 * @memberof View
 */
function initInputs() {
    userinputBuffer.flip();

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].initialize();
    }
}

/**
 * Object containing tools to modify the contents of the todo list, argument lists and result list
 * @memberof View
 * @type {Object}
 */
var Report = {
    /**
     * Generates HTML for an item in the list of todos
     *
     * @param {String} quantity Quantity which is to be implemented
     */
    getTodoListHTML: function(quantity) {
        return '' +
            '<div onclick = "Report.onclickTodo(\'' + quantity + '\')" class = "hoverbold">' +
                '<div class="ellipsis max128w">' + quantity + '</div>' +
            '</div>';
    },
    onclickTodo: function(quantity) {
        $('#scriptline').html(quantity + ' =&nbsp;');
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
        Report.todolistBuffer.append(this.getTodoListHTML(quantity));
    },

    /**
     * Generates HTML for an item in a list of quantities with a certain property
     *
     * @param  {String} quantity Quantity of which a property is being displayed
     * @param  {String} property Property of the associated quantity
     */
    getPropertyListHTML: function(quantity, property) {
        return '' +
            '<div onclick = "Report.onclickProperty(\'' + quantity + '\')" class = "hoverbold">' +
                '<div class="ellipsis max128w">' + quantity + '</div>' +
                '<div class="property">' + property + '</div>' +
            '</div>';
    },
    onclickProperty: function(quantity) {
        var i = lineNumber[quantity];
        selectScriptline(i, quantity);
        $('#line' + i).trigger('click');
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
        Report.argtolistBuffer.append(this.getPropertyListHTML(quantity, property));
    },

    /**
     * List to allow for value updates without reconstruction of the HTML
     *
     * @type ValueList
     */
    resultList: new ValueList('#result')
};