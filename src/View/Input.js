require.config({
    baseUrl: "scripts"
});

define(["View/HTMLBuffer", "View/Tooltip"], /**@lends View*/ function(HTMLBuffer, Tooltip) {
    /**
     * @class
     * @classdesc Container of various input classes..
     */
    function Input() {
        /**
         * The exported input classes.
         */
        this.Slider = Slider;
        this.CheckBox = CheckBox;
        this.TextBox = TextBox;
        this.Button = Button;
        this.ValueList = ValueList;
        this.SelectionList = SelectionList;
    }

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
    function Slider(identifier, quantity, label, val, min, max, rnd) {
        this.identifier = identifier;
        this.quantity = quantity;
        this.label = label;

        this.val = val;
        this.min = min;
        this.max = max;
        this.round = rnd;
        this.range = 200;   // The actual slider range of the input element. Values inside this range are
                            // converted to the user given range. In other words, this determines the step size
                            // in the same way the old ACCEL does.

        /**
         * Not used anymore, but this was the originally intended way to compute the range of a slider.
         * For compatibility with the old ACCEL, we reverted to a fixed actual range of 200.
         *
         * @param  {[type]} val [description]
         * @param  {[type]} min [description]
         * @param  {[type]} max [description]
         * @return {[type]}     [description]
         */
        this.getStepSize = function(val, min, max) {
            var stepsizes = [Math.pow(10, -view.getPrecision(val)),
                             Math.pow(10, -view.getPrecision(min)),
                             Math.pow(10, -view.getPrecision(max))];

            return Math.min.apply(Math, stepsizes);
        };

        this.properties = {
            range: "min",
            value: this.range * (this.val - this.min) / (this.max - this.min),
            min: 0,
            max: 200,
            step: 1,

            quantity: this.quantity, //Non-jquery addition to get the associated quantity within the slide function's scope
            identifier: this.identifier //Non-jquery addition to get the associated quantity within the slide function's scope
        };

        this.properties.slide = (function(event, ui) {
            sliderValue = ui.value;
            convertedValue = this.min + parseFloat(sliderValue) * (this.max - this.min) / 200;
            if (this.round) {
                convertedValue = Math.round(convertedValue);
            }

            $(this).val(convertedValue);
            this.val = convertedValue;
            controller.setUserInputQuantity(this.quantity, convertedValue);

            // Only update slider value in UI continuously if fastmode is disabled
            if (!view.tabs.editrun.fastmode || !view.hasPlot) {
                $('#userslider' + this.identifier + 'value').html('(' + convertedValue.toFixed(2) + ')');
            }
        }).bind(this);

        this.properties.stop = (function(event, ui) {
            $('#userslider' + this.identifier + 'value').html('(' + this.val.toFixed(2) + ')');
        }).bind(this);
    }

    Slider.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '" class="editrun_userinputentry">' +
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

    CheckBox.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '" class="editrun_userinputentry">' +
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

    TextBox.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '" class="editrun_userinputentry">' +
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

    Button.prototype.getHTML = function() {
        return '' +
            '<div id = "userinput' + this.identifier + '" class="editrun_userinputentry">' +
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
        this.values;

        /**
         * Buffer to contain HTML for the required list
         *
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.buffer = new HTMLBuffer();

        this.getEntryHTML = function(i, left, right) {
            return '' +
                '<div id = "' + this.selector.substring(1) + 'Entry' + i + '">' +
                    '<div class = "ellipsis max128w editrun_result_qtyname">' + left + '</div>' +
                    '<div class = "operator "> = </div>' +
                    '<div class = "ellipsis max128w resultvalue">' + right + '</div>' +
                '</div>';
        };

        this.initialize = function(size, values) {
            this.buffer.empty();
            var i;

            for (i = 0; i < size; i++) {
                this.buffer.append(this.getEntryHTML(i, '', ''));
            }

            this.buffer.flip(this.selector);

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

        this.set = function(values, numValues) {
            var newsize;
            if (typeof numValues === 'undefined') {
                newsize = Object.keys(values).length;
            } else {
                newsize = numValues;
            }

            if (!this.initialized || newsize != this.size) {
                this.size = newsize;
                this.initialize(this.size);
            }

            var entries = $(this.selector + ' > div');
            var i = 0;
            for (var v in values) {
                var columns = entries.eq(i++).children();
                columns.eq(0).text(v);
                columns.eq(2).text(values[v]);
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
        this.buffer = new HTMLBuffer();

        /**
         * Generates HTML for an item in the required list of selectable links
         *
         * @param {Number} i At which row to insert this element.
         * @param  {String} item String to represent an item in the list
         * @param {String} html (Optional) Additional html code to give to this element in the list
         * @return {String} HTML for an item in the required list of selectable links
         */
        this.getItemHTML = function(i, item, html) {
            if (typeof html === 'undefined') {
                html = '';
            }

            return '' +
                '<a ' + html + ' id = "' + this.selector.substring(1) + 'Item' + i + '" value = "' + item + '">' + item + '</a>';
        };

        /**
         * Adds an item to the list of selectable links
         *
         * @param {Number} i At which row to insert this element.
         * @param  {String} item String to represent an item in the list
         * @param {String} html (Optional) Additional html code to give to this element in the list
         */
        this.addItem = function(i, item, html) {
            this.buffer.append(this.getItemHTML(i, item, html));
        };


        this.initializeItem = function(i) {
            var itemselector = this.selector + 'Item' + i;

            $(itemselector).on('click', {list: this},
                function(e) {
                    e.data.list.callback.call(this.caller, $(this).text());
                }
            );
        };

        /**
         * Set the items contained in the list
         *
         * @param {String[]} items Strings to represent the items in the list
         * @param {Function} htmlfunc (Optional) A function that takes an element from items as
         * argument and returns optional additional html code for that element.
         */
        this.set = function(items, htmlfunc) {
            this.items = items;
            this.buffer.empty();
            var i;

            if (typeof htmlfunc !== 'undefined') {
                for (i in items) {
                    this.addItem(i, items[i], htmlfunc(items[i]));
                }
            } else {
                for (i in items) {
                    this.addItem(i, items[i]);
                }
            }

            this.buffer.flip(this.selector);

            for (i in items) {
                this.initializeItem(i);
            }
        };
    }


    /**
     * Class to generate a table of selectable items
     *
     * @memberof View
     * @param  {String}   selector Element to put the list in
     * @param  {Function} callback Function to be called when an item is clicked
     */
    function SelectionTable(selector, callback) {
        this.selector = selector;
        this.callback = callback;

        /**
         * Buffer to contain HTML for the required list
         *
         * @type {HTMLBuffer}
         */
        this.buffer = new HTMLBuffer();

        /**
         * Generates HTML for an item in the required list of selectable links
         *
         * @param {Number} i At which row to insert this element.
         * @param  {String} item String to represent an item in the list
         * @param {String} html (Optional) Additional html code to give to this element in the list
         * @return {String} HTML for an item in the required list of selectable links
         */
        this.getItemHTML = function(i, item, html) {
            if (typeof html === 'undefined') {
                html = '';
            }

            return '' +
                '<a ' + html + ' id = "' + this.selector.substring(1) + 'Item' + i + '" value = "' + item + '">' + item + '</a>';
        };

        /**
         * Adds an item to the list of selectable links
         *
         * @param {Number} i At which row to insert this element.
         * @param  {String} item String to represent an item in the list
         * @param {String} html (Optional) Additional html code to give to this element in the list
         */
        this.addItem = function(i, item, html) {
            this.buffer.append(this.getItemHTML(i, item, html));
        };


        this.initializeItem = function(i) {
            var itemselector = this.selector + 'Item' + i;

            $(itemselector).on('click', {list: this},
                function(e) {
                    e.data.list.callback.call(this.caller, $(this).text());
                }
            );
        };

        /**
         * Set the items contained in the list
         *
         * @param {String[]} items Strings to represent the items in the list
         * @param {Function} htmlfunc (Optional) A function that takes an element from items as
         * argument and returns optional additional html code for that element.
         */
        this.set = function(items, htmlfunc) {
            this.items = items;
            this.buffer.empty();
            var i;

            if (typeof htmlfunc !== 'undefined') {
                for (i in items) {
                    this.addItem(i, items[i], htmlfunc(items[i]));
                }
            } else {
                for (i in items) {
                    this.addItem(i, items[i]);
                }
            }

            this.buffer.flip(this.selector);

            for (i in items) {
                this.initializeItem(i);
            }
        };
    }

    return Input;
});
