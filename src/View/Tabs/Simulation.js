require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer", "Model/Script"], /**@lends View*/ function(Input, HTMLBuffer, Script) {
    /**
     * @class
     * @classdesc The Simulation tab.
     */
    function Simulation(canvasCreator) {
        /**
         * Buffer to contain updated #userinput content
         *
         * @memberof View
         * @type {HTMLBuffer}
         */
        this.userInputBuffer = new HTMLBuffer("#simulation_userinput");

        /**
         * Input element creation class.
         */
        this.Input = new Input();

        /**
         * Array of input javascript objects
         *
         * @memberof View
         * @type {Array}
         */
        this.inputs = [];

        /**
         * Plot canvas used in this tab.
         *
         * @type {Canvas}
         */
        this.canvas = canvasCreator.createCanvas(new Script(), "simulation_plot", 800, 600);

        /**
         * Whether to enable fast mode for the user inputs. Fast mode means only update
         * values of the sliders in the UI at the end of a slider drag event, disabled
         * means update continuously. Disabling this causes a significant performance slowdown
         * when interacting with sliders and plotting something.
         *
         * @type {Boolean}
         */
        this.fastmode = true;

        this.registerCallbacks();
    }

    /**
     * Sets up all callbacks for events within this tab.
     */
    Simulation.prototype.registerCallbacks = function() {
        // Called when the script has been modified
        $(document).on("onModifiedQuantity", function(event, quantities) {
            view.tabs.simulation.onModifiedQuantity(quantities);
        });

        // Called when a new script has been compiled
        $(document).on("onNewScript", function(event, quantities) {
            view.tabs.simulation.onNewScript(quantities);
        });
    };

    /**
     * Event that gets called when this tab gets opened.
     */
    Simulation.prototype.onEnterTab = function() {
        view.hasPlot = true;

        // If autoexecute is true, resume script only when it has been paused
        // by the system, and start executing when it is not paused but compiled
        if (controller.autoExecute) {
            if (controller.isPaused()) {
                controller.resume(true);
            } else {
                controller.run();
            }
        }

        this.makeInputs(controller.getScript().quantities);

        // Disable run button when script is incomplete, else enable (again)
        if (!controller.getScript().isComplete()) {
            if (!$('#simulation_runscript').hasClass('disabled')) {
                $('#simulation_runscript').addClass('disabled');
            }
        } else {
            if ($('#simulation_runscript').hasClass('disabled')) {
                $('#simulation_runscript').removeClass('disabled');
            }
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Simulation.prototype.onLeaveTab = function() {
        // Pause script when leaving edit/run tab, indicating it has
        // been paused automatically by the system and not by the user
        controller.pause(true);
    };

    /**
     * Called when the script is modified.
     *
     * @param  {Object} quantities All quantities in the current script
     */
    Simulation.prototype.onModifiedQuantity = function(quantities) {
        this.makeInputs(quantities);
    };

    /**
     * Called when the controller has compiled a new script.
     *
     * @param  {Object} quantities All quantities in the current script
     */
    Simulation.prototype.onNewScript = function(quantities) {
        this.makeInputs(quantities);
    };

    /**
     * Toggles the execution of the script.
     *
     * @param {String} 'Run' if the script should be ran, otherwise it will be paused.
     */
    Simulation.prototype.toggleExecution = function(action) {
        if (action === 'Run') {
            controller.run();
            $('#simulation_runscript').val('Pause');
        } else {
            controller.pause();
            $('#simulation_runscript').val('Run');
        }
    };

    Simulation.prototype.setExecuting = function(executing) {
        if (executing) {
            $('#simulation_runscript').val('Pause');
        } else {
            $('#simulation_runscript').val('Run');
        }
    };

    /**
     * Sets the amount of iterations the script should be ran.
     *
     * @param {Number} The amount of iterations the script will be ran.
     */
    Simulation.prototype.setIterations = function(iterations) {
        controller.setIterations(iterations);
        controller.stop();
        controller.run();
    };

    /**
     * Clears the plot canvas
     */
    Simulation.prototype.clearCanvas = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    Simulation.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    /**
     * Constructs all input controls based on the current model obtained
     * from the controller.
     *
     * @memberof View
     * @param  {Object} quantities All quantities registered in the model
     */
    Simulation.prototype.makeInputs = function(quantities) {
        var enableRun = true;
        this.resetInputs();
        var script = controller.getScript();
        var exe = script.exe;

        var i = 0;
        for (var q in quantities) {
            var quantity = quantities[q];

            if (!quantity.todo) {
                i++;
            } else {
                enableRun = false;
            }

            if (quantity.category == 1) {
                switch (quantity.input.type) {
                    case 'slider':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.Slider(i + "_sim", quantity.name, quantity.name, exe.getValue(quantity.name), parseFloat(quantity.input.parameters[1]), parseFloat(quantity.input.parameters[2]), quantity.input.round));
                        } else {
                            this.addInput(new this.Input.Slider(i + "_sim", quantity.name, quantity.name, parseFloat(quantity.input.parameters[0]), parseFloat(quantity.input.parameters[1]), parseFloat(quantity.input.parameters[2]), quantity.input.round));
                        }

                        break;
                    case 'check':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.CheckBox(i + "_sim", quantity.name, quantity.name, exe.getValue(quantity.name)));
                        } else {
                            this.addInput(new this.Input.CheckBox(i + "_sim", quantity.name, quantity.name, quantity.input.parameters[0]));
                        }

                        break;
                    case 'button':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.Button(i + "_sim", quantity.name, 'Click me', exe.getValue(quantity.name)));
                        } else {
                            this.addInput(new this.Input.Button(i + "_sim", quantity.name, 'Click me', quantity.input.parameters[0]));
                        }

                        break;
                    case 'text':
                        if (script.isCompiled()) {
                            this.addInput(new this.Input.TextBox(i + "_sim", quantity.name, quantity.name, exe.getValue(quantity.name)));
                        } else {
                            this.addInput(new this.Input.TextBox(i + "_sim", quantity.name, quantity.name, quantity.input.parameters[0]));
                        }

                        break;
                    default:
                        //Unknown input type
                        console.log('Unknown input type');
                        break;
                }
            }
        }

        // Disable buttons when script is incomplete, else enable (again)
        if (enableRun === false || quantities === null) {
            if (!$('#simulation_runscript').hasClass('disabled')) {
                $('#simulation_runscript').addClass('disabled');
            }
            if (!$('#simulation_reset').hasClass('disabled')) {
                $('#simulation_reset').addClass('disabled');
            }
        } else {
            if ($('#simulation_runscript').hasClass('disabled')) {
                $('#simulation_runscript').removeClass('disabled');
            }
            if ($('#simulation_reset').hasClass('disabled')) {
                $('#simulation_reset').removeClass('disabled');
            }
        }

        this.initInputs();
    };

    /**
     * Adds a dynamic input element to the #userinput element
     *
     * @memberof View
     * @param {Object} elements    Object with functions to generate the corresponding HTML to be put in #userinput
     */
    Simulation.prototype.addInput = function(element) {
        this.userInputBuffer.append(element.getHTML());
        this.inputs.push(element);
    };

    /**
     * Initializes the added input elements
     * @memberof View
     */
    Simulation.prototype.initInputs = function() {
        this.userInputBuffer.flip();

        for (var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].initialize();
        }
    };

    /**
     * Removes the existing input elements and empties the associated buffer
     * @memberof View
     */
    Simulation.prototype.resetInputs = function() {
        this.userInputBuffer.empty();
        var fastmodeHTML = (this.fastmode) ? " checked='checked'" : "";
        this.userInputBuffer.append("<div id='simulation_inputheader'><input type='checkbox' id='simulation_input_fasttoggle'" + fastmodeHTML + " onclick='view.tabs.simulation.setFastmode()' /><span style='vertical-align: middle;'>Fast mode</span></div>");
        this.inputs = [];
    };

    Simulation.prototype.setFastmode = function() {
        this.fastmode = $('#simulation_input_fasttoggle').is(':checked');
        view.tabs.editrun.fastmode = $('#simulation_input_fasttoggle').is(':checked');
    };

    return Simulation;
});
