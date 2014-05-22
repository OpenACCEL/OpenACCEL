$(document).ready(
    function() {
        $('#scriptline').keypress(
            function(e) {
                if (e.which == 13) {
                    $('#enterline').click();
                }
            }
        );
    }
);

function deleteQuantity(line) {
    //controller.deleteQuantity(line);
    //Scriptlist.removeLine(line);
    console.log('delete ' + line);
};

var linenr = 0;
function addQuantity(string) {
    var split = string.split('=');
    split = [split[0].split(' ').join(''), split[1].split(' ').join('')];
    addScriptlistLine(linenr++, split[0], split[1], '?');
    scriptlistBuffer.flip();
    console.log('Added line: ' + string);
    $('#scriptline').select();
    
    setTimeout(
        function() {
            console.log(split[0]);
            console.log(split[1]);
            controller.addQuantity(string);
            console.log('Compiled script.');

            if (split[0] == 'out' || split[0] == 'out2') {
                console.log('output variable found');
                Report.addResult(split[0], controller.getValue(split[0]));
            }
        },
        10
    );
};

/*-------------------------------------------*/

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
     * Appends html to the buffer
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

/**
 * Selects indicated line and puts it's contents in the #scriptline element
 * 
 * @param  {Number} line  Identifier of the to be selected line
 * @param  {String} value To be put in the #scriptline element
 */
function selectScriptline(line, value) {
    console.log('select ' + line + ', ' + value);
    if ($('#line' + line).length > 0) {
        var scriptline = $('#scriptline');
        scriptline.val(value);
    }
}

/**
 * Buffer to contain an updated scriptlist
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
function getScriptlistLineHTML(line, left, right, category) {
    return '\
        <input type="radio" name="script" id="line' + line + '" value="' + left + ' = ' + right + '">\
        <label for="line' + line + '" onclick = "selectScriptline(' + line + ', \'' + left + ' = ' + right + '\');">\
            <div class="inline ellipsis max256w">' + left + '</div>\
            <div class="inline operator">=</div>\
            <div class="inline ellipsis max256w">' + right + '</div>\
            <div class="inline comment">(cat.=' + category + ')</div>\
            <a onclick="deleteQuantity(#line' + line + ')" class="inline lineoption">delete</a>\
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
function addScriptlistLine(line, left, right, category) {
    scriptlistBuffer.append(getScriptlistLineHTML(line, left, right, category));
}

/**
 * Buffer to contain updated userinput content
 * @type {HTMLbuffer}
 */
var userinputBuffer = new HTMLbuffer('#userinput');

/**
 * [Input description]
 */
function Input() {
    this.bufferInput = function() {
        userinputBuffer.append(this.getHTML());
    }
}
Input.prototype.getHTML = function() {};
Input.prototype.initialize = function() {};

/**
 * Constructs a dynamic slider object
 * 
 * @param {String} identifier String to be used as a suffix in the id values of the generated html elements
 * @param {Object} quantity   Object which the input element affects
 * @param {String} label      String to be used as a label for the input element in the UI
 * @param {Number} val        Initial value of the slider
 * @param {Number} min        Minimal value of the slider
 * @param {Number} max        Maximal value of the slider
 * 
 * @class
 * @classdesc Dynamic slider class to be generated according to ACCEL script requirements
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
        slide: function(event, ui) {
            $('#userinput' + this.identifier).val(ui.value);
            //SEND CONTROLLER UPDATE
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
    $('#userslider' + this.identifier).slider(this.properties);
};

/**
 * Constructs a dynamic checkbox object
 *
 * @param {String} identifier String to be used as a suffix in the id values of the generated html elements
 * @param {Object} quantity   Object which the input element affects
 * @param {String} label      String to be used as a label for the input element in the UI
 * 
 * @class
 * @classdesc Dynamic checkbox class to be generated according to ACCEL script requirements
 */
function CheckboxInput(identifier, quantity, label) {
    this.identifier = identifier;
    this.quantity = quantity;
    this.label = label;

    this.identifier = 0;
    this.quantity = null;

    this.update = function () {
        controller.setValue(this.identifier, $('usercheck' + this.identifier).prop('checked'));
    };
}
CheckboxInput.prototype = new Input();
CheckboxInput.prototype.getHTML = function() {
    return '\
        <div id = "userinput' + identifier + '">\
            <label for = "usercheck' + identifier + '">' + label + '</label>\
            <input type = "checkbox" id = "usercheck' + identifier + '" onclick = "">\
        </div>\
    ';
};

/*
 * TODO Dynamic Text input field to be generated according to ACCEL script requirements
 */

/*
 * TODO Dynamic Button to be generated according to ACCEL script requirements
 */

/**
 * Array of input javascript objects
 * @type {Array}
 */
var inputs = [];

/**
 * Add dynamic input element to the #userinput element
 * 
 * @param {Object} elements    Object with {@code appendHTML(div, name, identifier)} function to append the corresponding HTML to #userinput
 * @param {String} label       A string displayed near the input element to describe it
 * @param {Number} identifier  A unique number to identify the element later on
 */
function addInput(element) {
    this.inputs.push(element);
    userinputBuffer.append(element.getHTML());
    console.log(this.inputs);

    userinputBuffer.flip();

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].initialize();
    }
}

/**
 * Object containing methods to modify the contents of the #results element
 * 
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
     * Adds a quantity to be defined to the #todo element
     * 
     * @param {String} quantity Quantity to be implemented
     * @param {String} property Type of the quantity
     */
    addTodo: function(quantity) {
        $('#todolist').append(this.getPropertyListHTML(quantity, ''));
    },

    addArg: function(quantity, property) {
        $('#arglist').append(this.getPropertyListHTML(quantity, property));
    },

    addArgto: function(quantity, property) {
        $('#argtolist').append(this.getPropertyListHTML(quantity, property));
    },

    /**
     * Adds a resulting quantity to the #result element
     * 
     * @param {String} quantity Left-hand of the equation
     * @param {String} result   Right-hand side of the equation
     */
    addResult: function(quantity, result) {
        $('#result').append(this.getEquationHTML(quantity, result));
    },

    addTooltip: function(div, id, msg, arrow) {

    }
};
