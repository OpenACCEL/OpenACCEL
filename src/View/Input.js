require.config({
    baseUrl: "scripts"
});

define(["View/HTMLBuffer", "View/Tooltip"], /**@lends View*/ function(HTMLBuffer, Tooltip) {
    /**
     * @class
     * @classdesc Container of various input classes..
     */
    function Input(buffer) {
        /**
         * Buffer to contain updated content
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.buffer = typeof buffer === 'undefined' ? new HTMLBuffer() : buffer;

        /**
         * The exported input classes.
         */
        this.BaseInput = BaseInput;
        this.Slider = Slider;
        this.CheckBox = CheckBox;
        this.TextBox = TextBox;
        this.Button = Button;
        this.ValueList = ValueList;
        this.SelectionList = SelectionList;
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
            var stepsizes = [Math.pow(10, -view.getPrecision(val)),
                             Math.pow(10, -view.getPrecision(min)),
                             Math.pow(10, -view.getPrecision(max))];

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

    function ValueList(selector) {
        this.selector = selector;
        this.initialized = false;
        this.size = 0;

        /**
         * Buffer to contain HTML for the required list
         *
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.buffer = new HTMLBuffer(selector);

        this.getEntryHTML = function(i, left, right) {
            return '' +
                '<div id = "' + this.selector.substring(1) + 'Entry' + i + '">' +
                    '<div class = "ellipsis max128w">' + left + '</div>' +
                    '<div class = "operator"> = </div>' +
                    '<div class = "ellipsis max128w resultvalue">' + right + '</div>' +
                '</div>';
        };

        this.initialize = function(size) {
            this.buffer.empty();
            var i;

            for (i = 0; i < size; i++) {
                this.buffer.append(this.getEntryHTML(i, '', ''));
            }

            this.buffer.flip();

            var entries = $(this.selector + ' > div');
            i = 0;
            entries.children(':last-child').on('click', {id: i++},
                function(e) {
                    $('.datamessage').parent().remove();

                    var resultvalue = $(this);
                    var location = resultvalue.offset();
                    var fullvalue = new Tooltip(e.data.id, 'datamessage', location.left + 10, location.top + resultvalue.height());
                    fullvalue.set(resultvalue.html());
                }
            );

            this.initialized = true;
        };

        this.set = function(values) {
            var newsize = Object.keys(values).length;

            if (!this.initialized || newsize != this.size) {
                this.size = newsize;
                this.initialize(this.size);
            }

            var entries = $(this.selector + ' > div');
            var i = 0;
            for (var v in values) {
                var columns = entries.eq(i++).children();
                columns.eq(0).text(v);
                columns.eq(2).html(values[v]);
            }
        };
    }

    /**
     * Class to generate a list of selectable items
     *
     * @memberof View
     * @param  {String}   selector Element to put the list in
     * @param  {Function} callback Function to be called when an item is clicked
     */
    function SelectionList(selector, callback) {
        this.selector = selector;
        this.callback = callback;

        /**
         * Buffer to contain HTML for the required list
         *
         * @type {HTMLBuffer}
         */
        this.buffer = new HTMLBuffer(this.selector);

        /**
         * Generates HTML for an item in the required list of selectable links
         *
         * @param  {String} item String to represent an item in the list
         * @return {String}      HTML for an item in the required list of selectable links
         */
        this.getItemHTML = function(i, item) {//onclick = "' + this.callbackname + '(\'' + item + '\')"
            return '' +
                '<a id = "' + this.selector.substring(1) + 'Item' + i + '" value = "' + item + '">' + item + '</a>';
        };

        /**
         * Adds an item to the list of selectable links
         *
         * @param {String} item String to represent an item in the list
         */
        this.addItem = function(i, item) {
            this.buffer.append(this.getItemHTML(i, item));
        };


        this.initializeItem = function(i) {
            var itemselector = this.selector + 'Item' + i;

            $(itemselector).on('click', {list: this},
                function(e) {
                    e.data.list.callback(this);
                }
            );
        };

        /**
         * Set the items contained in the list
         *
         * @param {String[]} items Strings to represent the items in the list
         */
        this.set = function(items) {
            this.items = items;
            this.buffer.empty();
            var i;

            for (i in items) {
                this.addItem(i, items[i]);
            }

            this.buffer.flip();

            for (i in items) {
                this.initializeItem(i);
            }
        };
    }

    return Input;
});
