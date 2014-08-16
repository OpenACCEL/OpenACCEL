require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer"], /**@lends View*/ function(Input, HTMLBuffer) {
    /**
     * @class
     * @classdesc The EditRun tab.
     */
    function EditRun() {
        /**
         * Number of object-elements the objectToString function
         * should generate before it is terminated.
         *
         * @memberof View
         * @type {Number}
         */
        this.maxPrintElements = 1000;

        /**
         * Buffer to contain updated #scriptlist content
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.scriptListBuffer = new HTMLBuffer();

        /**
         * Buffer to contain updated #userinput content
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.userInputBuffer = new HTMLBuffer();

        /**
         * Input element creation class.
         */
        this.Input = new Input();

        /**
         * Array of input javascript objects
         * @memberof View
         * @type {Array}
         */
        this.inputs = [];

        /**
         * Object containing tools to modify the contents of the todo list, argument lists and result list
         * @memberof View
         * @type {Object}
         */
        this.report = {
            /**
             * Generates HTML for an item in the list of todos
             *
             * @param {String} quantity Quantity which is to be implemented
             */
            getTodoListHTML: function(quantity) {
                return '' +
                    '<div onclick = "view.tabs.editrun.report.onclickTodo(\'' + quantity + '\')" class = "hoverbold">' +
                        '<div class="ellipsis max128w">' + quantity + '</div>' +
                    '</div>';
            },
            onclickTodo: function(quantity) {
                $('#scriptline').html(quantity + ' =&nbsp;');
            },

            /**
             * Buffer to contain updated #todolist content
             * @type {HTMLBuffer}
             */
            todoListBuffer: new HTMLBuffer(),

            /**
             * Adds a quantity to be defined to the #todo element
             *
             * @param {String} quantity Quantity to be implemented
             */
            addTodo: function(quantity) {
                view.tabs.editrun.report.todoListBuffer.append(this.getTodoListHTML(quantity));
            },

            /**
             * Generates HTML for an item in a list of quantities with a certain property
             *
             * @param  {String} quantity Quantity of which a property is being displayed
             * @param  {String} property Property of the associated quantity
             */
            getPropertyListHTML: function(quantity, property) {
                return '' +
                    '<div onclick = "view.tabs.editrun.report.onclickProperty(\'' + quantity + '\')" class = "hoverbold">' +
                        '<div class="ellipsis max128w">' + quantity + '</div>' +
                        '<div class="property">' + property + '</div>' +
                    '</div>';
            },
            onclickProperty: function(quantity) {
                var i = lineNumber[quantity];
                view.tabs.editrun.selectScriptline(i, quantity);
                $('#line' + i).trigger('click');
            },

            /**
             * Buffer to contain updated #arglist content
             * @type {HTMLBuffer}
             */
            argListBuffer: new HTMLBuffer(),

            /**
             * Adds a quantity to the list of quantities which are a parameter to the selected quantity
             *
             * @param {String} quantity Quantity which is an argument for the selected quantity
             * @param {String} property [description]
             */
            addArg: function(quantity, property) {
                view.tabs.editrun.report.argListBuffer.append(this.getPropertyListHTML(quantity, property));
            },

            /**
             * Buffer to contain updated #argtolist content
             * @type {HTMLBuffer}
             */
            argToListBuffer: new HTMLBuffer(),

            /**
             * Adds a quantity to the list of quantities which use the selected quantity as a parameter
             *
             * @param {String} quantityQuantity for which the selected quantity is an argument
             * @param {String} property [description]
             */
            addArgto: function(quantity, property) {
                view.tabs.editrun.report.argToListBuffer.append(this.getPropertyListHTML(quantity, property));
            },

            /**
             * List to allow for value updates without reconstruction of the HTML
             *
             * @type ValueList
             */
            resultList: new this.Input.ValueList('#result')
        };

        $('#scriptline').keypress(
            function(e) {
                if (e.which === 13) {
                    $('#enterline').click();
                }
            }
        );

        // Hide what needs hiding.
        this.report.todoListBuffer.hideIfEmpty('#tododiv');
        this.report.argListBuffer.hideIfEmpty('#arglistdiv');
        this.report.argToListBuffer.hideIfEmpty('#argtodiv');
        this.userInputBuffer.hideIfEmpty('#userinputdiv');
        this.report.resultList.buffer.hideIfEmpty('#resultdiv');
        $('#plotdiv').toggle(false);

        this.lineNumber = {};
    }

    /**
     * Deletes a quantity from the script.
     * 
     * @param {String} The quantity to delete.
     */
    EditRun.prototype.deleteQuantity = function(quantity) {
        controller.deleteQuantity(quantity);
    };

    /**
     * Adds a quantity to the script.
     * 
     * @param {String} The quantity to add.
     */
    EditRun.prototype.addQuantity = function(string) {
        this.setPendingScriptLine(string);

        string = string.trim();
        if (string === '') {
            //Do nothing if nothing was entered
            this.setPendingScriptLine(null);
        } else {
            setTimeout(
                (function() {
                    $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');

                    try {
                        controller.addQuantity(string);
                    } catch (error) {
                        console.log(error);
                        view.handleError(error);
                    }

                    this.setPendingScriptLine(null);

                    view.selectContent('#scriptline');
                }).bind(this),
                10
            );
        }
    };

    /**
     * Toggles the execution of the script.
     * 
     * @param {String} 'Run' if the script should be ran, otherwise it will be paused.
     */
    EditRun.prototype.toggleExecution = function(action) {
        if (action === 'Run') {
            controller.run();
            $('#runscript').val('Pause');
        } else {
            controller.pause();
            $('#runscript').val('Run');
        }
    };

    /**
     * Creates a new script if confirmed.
     */
    EditRun.prototype.newScript = function() {
        if (confirm("Are you sure you want to stop your current script and delete all existing script lines? It can not be undone.")) {
            controller.newScript();
        }
    };

    /**
     * Sets the amount of iterations the script should be ran.
     * 
     * @param {Number} The amount of iterations the script will be ran.
     */
    EditRun.prototype.setIterations = function(iterations) {
        controller.setIterations(iterations);
        controller.stop();
        controller.run();
    };

    /**
     * Synchronize the content of the #scriptlist div with the model
     *
     * @memberof View
     * @param  {Object} quantities All quantities registered in the model
     */
    EditRun.prototype.synchronizeScriptList = function(quantities) {
        this.scriptListBuffer.empty();
        this.lineNumber = {};
        this.report.todoListBuffer.empty();
        this.resetInputs();

        var i = 0;
        for (var q in quantities) {
            var quantity = quantities[q];

            //TODOs
            if (quantity.todo) {
                this.report.addTodo(quantity.name);
            } else {
                i++;
                this.lineNumber[quantity.name] = i;
                this.addScriptlistLine(i, quantity.name, quantity.LHS, quantity.definition, quantity.category);
            }

            //User Input
            if (quantity.category == 1) {
                switch (quantity.input.type) {
                    case 'slider':
                        this.addInput(new this.Input.Slider(i, quantity.name, quantity.name, parseFloat(quantity.input.parameters[0]), parseFloat(quantity.input.parameters[1]), parseFloat(quantity.input.parameters[2])));
                        break;
                    case 'check':
                        this.addInput(new this.Input.CheckBox(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                        break;
                    case 'button':
                        this.addInput(new this.Input.Button(i, quantity.name, 'Click me', quantity.input.parameters[0]));
                        break;
                    case 'text':
                        this.addInput(new this.Input.TextBox(i, quantity.name, quantity.name, quantity.input.parameters[0]));
                        break;
                    default:
                        //Unknown input type
                        console.log('Unknown input type');
                        break;
                }
            }
        }

        this.scriptListBuffer.flip("#scriptlist");
        this.report.todoListBuffer.flip("#todolist");
        this.initInputs();

        //Hide what needs hiding
        this.report.todoListBuffer.hideIfEmpty('#tododiv');
        this.report.argListBuffer.hideIfEmpty('#arglistdiv');
        this.report.argToListBuffer.hideIfEmpty('#argtodiv');
        this.userInputBuffer.hideIfEmpty('#userinputdiv');
        this.report.resultList.buffer.hideIfEmpty('#resultdiv');
        $('#plotdiv').toggle(false);
    };

    /**
     * Synchronize the content of the #result div with the model
     *
     * @memberof View
     * @param  {Object} quantities All category 2 quantities registered in the model
     */
    EditRun.prototype.synchronizeResults = function(quantities) {
        var resultValues = {};

        for (var q in quantities) {
            var quantity = quantities[q];
            resultValues[quantity.name] = objectToString(controller.getQuantityValue(quantity.name), this.maxPrintElements);
        }

        this.report.resultList.set(resultValues);
        this.report.resultList.buffer.hideIfEmpty('#resultdiv');
    };

    /**
     * Selects indicated line and puts it's contents in the #scriptline element
     *
     * @memberof View
     * @param  {Number} line  Identifier of the to be selected line
     * @param  {String} value To be put in the #scriptline element
     */
    EditRun.prototype.selectScriptline = function(linenr, quantityname) {
        this.report.argListBuffer.empty();
        this.report.argToListBuffer.empty();

        if ($('#line' + linenr).length > 0) {
            var quantity = controller.getQuantity(quantityname);

            var scriptline = $('#scriptline');
            scriptline.text(quantity.source);

            $('.quantityname').text(quantityname);

            //list parameters (type = dummy)
            for (var p in quantity.parameters) {
                this.report.addArg(quantity.parameters[p], 'dummy');
            }

            //list dependencies (type = regular)
            for (var d in quantity.dependencies) {
                this.report.addArg(quantity.dependencies[d], 'regular');
            }

            //list used standard functions (type = standard function)
            //TODO

            //list reverse dependencies (type = regular)
            for (var r in quantity.reverseDeps) {
                this.report.addArgto(quantity.reverseDeps[r], 'regular');
            }
        }

        this.report.argListBuffer.flip("#arglist");
        this.report.argToListBuffer.flip("#argtolist");

        this.report.argListBuffer.hideIfEmpty('#arglistdiv');
        this.report.argToListBuffer.hideIfEmpty('#argtodiv');
    };

    /**
     * Deselects the previously selected line and hides the argument lists
     * @memberof View
     */
    EditRun.prototype.deselectScriptline = function() {
        this.selectScriptline(null, null);
        $('#scriptline').text('');

        this.report.argListBuffer.hideIfEmpty('#arglistdiv');
        this.report.argToListBuffer.hideIfEmpty('#argtodiv');
    };

    /**
     * Resets the edit/run tab to it's initial state
     * @memberof View
     */
    EditRun.prototype.resetEditRun = function() {
        this.synchronizeScriptList(null);
        this.synchronizeResults(null);
        this.selectScriptline(null, null);
        $('#scriptline').text('');

        this.report.todoListBuffer.hideIfEmpty('#tododiv');
        this.report.argListBuffer.hideIfEmpty('#arglistdiv');
        this.report.argToListBuffer.hideIfEmpty('#argtodiv');
        this.userInputBuffer.hideIfEmpty('#userinputdiv');
        this.report.resultList.buffer.hideIfEmpty('#resultdiv');
        $('#plotdiv').toggle(false);
    };

    EditRun.prototype.setExecuting = function(executing) {
        if (executing) {
            $('#runscript').val('Pause');
        } else {
            $('#runscript').val('Run');
        }
    };

    /**
     * Generates HTML for a line of ACCEL code to be added to the listing in the #scriptlist element
     *
     * @memberof View
     * @param {Number} line     Line number to identify this line of code
     * @param {String} left     Left-hand of the equation
     * @param {String} right    Right-hand side of the equation
     * @param {Number} category Category to which the left-hand side belongs
     */
    EditRun.prototype.getScriptlistLineHTML = function(linenr, quantity, left, right, category) {
        return '' +
            '<input type="radio" name="script" id="line' + linenr + '" value="' + left + ' = ' + right + '">' +
            '<label for="line' + linenr + '" onclick = "view.tabs.editrun.selectScriptline(' + linenr + ', \'' + quantity + '\');">' +
                '<div class="inline ellipsis max128w">' + left + '</div>' +
                '<div class="inline operator">=</div>' +
                '<div class="inline ellipsis max128w">' + right + '</div>' +
                '<div class="inline comment">(cat.=' + category + ')</div>' +
                '<a onclick="deleteQuantity(\'' + quantity + '\')" class="inline lineoption">delete</a>' +
            '</label>';
    };

    /**
     * Adds HTML for a line of ACCEL code to the buffer
     *
     * @memberof View
     * @param {Number} line     Line number to identify this line of code
     * @param {String} left     Left-hand of the equation
     * @param {String} right    Right-hand side of the equation
     * @param {Number} category Category to which the left-hand side belongs
     */
    EditRun.prototype.addScriptlistLine = function(linenr, quantity, left, right, category) {
        //Secure right hand from input
        right = view.encodeHTML(right);

        this.scriptListBuffer.append(this.getScriptlistLineHTML(linenr, quantity, left, right, category));
    };


    EditRun.prototype.setPendingScriptLine = function(line) {
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
    };

    /**
     * Removes the existing input elements and empties the associated buffer
     * @memberof View
     */
    EditRun.prototype.resetInputs = function() {
        this.userInputBuffer.empty();
        this.inputs = [];
    };

    /**
     * Adds a dynamic input element to the #userinput element
     *
     * @memberof View
     * @param {Object} elements    Object with functions to generate the corresponding HTML to be put in #userinput
     */
    EditRun.prototype.addInput = function(element) {
        this.userInputBuffer.append(element.getHTML());
        this.inputs.push(element);
    };

    /**
     * Initializes the added input elements
     * @memberof View
     */
    EditRun.prototype.initInputs = function() {
        this.userInputBuffer.flip("#userinput");

        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].initialize();
        }
    };

    return EditRun;
});
