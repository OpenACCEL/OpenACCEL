require.config({
    baseUrl: "scripts"
});

define([], /**@lends View*/ function() {
    /**
     * @class
     * @classdesc Container of various input classes..
     */
    function Input(buffer) {
        /**
         * Buffer to contain updated content
         * @memberof View
         * @type {HTMLbuffer}
         */
        this.buffer = typeof buffer === 'undefined' ? new HTMLbuffer() : buffer;

        /**
         * The exported input classes.
         */
        this.BaseInput = BaseInput;
        this.Slider = Slider;
        this.CheckBox = CheckBox;
        this.TextBox = TextBox;
        this.Button = Button;
    }

    /**
     * Constructs a base input element
     *
     * @memberof View
     * @class
     * @classdesc Base input element to be extended
     */
    function BaseInput() {
        this.bufferInput = function() {
            this.buffer.append(this.getHTML());
        };
    }

    BaseInput.prototype.getHTML = function() {};
    BaseInput.prototype.initialize = function() {};

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
    function Slider(identifier, quantity, label, val, min, max) {
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

    Slider.prototype = new BaseInput();

    Slider.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '">' +
                '<div class = "inline">' + this.label + '</div>' +
                '<div id = "userslider' + this.identifier + 'value" class = "inline">(' + this.val + ')</div>' +
                '<div id = "userslider' + this.identifier + '"></div>' +
            '</div>';
    };

    Slider.prototype.initialize = function() {
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
    function CheckBox(identifier, quantity, label, val) {
        this.identifier = identifier;
        this.quantity = quantity;
        this.label = label;

        this.val = val;
    }

    CheckBox.prototype = new BaseInput();

    CheckBox.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '">' +
                '<label for = "usercheck' + this.identifier + '">' + this.label + '</label>' +
                '<div class = "inline checkboxin">' +
                    '<input type = "checkbox" id = "usercheck' + this.identifier + '" ' + (this.val === true ? 'checked' : '') + '>' +
                    '<label for = "usercheck' + this.identifier + '"></label>' +
                '</div>' +
            '</div>';
    };

    CheckBox.prototype.initialize = function() {
        controller.setUserInputQuantity(this.quantity, this.val);

        var checkBox = this;
        $('#usercheck' + checkBox.identifier).on('change',
            function() {
                controller.setUserInputQuantity(checkBox.quantity, this.checked);
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
    function TextBox(identifier, quantity, label, val) {
        this.identifier = identifier;
        this.quantity = quantity;
        this.label = label;

        this.val = val;
    }

    TextBox.prototype = new BaseInput();

    TextBox.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '">' +
                '<label for = "usertext' + this.identifier + '">' + this.label + '</label>' +
                '<input type = "text" id = "usertext' + this.identifier + '" class = "textin" value = "' + this.val + '">' +
            '</div>';
    };

    TextBox.prototype.initialize = function() {
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
    function Button(identifier, quantity, label) {
        this.identifier = identifier;
        this.quantity = quantity;
        this.label = label;
    }

    Button.prototype = new BaseInput();

    Button.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '">' +
                '<label for = "userbutton' + this.identifier + '">' + this.quantity + '</label>' +
                '<input type = "button" id = "userbutton' + this.identifier + '" class = "buttonin" value = "' + this.label + '">' +
            '</div>';
    };

    Button.prototype.initialize = function() {
        controller.setUserInputQuantity(this.quantity, false);

        var buttoninput = this;
        $('#userbutton' + buttoninput.identifier).on('click',
            function() {
                controller.setUserInputQuantity(buttoninput.quantity, true);
            }
        );
    };

    return Input;
});
