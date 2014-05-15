/**
 * Object containing methods to modify the contents of the #scriptline element
 * 
 * @type {Object}
 */
var objectScriptline = {
    /**
     * Selects indicated line and puts it's contents in the #scriptline element
     * 
     * @param  {Number} line  Identifier of the to be selected line
     * @param  {String} value To be put in the #scriptline element
     */
    selectLine: function(line, value) {
        console.log('select ' + line + ', ' + value);
        if ($('#line' + line).length > 0) {
            var scriptline = $('#scriptline');
            scriptline.val(value);
        }
    }
};

/**
 * Object containing methods to modify the contents of the #scriptlist element
 * 
 * @type {Object}
 */
var objectScriptlist = {
    /**
     * Removes a line of ACCEL code from the listing in the #scriptlist element
     * 
     * @param {Number} line to be removed
     */
    removeLine: function(line) {
        var scriptline = $('#scriptline');
        var selectedline = $('#line' + line);
        if (selectedline.val() == scriptline.val()) {
            scriptline.val('');
        }
        $('label[for = "line' + line + '"]').remove();
        selectedline.remove();
        console.log('Removed ');
        console.log(line);
    },

    /**
     * Adds a line of ACCEL code to the listing in the #scriptlist element
     * 
     * @param {Number} line     Line number to identify this line of code
     * @param {String} left     Left-hand of the equation
     * @param {String} right    Right-hand side of the equation
     * @param {Number} category Category to which the left-hand side belongs
     */
    addLine: function(line, left, right, category) {
        $('#scriptlist').append('\
            <input type="radio" name="script" id="line' + line + '" value="' + left + ' = ' + right + '">\
            <label for="line' + line + '" onclick = "objectScriptline.selectLine(' + line + ', \'' + left + ' = ' + right + '\');">\
                <div class="inline ellipsis max256w">' + left + '</div>\
                <div class="inline operator">=</div>\
                <div class="inline ellipsis max256w">' + right + '</div>\
                <div class="inline comment">(cat.=' + category + ')</div>\
                <a onclick="objectScriptlist.removeLine(' + line + ')" class="inline lineoption">delete</a>\
            </label>\
        ');
    }
};

/**
 * Object containing methods to modify the contents of the #userinput element
 * 
 * @type {Object}
 */
var objectUserinput = {
    /**
     * Constructs a dynamic slider object
     * 
     * @param {Number} val Initial value of the slider
     * @param {Number} min Minimal value of the slider
     * @param {Number} max Maximal value of the slider
     * @class
     * @classdesc Dynamic slider class to be generated according to ACCEL script requirements
     */
    SliderInput: function(val, min, max) {
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

        this.getHTML = function(label, identifier) {
            return '\
                <div id = "userinput' + identifier + '">\
                    <div class = "inline">' + label + '</div>\
                    <div id = "userslider' + identifier + '"></div>\
                </div>\
            ';
        },

        this.appendHTML = function(div, label, identifier) {
            $(div).append(this.getHTML(label, identifier));
            this.identifier = identifier;
            $('#userslider' + identifier).slider(this.properties);
        }
    },

    /*
     * Dynamic Checkbox to be generated according to ACCEL script requirements
     */

    /*
     * Dynamic Text input field to be generated according to ACCEL script requirements
     */

    /*
     * Dynamic Button to be generated according to ACCEL script requirements
     */
    
    /**
     * Add dynamic input element to the #userinput element
     * 
     * @param {Object} elements    Object with {@code appendHTML(div, name, identifier)} function to append the corresponding HTML to #userinput
     * @param {String} label       A string displayed near the input element to describe it
     * @param {Number} identifier  A unique number to identify the element later on
     */
    addInput: function(element, label, identifier) {
        element.appendHTML('#userinput', label, identifier)
    }
};

/**
 * Object containing methods to modify the contents of the #todo element
 * 
 * @type {Object}
 */
var objectResults = {
    /**
     * Adds a variable to be defined to the #todo element
     * 
     * @param {String} left     Left-hand of the equation
     * @param {String} right    Right-hand side of the equation
     */
    addLine: function(left, right) {
        $('#todo').append('\
            <div>\
                <div class="inline ellipsis max256w">' + left + '</div>\
                <div class="inline operator">=</div>\
                <div class="inline ellipsis max256w">' + right + '</div>\
                <div class="inline property">(cat.=' + category + ')</div>\
                <a onclick="objectScriptlist.removeLine(' + line + ')" class="inline lineoption">delete</a>\
            </div>\
        ');
    }
};

/**
 * Object containing methods to modify the contents of the #results element
 * 
 * @type {Object}
 */
var report = {
    getEquationHTML: function(left, right) {
        return '\
            <div>\
                <div class="inline ellipsis max256w">' + left + '</div>\
                <div class="inline operator">=</div>\
                <div class="inline ellipsis max256w">' + right + '</div>\
            </div>\
        ';
    },

    getPropertyListHTML: function(x, property) {
        return '\
            <div>\
                <div class="inline ellipsis max256w">' + x + '</div>\
                <div class="inline property">' + property + '</div>\
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
    }
};