/*
 * File containing the Controller Class.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["Model/Script",
        "Model/Compiler",
        "Model/Datastores/LocalBackupStore",
        "Model/Exceptions/SyntaxError",
        "Model/Exceptions/RuntimeError",
        "Model/EMO/GeneticOptimisation",
        "Controller/AbstractView",
        "Model/Library",
        "Model/DebugMessage"
    ],
    /**@lends Controller*/
    function(Script, Compiler, LocalBackupStore, SyntaxError, RuntimeError, GeneticOptimisation, AbstractView, Library, DebugMessage) {
        /**
         * @class
         * @classdesc The Controller is the intermediar between the Model and the View.
         *
         * @param view {AbstractView} The view with which the controller will communicate
         * to present the results and data. If not provided, the controller will use a
         * dummy view.
         * @param script {Script} The script that the controller should manage and execute.
         * @param compiler {Compiler} The compiler that should be used to compile the script.
         */
        function Controller(view) {
            /**
             * The view with which the controller will communicate
             * to present the results and data.
             *
             * @type {AbstractView}
             */
            this.view = null;
            if (typeof view !== 'undefined') {
                this.view = view;
            } else {
                // Used in tests
                this.view = new AbstractView();
            }

            /**
             * The compiler that will be used to compile the script.
             *
             * @type {Compiler}
             */
            this.compiler = new Compiler();

            /**
             * The script that this Controller will manage and execute.
             *
             * @type {Script}
             */
            this.script = new Script();

            /**
             * The library of metadata and help articles about ACCEL.
             *
             * @type {Library}
             */
            this.library = new Library();

            /**
             * The GeneticOptimisation object used to do Genetic Optimization.
             *
             * @type {GeneticOptimisation}
             */
            this.geneticOptimisation = new GeneticOptimisation();

            /**
             * The number of iterations that the script should perform.
             * If zero, the script will continue running untill stopped.
             * If greater than zero, after this number of iterations the result
             * is presented and the execution stops.
             *
             * @type {Number}
             */
            this.numIterations = 0;

            /**
             * The current iteration of script execution.
             * Range: [1, this.numIterations]
             *
             * @type {Number}
             */
            this.currentIteration = 1;

            /**
             * Whether the script _should_ be executing. If false, the script
             * has already stopped or will abort in the next call to the
             * execute() method.
             *
             * @type {Boolean}
             */
            this.executing = false;

            /**
             * Whether the script is currently paused.
             *
             * @type {Boolean}
             */
            this.paused = false;

            /**
             * The number of milliseconds to wait between iterations.
             * Do not set directly but use the setter!
             *
             * @type {Number}
             */
            this.renderspeed = 5;

            /**
             * Whether, if the script is paused, it has
             * been paused by the system.
             *
             * @type {Boolean}
             */
            this.pausedBySystem = false;

            /**
             * Unique id for the runloop interval.
             *
             * @type {Number}
             */
            this.runloop = null;

            /**
             * Whether the controller should automatically execute the script
             * after adding or removing quantities. Currently set to false
             * by default, for testing purposes.
             *
             * @type {Boolean}
             */
            this.autoExecute = false;

            /**
             * Whether each quantity should be saved to localStorage when it's
             * added to the script.
             *
             * @type {Boolean}
             */
            this.autoSave = false;

            /**
             * The Quantity Store used for autosaving the script.
             *
             * @type {LocalBackupStore}
             */
            this.autoSaveStore = new LocalBackupStore();

            /**
             * The currently active tab in the UI.
             *
             * @type {Number}
             */
            this.currentTab = 1;

            /**
             * The current status of the application.
             *
             * @type {String}
             */
            this.status = "";

            /**
             * For performance profiling
             */
            /*if (inBrowser) {
                this.curMeasurement = 0;
                this.numMeasurements = 1000;
                this.measurements = new Array(this.numMeasurements);

                // Determine which profiling function to use
                window.performance = window.performance || {};
                performance.now = (function() {
                    return performance.now    ||
                        performance.mozNow    ||
                        performance.msNow     ||
                        performance.oNow      ||
                        performance.webkitNow ||
                        function() {
                            return new Date().getTime();
                        };
                })();
            }*/
        }

        /**
         * Checks and computes the unit of every quantity in the given script source
         *
         * @param {String} source The source of the script of which to check the quantities
         */
        Controller.prototype.checkUnits = function(source) {
            // Check syntax and build the script from the given source
            this.setScriptFromSource(source, true);

            // Load the units and recompile the script.
            this.compiler.setUnits(true);
            if (!this.compileScript(this.script)) {
                throw {"message":"Unable to check units: script is not complete.", "incomplete":true};
            }

            // Let the script check units
            try {
                this.script.checkUnits();
            } catch(e) {
                throw e;
            } finally {
                this.compiler.setUnits(false);
            }
        };

        /**
         * Sets whether the controller should automatically execute the script
         * after adding or removing quantities.
         *
         * @param autoExecute {Boolean} Whether to automatically begin executing
         * after the script has been changed.
         * @post this.autoExecute = autoExecute
         */
        Controller.prototype.setAutoExecute = function(autoExecute) {
            this.autoExecute = autoExecute;
        };

        /**
         * Sets the number of milliseconds to wait between consecutive iterations
         * of script execution.
         *
         * @param {Number} speed Integer larger than 4
         */
        Controller.prototype.setRenderSpeed = function(speed) {
            if (speed < 4) {
                speed = 4;
            }
            console.log(speed);
            this.pause();
            this.resume();
            this.renderspeed = speed;
        };

        /**
         * Sets whether the controller should automatically save the script to the
         * backup store when adding or removing quantities.
         *
         * @param autoSave {Boolean} Whether to automatically save the script to the
         * backup store
         * @post this.autoSave = autoSave
         */
        Controller.prototype.setAutoSave = function(autoSave) {
            this.autoSave = autoSave;
        };

        /**
         * Returns whether the script execution is currently paused.
         *
         * @return {Boolean} Whether the script execution is currently paused.
         */
        Controller.prototype.isPaused = function() {
            return this.paused;
        };

        /**
         * Returns whether the script execution has been paused by
         * the system
         *
         * @return {Boolean} Whether the script has been paused
         * by the system.
         */
        Controller.prototype.isPausedBySystem = function() {
            return this.pausedBySystem;
        };

        /**
         * Sets the current position of the mouse cursor inside the
         * descartes canvas, for use in the script. Descartes canvas coordinates
         * are always within the range [0,100].
         *
         * @pre 0 <= x <= 100
         * @pre 0 <= y <= 100
         * @param x {Number} The x coordinate of the mouse cursor inside the
         * descartes canvas
         * @param y {Number} The y coordinate of the mouse cursor inside the
         * descartes canvas
         */
        Controller.prototype.setMousePosInScript = function(x, y) {
            if (this.script.isCompiled()) {
                this.script.exe.setMousePos(x, y);
            }
        };

        /**
         * Returns a list with the names of all built-in accel functions.
         * @return {Array} An array containing the names of all built-in ACCEL functions
         */
        Controller.prototype.getACCELFunctions = function() {
            return this.library.getFunctions({'all': true, 'escaped': false});
        };

        /**
         * Sets the current left mouse button status.
         *
         * @param buttonDown {Boolean} Whether the left mouse button is currently
         * pressed
         */
        Controller.prototype.setMouseButtonInScript = function(buttonDown) {
            if (this.script.isCompiled()) {
                this.script.exe.setMouseButton(buttonDown);
            }
        };

        /**
         * Sets the current plot status.
         *
         * @param status {String} Report of any errors occured while plotting
         */
        Controller.prototype.setPlotStatusInScript = function(status) {
            if (this.script.isCompiled()) {
                this.script.exe.setPlotStatus(status);
            }
        };

        /**
         * Sets wether the application should use web workers when they are
         * available on the user's system. Currently workers are not used for
         * anything but this can change in the future
         *
         * @param useWorkers {Boolean} Whether workers should be used when available
         */
        Controller.prototype.setUseWorkers = function(useWorkers) {
            if (useWorkers && typeof(Worker) !== 'undefined' && inBrowser) {
                this.useWorkers = true;
            } else {
                this.useWorkers = false;
            }
        };

        /**
         * Starts execution of the script from the start.
         *
         * @post The script is being executed in a loop if the
         * script is complete and non-empty.
         * The script has been resumed if it was paused and
         * otherwise has been started over.
         */
        Controller.prototype.run = function() {
            if (this.executing) {
                return;
            }

            // If script isn't compiled yet compile it now
            if (!this.script.isCompiled()) {
                try {
                    this.compileScript(this.script);
                } catch (e) {
                    this.view.runtimeError(e);
                }
            }

            // If the execution has reached the last iteration and has stopped there,
            // start at the beginning again
            if (this.numIterations > 0 && this.currentIteration >= this.numIterations) {
                this.reset();
            }

            // Update state
            this.executing = true;
            this.paused = false;
            this.status = "Executing";
            this.view.setStatus(this.status);
            this.view.setExecuting(this.executing);

            // Start runloop
            var controller = this;
            this.runloop = setInterval(
                (function() {
                    try {
                        this.execute();
                    } catch (e) {
                        this.view.runtimeError(e);
                        this.stop();
                    }
                }).bind(this), this.renderspeed   /** Number of milliseconds between executions of runloop **/
            );
        };

        /**
         * Resumes script execution when paused, optionally only when
         * paused by the user (instead of the system).
         *
         * @param systemOnly {Boolean} Whether to only resume the script
         * when it has been paused by the system.
         */
        Controller.prototype.resume = function(systemOnly) {
            if (this.paused && (this.pausedBySystem || !systemOnly)) {
                this.run();
            }
        };

        /**
         * Evaluates the values of all category 2 quantities and provides
         * them to the view.
         *
         * @pre this.script.isComplete()
         * @throws {RuntimeError} If an error occured while evaluating one of the
         * output quantities in the script.
         * @post The view has received the current values of all output quantities.
         */
        Controller.prototype.execute = function() {
            /*var pretime, posttime;
            if (inBrowser) {
                pretime = performance.now();
            }*/

            // Extra check to make sure that the model is complete and we are
            // really (still) executing
            if (!this.script.isCompiled()) {
                this.stop();
                return;
            }

            // Check whether another iteration should be made
            if (this.numIterations === 0 || this.currentIteration <= this.numIterations) {
                // Evaluate the expressions (definitions) of all output quantities
                this.script.step();
                this.currentIteration++;
                this.view.onNextStep();

                // Signal the executable that one iteration has been completed,
                // for quantity history functionality
                this.script.exe.step();
            }

            // If specified number of iterations have been reached, stop executing
            if (this.numIterations > 0 && this.currentIteration > this.numIterations) {
                this.stop();
            }

            /*if (inBrowser && this.curMeasurement < this.numMeasurements) {
                posttime = performance.now();
                this.measurements[this.curMeasurement] = posttime-pretime;
                this.curMeasurement++;
            }*/
        };

        /**
         * Pauses the script but does not clear history or resets
         * the current iteration.
         *
         * @param pausedBySystem {Boolean} (Optional) Whether the script is being
         * paused by the system (else: paused by user)
         * @post this.executing == false && this.paused == true &&
         * this.pausedBySystem == pausedBySystem
         */
        Controller.prototype.pause = function(pausedBySystem) {
            if (typeof pausedBySystem === 'undefined') {
                pausedBySystem = false;
            }

            if (this.executing) {
                clearInterval(this.runloop);

                // Update state
                this.executing = false;
                this.paused = true;
                this.pausedBySystem = pausedBySystem;
                this.view.setExecuting(this.executing);
                this.status = "Paused";
                this.view.setStatus(this.status);

                // Performance measurements
                /*if (inBrowser && this.curMeasurement > 0) {
                    var total = this.measurements.slice(0, this.curMeasurement).reduce(function(a, b) {
                        return a + b;
                    });
                    var avg = total/this.curMeasurement;
                    var fps = 100/avg;

                    console.log("Average iteration time: " + avg);
                    console.log("#Measurements: " + this.curMeasurement);
                }*/
            }
        };

        /**
         * Stops script execution if currently executing and resets
         * the script.
         *
         * @param {Boolean} reset Whether to also reset the executable
         * @post this.executing == false && this.currentIteration == 1
         */
        Controller.prototype.stop = function(reset) {
            if (typeof reset === 'undefined') {
                reset = true;
            }

            if (this.executing || this.paused) {
                clearInterval(this.runloop);

                // Update state
                this.executing = false;
                this.paused = false;
                this.view.setExecuting(this.executing);
                this.status = "Stopped";
                this.view.setStatus(this.status);

                // Reset the execution state
                if (reset === true) {
                    this.reset();
                }
            }
        };

        /**
         * Resets the state of the appliation, restarting execution
         * from the beginning.
         */
        Controller.prototype.reset = function(first_argument) {
            this.currentIteration = 1;

            // If compiled, reset the Executable object
            if (this.script.isCompiled()) {
                this.script.exe.reset();
                this.view.onNextStep();
            }
        };

        Controller.prototype.debugmessage = function(message) {
            $(document).trigger("DEBUGMESSAGE", [message]);
        };

        /**
         * Destroys the current script with all it's definitions, and
         * loads a new, empty one.
         */
        Controller.prototype.newScript = function(clearStore) {
            if (typeof clearStore === 'undefined') {
                clearStore = true;
            }

            // Stop execution, create new script and let the view update the
            // quantities and results lists
            this.stop(false);
            this.script = new Script();
            this.view.onNewScript(true);

            if (clearStore && this.autoSave && window.localStorage) {
                this.autoSaveStore.clear();
            }
        };

        /**
         * Restores any script that was previously autosaved in the autoSaveStore.
         *
         * @post Any script that might have been stored in the autoSaveStore has
         * been restored and loaded as the current Script.
         */
        Controller.prototype.restoreSavedScript = function() {
            // Retrieve the definitions of all the stored quantities and add them to the script
            // Give precedence to individually stored quantities over entire script sources
            if (this.autoSaveStore.hasScript()) {
                // Retrieve script source
                var src = this.autoSaveStore.loadScript();

                // Restore the script from the retrieved source
                this.setScriptFromSource(src, true);

                var msg = new DebugMessage("Restored script from previous session", "INFO");
                $(document).trigger("DEBUGLOG_POST_MESSAGE", [msg]);

                return true;
            } else {
                return false;
            }
        };

        /**
         * Returns whether the script is currently executing.
         *
         * @return this.executing
         */
        Controller.prototype.isRunning = function() {
            return this.executing;
        };

        /**
         * Sets the number of executions of the script.
         *
         * @param iteration {Number} number of iterations
         * @pre iterations != null
         * @pre iterations != undefined
         * @pre iterations >= 0
         * @post controller.iterations == iteration
         */
        Controller.prototype.setIterations = function(iterations) {
            if (!iterations) {
                throw new Error('Controller.prototype.setIteration.pre :' +
                    'iterations is null or undefined');
            }
            if (iterations < 0) {
                throw new Error('Controller.prototype.setIteration.pre :' +
                    'iterations is not greater than or equal to 0');
            }

            this.stop();
            this.numIterations = parseInt(iterations);
            this.geneticOptimisation.numIterations = iterations;
            if (this.autoExecute) {
                this.run();
            }
        };

        /**
         * Retrieves list of quantities.
         *
         * @return {Object} List of quantities
         */
        Controller.prototype.getQuantities = function() {
            return this.script.quantities;
        };

        /**
         * Returns the quantity with name qtyName from the script.
         *
         * @param qtyName {String} The name of the quantity to return
         * @pre qtyName != null
         * @pre qtyName != undefined
         * @pre this.script.hasQuantity(qtyName)
         *
         * @return {Quantity} The Quantity with name qtyName
         */
        Controller.prototype.getQuantity = function(qtyName) {
            if (!qtyName) {
                throw new Error('Controller.prototype.getQuantity.pre :' +
                    'quantity is null or undefined');
            }
            if (!this.script.hasQuantity(qtyName)) {
                throw new Error('Controller.prototype.getQuantity.pre :' +
                    'quantity does not exist');
            }

            //TODO Precondition quantity \in Script
            return this.script.getQuantity(qtyName);
        };

        /**
         * Adds a quantity to the model.
         *
         * @param definition {String} A single line of ACCEL script which contains the
         * definition of the quantity to be added
         * @pre definition != null
         * @pre definition != undefined
         * @post Quantity has now been added to the model.
         * @modifies this.script.quantities
         */
        Controller.prototype.addQuantity = function(definition, autoSave) {
            if (!definition) {
                throw new Error('Controller.prototype.addQuantity.pre violated :' +
                    'definition is null or undefined');
            }

            if (typeof(autoSave) === 'undefined') {
                autoSave = true;
            }

            // Stop script, add quantity to script and update quantities in view
            this.stop();
            var qty = this.script.addQuantity(definition);
            this.view.onModifiedQuantity();

            // Autosave quantity if enabled
            if (autoSave && this.autoSave && window.localStorage) {
                this.saveScriptToBackupStore(this.script.getSource());
            }

            // Compile script (if script is complete) and optionally autostart
            this.compileScript(this.script);
            if (this.autoExecute) {
                this.run();
            }
        };

        /**
         * Deletes a quantity from the model.
         *
         * @param qtyName {String} The name of the quantity to delete
         * @pre qtyName != null
         * @pre qtyName != undefined
         * @pre qtyName \in Script
         * @post quantity removed from Script
         */
        Controller.prototype.deleteQuantity = function(qtyName) {
            if (!qtyName) {
                throw new Error('Controller.prototype.addQuantityuantity.pre violated :' +
                    'qtyName is null or undefined');
            }
            if (!this.script.hasQuantity(qtyName)) {
                throw new Error('Controller.prototype.getQuantity.pre :' +
                    'quantity does not exist');
            }

            // Stop script, delete quantity from script and update quantities in view
            this.stop();
            this.script.deleteQuantity(qtyName);
            this.view.onModifiedQuantity();

            // Remove quantity from autosave store
            if (this.autoSave && window.localStorage) {
                this.saveScriptToBackupStore(this.script.getSource());
            }

            // Compile script (if script is complete) and optionally autostart
            this.compileScript(this.script);
            if (this.autoExecute) {
                this.run();
            }
        };

        /**
         * Compiles the given script if the todo-list is empty.
         *
         * @pre    script != null && script !=
         * @param  script {Script} The script to compile
         * @return Whether the script has been compiled
         */
        Controller.prototype.compileScript = function(script) {
            if (!script) {
                throw new Error('Controller.prototype.compileScript.pre :' +
                    'script is null or undefined');
            }

            // Reset measurements
            if (inBrowser) {
                this.curMeasurement = 0;
                this.measurements = new Array(this.numMeasurements);
            }

            if (script.isComplete()) {
                // Compile script and signal script and view that it has been compiled.
                try {
                    script.setExecutable(this.compiler.compile(script));

                    //if (script.hasHistory() === false) {
                        //script.determineReachability();
                    //}
                } catch (e) {
                    this.view.runtimeError(e);
                }

                this.view.onNewScript();

                return true;
            } else {
                return false;
            }
        };

        /**
         * Returns the most recent computed value of the given quantity.
         *
         * @param qtyName {String} The name of the quantity of which to return the value
         * @pre qtyName != null
         * @pre qtyName != undefined
         * @pre this.script.hasQuantity(qtyName)
         * @return {Number} The value of Quantity qtyname
         */
        Controller.prototype.getQuantityValue = function(qtyName) {
            if (!qtyName) {
                throw new Error('Controller.prototype.getQuantity.pre :' +
                    'quantity is null or undefined');
            }
            if (!this.script.hasQuantity(qtyName)) {
                throw new Error('Controller.prototype.getQuantity.pre :' +
                    'quantity does not exist');
            }

            return this.script.getQuantityValue(qtyName);
        };

        /**
         * Sets the value of the given category 1 (user input) quantity.
         *
         * @param qtyname {String} The name of the quantity of which to set the value
         * @param value {Number} value
         * @pre value != null
         * @pre value != undefined
         * @pre qtyname != null
         * @pre qtyname != undefined
         * @pre this.script.hasQuantity(qtyname)
         * @post this.script.quantities[qtyname].value = value
         */
        Controller.prototype.setUserInputQuantity = function(qtyName, value) {
            if (value === null || value === undefined) {
                throw new Error('Controller.prototype.setValue.pre :' +
                    'value is null or undefined');
            }
            if (!qtyName) {
                throw new Error('Controller.prototype.setValue.pre :' +
                    'quantity is null or undefined');
            }
            if (this.script.getQuantity(qtyName).category != 1) {
                throw new Error('Controller.prototype.getQuantity.pre :' +
                    'not a category 1 (user-input) quantity');
            }

            // Update value in exe
            this.script.setConstant(qtyName, value);

            // Emit event
            jQuery.event.trigger("userInputChanged", [qtyName, value]);
        };


        /**
         * Gets Email address from the model.
         *
         * @pre model.EmailAddress != null
         * @return {String} Email address
         */
        Controller.prototype.getEmailAddress = function() {
            //TODO Precondition model.EmailAddress != null
            //TODO Implementation
            //TODO Tests
        };

        /**
         * Returns all available help categories and their subcategories.
         *
         * @return {Array} List of all help (sub)categories
         */
        Controller.prototype.getHelpCategories = function() {
            return this.library.getHelpCategories();
        };

        /**
         * Returns all available help articles.
         *
         * @param {String} condition (Optional) The condition for which articles to display
         * @return {Array} List of all help articles
         */
        Controller.prototype.getHelpArticles = function(condition) {
            return this.library.getHelpArticles(condition);
        };

        /**
         * Returns the requested help article
         *
         * @param {Number} articleID The ID of the article to return
         * @return {Object} The requested article
         */
        Controller.prototype.getHelpArticle = function(articleID) {
            return this.library.getHelpArticle(articleID);
        };

        /**
         * Gets demo scripts from the model.
         *
         * @pre model.DemoScripts != null
         * @return {Object} List Demo Scriptnames
         */
        Controller.prototype.getDemoScripts = function() {
            return this.library.getDemoScripts();
        };

        /**
         * Gets demo script tags from the model.
         *
         * @pre model.DemoScripts != null
         * @return {Object} List Demo Scriptnames
         */
        Controller.prototype.getScriptTags = function() {
            return this.library.getScriptTags();
        };

        /**
         * Gets demo script with given name from the model.
         *
         * @pre model.DemoScripts != null
         * @return {Object} Demo script
         */
        Controller.prototype.getDemoScript = function(name) {
            return this.library.getDemoScript(name);
        };

        /**
         * Returns all demoscripts related to the given search phrase.
         *
         * @pre model.DemoScripts != null
         * @return {Object} Demo scripts matching the given phrase
         */
        Controller.prototype.searchDemoScripts = function(phrase) {
            return this.library.getDemoScripts('search=' + phrase);
        };

        /**
         * Returns all demoscripts with the given tag.
         *
         * @pre model.DemoScripts != null
         * @return {Object} Demo scripts matching the given phrase
         */
        Controller.prototype.scriptsWithTag = function(tag) {
            return this.library.getDemoScripts('tag=' + tag);
        };

        /**
         * Loads demo script from the model.
         *
         * @param name {String} name of demo script
         * @pre name != null
         * @pre name != undefined
         * @pre name \in model.demoScripts
         * @return {Object} Script
         */
        Controller.prototype.loadDemoScript = function(name) {
            var source = this.library.getDemoScript(name).source;
            this.setScriptFromSource(source);

            var msg = new DebugMessage("Loaded demoscript " + name, "INFO");
            $(document).trigger("DEBUGLOG_POST_MESSAGE", [msg]);

            if (this.autoExecute) {
                this.run();
            }
        };

        /**
         * Loads user script from the server.
         *
         * @param name {String} name of user script
         * @pre name != null
         * @pre name != undefined
         * @return {Object} Script
         */
        Controller.prototype.loadUserScript = function(name) {
            $.ajax({
                type: "GET",
                url: "http://www.openaccel.nl/php/keyMapDBI.php?task=getTerm&key=" + name,
                context: this,
                success: function(result, status) {
                    this.setScriptFromSource(result);
                    if (this.autoExecute) {
                        this.run();
                    }
                },
                error: function(err) {
                    console.log(err);
                    controller.ajaxError(this.errorMessage + err.responseText);
                    this.errorMessage = "";
                    return false;
                },
                fail: function(err) {
                    console.log(err);
                    controller.ajaxError(this.errorMessage + err.responseText);
                    this.errorMessage = "";
                    return false;
                },
                async: true
            });
        };

        /**
         * Saves script on server and, returns a link to the script.
         *
         * @param name {String} name of script
         * @pre name != null
         * @pre name != undefined
         * @pre name \not \in model.savedScripts
         * @return {String} url to script
         */
        Controller.prototype.saveScript = function(name) {
            if (!name) {
                throw new Error('Controller.prototype.saveScript.pre :' +
                    'name is null or undefined');
            }
            //TODO Precondition name \in model.DemoScripts
            //TODO Implementation
            //TODO Tests
        };

        /**
         * Returns the Script object currently managed by this controller.
         *
         * @return {Script} this.script
         */
        Controller.prototype.getScript = function() {
            return this.script;
        };

        /**
         * Returns the original source code of the current script, exactly as it
         * was entered by the user. For more functionality, see scriptToString().
         *
         * @return {String} this.getScript().getSource()
         */
        Controller.prototype.getScriptSource = function() {
            return this.script.getSource();
        };

        /**
         * Handles an ajax request error that occured
         *
         * @param {String} err The description of the error that occured
         */
        Controller.prototype.ajaxError = function(message) {
            alert(message);
        };

        /**
         * Returns the source code of the current script, optionally including
         * quantity units and comments.
         *
         * @param {Object} options An object containing zero or more of the following attributes:
         * -(Boolean) includeUnits Whether to include the quantity units in the output.
         * -(Boolean) includeComments Whether to include the comments belonging to the quantities in the output
         * -(Boolean) includeCheckedUnits Whether to include the units that may have been checked, or only
         *            those provided by the user.
         * -(Boolean) includeValues Whether to include the current values of the quantities in the output
         *
         * @return {String} The source code of the current script, with or without (checked) units,
         * comments and values as specified.
         */
        Controller.prototype.scriptToString = function(options) {
            // Assume default value of includeValues option because we need to deal with it here
            // Leave the rest for Script.toString() to handle
            if (typeof options.includeValues === 'undefined') {
                options.includeValues = false;
            }

            // Check whether the script is complete and compile it if the values
            // have to be included
            if (options.includeValues) {
                if (!this.script.isCompiled()) {
                    if (!this.compileScript(this.script)) {
                        throw new Error("Unable to show values: script not complete.");
                    }
                } else {
                    // Reset to the first iteration, in order to get a single value?
                    //this.reset();
                }
            }

            return this.script.toString(options);
        };

        /**
         * Builds the model defined in the given source code and sets it
         * as the current script.
         *
         * @param source {String} List of quantity definitions and optionally
         * comments
         * @param restoring {Boolean} (Optional) Whether we are restoring a script
         * from the autoSaveStore. Set to true to
         * @modifies this.script
         * @post A new script has been created, containing all quantities
         * defined in source.
         * @return {Quantities[]} An array of quantities that have been added to the model.
         * @throws {SyntaxError} If the script is not syntactically correct
         */
        Controller.prototype.setScriptFromSource = function(source, restoring) {
            if (typeof(restoring) === 'undefined') {
                restoring = false;
            }

            // First make sure the script is correct before emptying the current script
            this.checkSyntax(source);

            // Stop the current model and create a new script with the
            // given source
            this.newScript(!restoring);
            var added = this.script.addSource(source);
            //this.view.onModifiedQuantity();

            // Test whether we're in the process of restoring a script from the backup
            // store. If we are, don't save it back to the store again!
            if (!restoring) {
                // If autosave is enabled, save script to backup store
                if (this.autoSave) {
                    this.saveScriptToBackupStore(this.script.toString({'includeComments': true}));
                }
            }

            this.compileScript(this.script);

            return added;
        };

        /**
         * Returns whether the syntax of the script is correct and throws
         * a SyntaxError if not.
         * @param  {String} source  The ACCEL script of which to check the syntax
         * @return {Boolean}        Whether the given script is syntactically correct
         * @throws {SyntaxError}    If source is not syntactically correct
         */
        Controller.prototype.checkSyntax = function(source) {
            return this.script.checkSyntax(source);
        };

        /**
         * Saves the given script source to the backup store.
         *
         * @param source {String} The script source to save to the backup store.
         */
        Controller.prototype.saveScriptToBackupStore = function(source) {
            this.autoSaveStore.saveScript(source);
        };

        /**
         * Returns the Genetic Optimisation object currently managed by this controller.
         *
         * @return {GeneticOptimisation} this.geneticOptimisation
         */
        Controller.prototype.getGeneticOptimisation = function() {
            return this.geneticOptimisation;
        };

        /**
         * Returns whether the script has quantities that have to be
         * optimized using SPEA.
         *
         * @return {Boolean} Whether the script contains pareto quantities
         */
        Controller.prototype.hasOptimisation = function() {
            return this.script.hasOptimisation();
        };

        /**
         * Initialises the Genetic Optimisation algorithm.
         *
         * @param {Number} populationSize the desired population size
         * @pre populationSize != null
         * @pre populationSize != undefined
         * @pre populationSize > 0
         */
        Controller.prototype.initialiseGeneticOptimisation = function(populationSize) {
            if (!populationSize) {
                throw new Error('Controller.prototype.initialiseGeneticOptimisation.pre :' +
                    'population size is null or undefined');
            }
            if (populationSize <= 0) {
                throw new Error('Controller.prototype.initialiseGeneticOptimisation.pre :' +
                    'population size is less than or equal to zero');
            }
            // compile the script if necessary
            if (!this.getScript().isCompiled()) {
                this.compileScript(this.getScript());
            }
            // initialise the genetic optimisation algorithm
            this.geneticOptimisation.initialise(this.getScript(), populationSize);
            this.view.onNewGeneration();
        };

        /**
         * Generates a number of iterations of the Genetic Optimisation algorithm.
         *
         * @param iterations {Number} number of iterations
         * @pre model.Script contains pareto definitions
         * @pre iterations != null
         * @pre iterations != undefined
         * @pre iterations > 0
         */
        Controller.prototype.nextGeneration = function(iterations) {
            if (!iterations) {
                throw new Error('Controller.prototype.nextGeneration.pre :' +
                    'iterations is null or undefined');
            }
            if (iterations <= 0) {
                throw new Error('Controller.prototype.nextGeneration.pre :' +
                    'number of iterations is less than or equal to zero');
            }
            this.geneticOptimisation.nextGeneration();
            this.view.onNewGeneration();
            // set a timeout of 1ms to allow the plot to update between generations
            setTimeout((function() {
                iterations--;
                if (iterations > 0) {
                    this.nextGeneration(iterations);
                }
            }).bind(this), 10);

        };

        /**
         * Set the probability for the cross-over.
         *
         * @param {Number} crossoverProbability the probability for a cross-over
         */
        Controller.prototype.setCrossover = function(crossoverProbability) {
            this.geneticOptimisation.crossoverProbability = crossoverProbability / 100;
        };

        /**
         * Set the probability for the mutations.
         *
         * @param {Array} mutation the array containing the mutation probability
         */
        Controller.prototype.setMutation = function(mutation) {
            this.geneticOptimisation.closeMutationProbability = mutation[0] / 100;
            this.geneticOptimisation.arbitraryMutationProbability = mutation[1] / 100;
        };

        /**
         * Set the desired Pareto Front ratio.
         *
         * @param {Number} desiredParetoFrontRatio the desired pareto front ratio
         */
        Controller.prototype.setMaxfront = function(desiredParetoFrontRatio) {
            this.geneticOptimisation.desiredParetoFrontRatio = desiredParetoFrontRatio / 100;
        };

        /**
         * Gets list of quantities and their position in the network
         *
         * @return {Object} List Quantities and their position
         */
        Controller.prototype.getNetwork = function() {
            //TODO Implementation
            //TODO Tests
        };

        /**
         * Sets the position of a quantity in the network.
         *
         * @param quantity {Object} Quantity
         * @param x {Number} Horizontal coordinate of the quantity
         * @param y {Number }Vertical coordinate of the quantity
         * @pre name, x, y != null
         * @pre name, x,y != undefined
         * @post model.quantity.x = x
         * @post model.quantity.y = y
         */
        Controller.prototype.setPosition = function(quantity, x, y) {
            if (!quantity) {
                throw new Error('Controller.prototype.generate.pre :' +
                    'quantity is null or undefined');
            }
            if (!x) {
                throw new Error('Controller.prototype.generate.pre :' +
                    'x is null or undefined');
            }
            if (!y) {
                throw new Error('Controller.prototype.generate.pre :' +
                    'y is null or undefined');
            }
            //TODO Implementation
            //TODO Tests
        };


        // Exports are needed, such that other modules may invoke methods from this module file.
        return Controller;
    });
