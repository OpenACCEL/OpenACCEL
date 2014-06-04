/*
 * File containing the Controller Class
 *
 * @author Loct
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        shim: {
            'underscore': {
                exports: '_'
            }
        },
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

// If all requirements are loaded, we may create our 'class'.
define(["model/script", "model/compiler", "controller/AbstractView"], /**@lends Controller*/ function(Script, Compiler, AbstractView) {
    /**
     * @class Controller
     * @classdesc Base controller class.
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
        if (typeof view !== 'undefined') {
            this.view = view;
        } else {
            console.log("Warning: Controller.Constructor: view not provided, using dummy view.");
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
         * Unique id for the runloop interval.
         *
         * @type {Integer}
         */
        this.runloop = null;

        /**
         * Whether the controller should automatically execute the script
         * after adding or removing quantities. Currently set to false
         * by default, for testing purposes.
         *
         * @type {Boolean}
         */
        this.autoExecute = false; // TODO default=true

        /**
         * The currently active tab in the UI.
         *
         * @type {Number}
         */
        this.currentTab = 1;

        /**
         * Array containing the names of all the quantities that have 
         * been flagged as changed in the executable. Used for memoization 
         * purposes when setting user input quantity values (setUserInputQuantity()).
         */
        this.flaggedAsChanged = [];
    }

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
     * Starts or resumes execution of the script.
     *
     * @post The script is being executed in a loop if the
     * script is complete and non-empty. 
     * The script has been resumed if it was paused and 
     * otherwise has been started over.
     */
    Controller.prototype.run = function() {
        if (!this.executing && this.script.isComplete()) {
            this.executing = true;
            this.view.setExecuting(this.executing);
            var controller = this;
            this.runloop = setInterval(
                function() {
                    controller.execute();
                }, 1
            );
        }
    };

    /**
     * Evaluates the values of all category 2 quantities and provides
     * them to the view.
     *
     * @pre this.script.isComplete()
     * @post The view has received the current values of all output quantities.
     */
    Controller.prototype.execute = function() {
        // Extra check to make sure that the model is complete
        if (!this.script.isComplete()) {
            this.stop(false);
            return;
        }

        // Present the results to the view
        this.presentResults(this.script.getOutputQuantities());

        // If the number of iterations to be executed is >0, stop
        // when the last iteration has just completed
        if (this.numIterations > 0) {
            if (this.currentIteration != this.numIterations) {
                this.currentIteration++;
            } else {
                this.stop();
            }
        }

        // Signal the executable that one iteration has been completed,
        // for quantity history functionality
        this.script.exe.step();
    };

    /**
     * Pauses the script but does not clear history or resets
     * the current iteration.
     *
     * @post this.executing == false
     */
    Controller.prototype.pause = function() {
        if (this.executing) {
            clearInterval(this.runloop);
            this.executing = false;
            this.view.setExecuting(this.executing);
        }
    };

    /**
     * Stops script execution if currently executing,
     * clears any quantity histories and resets the current
     * iteration to 1.
     *
     * @param recompile {Boolean} (Optional) Whether to recompile the script
     * after stopping execution. Defaults to true
     * @post this.executing == false && this.currentIteration == 1
     */
    Controller.prototype.stop = function(recompile) {
        if (typeof recompile === 'undefined') {
            recompile = true;
        }

        if (this.executing) {
            clearInterval(this.runloop);
            this.executing = false;
            this.view.setExecuting(this.executing);
            this.currentIteration = 1;

            // Quick hack: recompile script to 'reset' everything
            // TODO think of better implementation?
            if (recompile) {
                this.compileScript(this.script);
            }
        }
    };

    /**
     * Destroys the current script with all it's definitions, and
     * loads a new, empty one.
     */
    Controller.prototype.newScript = function() {
        // Stop execution, create new script and let the view update the
        // quantity list
        this.stop(false);
        this.script = new Script();
        this.view.setQuantities({});
    };

    /**
     * Signals the controller to switch state to the given tab.
     *
     * @param tab {Number} The tab to switch to.
     * @post this.currentTab = tab
     */
    Controller.prototype.switchTab = function(tab) {
        this.currentTab = tab;
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
     * Presents the results stored in the given output quantities
     * to the view associated with this controller.
     *
     * @param cat2quantities {map<String, Quantity>} Map containing the output
     * quantities to present to the view, keyed by quantity name.
     * @post The given quantities and their values have been pushed to the
     * view.
     */
    Controller.prototype.presentResults = function(cat2quantities) {
        this.view.presentResults(cat2quantities);
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
                'iterations is null or undefined')
        }
        if (!(iterations >= 0)) {
            throw new Error('Controller.prototype.setIteration.pre :' +
                'iterations is not greater than or equal to 0')
        }

        this.numIterations = iterations;
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
                'quantity is null or undefined')
        }
        if (!this.script.hasQuantity(qtyName)) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
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
     * @post
     * @modifies this.script.quantities
     */
    Controller.prototype.addQuantity = function(definition) {
        //TODO Precondition, syntax checking
        if (!definition) {
            throw new Error('Controller.prototype.addQuantity.pre violated :' +
                'definition is null or undefined')
        }

        // Stop script execution, add quantity, recompile, and 
        // start again if todo list is empty
        this.stop(false);
        this.script.addQuantity(definition);
        this.compileScript(this.script);
        this.view.setQuantities(this.script.getQuantities());
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
                'qtyName is null or undefined')
        }
        if (!this.script.hasQuantity(qtyName)) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
        }

        // Stop script execution, delete quantity, recompile, and 
        // start again if todo list is empty
        this.stop(false);
        this.script.deleteQuantity(qtyName);
        this.compileScript(this.script);
        this.view.setQuantities(this.script.getQuantities());
        if (this.autoExecute) {
            this.run();
        }
    };

    /**
     * Compiles the given script if the todo-list is empty.
     *
     * @param  {Script} script The script to compile
     * @return Whether the script has been compiled
     */
    Controller.prototype.compileScript = function(script) {
        if (script.isComplete()) {
        	// Clear old results when recompiling
        	this.view.presentResults({});		
            script.exe = this.compiler.compile(script).exe;
            return true;
        } else {
            return false;
        }
    };

    /**
     * Returns the most recent computed value of the given quantity.
     *
     * @param qtyName = {String} The name of the quantity of which to return the value
     * @pre qtyName != null
     * @pre qtyName != undefined
     * @pre this.script.hasQuantity(qtyName)
     * @return {Number} The value of Quantity qtyname
     */
    Controller.prototype.getQuantityValue = function(qtyName) {
        if (!qtyName) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity is null or undefined')
        }
        if (!this.script.hasQuantity(qtyName)) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
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
        if (value == null || value == undefined) {
            throw new Error('Controller.prototype.setValue.pre :' +
                'value is null or undefined')
        }
        if (!qtyName) {
            throw new Error('Controller.prototype.setValue.pre :' +
                'quantity is null or undefined')
        }
        if (this.script.getQuantity(qtyName).category != 1) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'not a category 1 (user-input) quantity')
        }

        // Update value in exe
        this.script.exe[qtyName][0] = value;

        // Recursively flag the updated user input quantity and all it's reverse
        // dependencies as changed. First reset memoization datastructure!
        this.flaggedAsChanged = [];
        this.setQuantityChanged(this.script.getQuantity(qtyName), true);
    };

    /**
     * Recursively sets whether the given quantity and all of it's reverse 
     * dependencies have been modified.
     *
     * @param {Quantity} quantity The quantity to use as starting point. All of it's reverse dependencies, if any, are set recursively.
     * @param {Boolean} changed Whether to mark quantity and it's reverse dependencies as changed or not.
     */
    Controller.prototype.setQuantityChanged = function(quantity, changed) {
        // Base case: quantity already checked
        if (this.flaggedAsChanged.indexOf(quantity.name) >= 0) {
            return;
        }

        this.script.exe[quantity.name].__hasChanged__ = true;
        this.flaggedAsChanged.push(quantity.name);
        for (var dep in quantity.reverseDeps) {
            this.setQuantityChanged(this.script.quantities[quantity.reverseDeps[dep]], true);
        }
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
     * Gets help files from the model.
     *
     * @pre model.HelpFiles != null
     * @return {Object} List Help filenames
     */
    Controller.prototype.getHelpFiles = function() {
        //TODO Precondition model.HelpFiles != null
        //TODO Implementation
        //TODO Tests
    };

    /**
     * Gets demo scripts from the model.
     *
     * @pre model.DemoScripts != null
     * @return {Object} List Demo Scriptnames
     */
    Controller.prototype.getDemoScripts = function() {
        //TODO Precondition model.DemoScripts != null
        //TODO Implementation
        //TODO Tests
    };

    /**
     * Loads demo script from the model.
     *
     * @param name = {String} name of demo script
     * @pre name != null
     * @pre name != undefined
     * @pre name \in model.demoScripts
     * @return {Object} Script
     */
    Controller.prototype.loadDemoScript = function(name) {
        if (!name) {
            throw new Error('Controller.prototype.loadDemoScript.pre :' +
                'name is null or undefined')
        }
        //TODO Precondition name \in model.DemoScripts
        //TODO Implementation
        //TODO Tests
    };

    /**
     * Saves script on server and, returns a link to the script.
     *
     * @param name = {String} name of script
     * @pre name != null
     * @pre name != undefined
     * @pre name \not \in model.savedScripts
     * @return {String} url to script
     */
    Controller.prototype.saveScript = function(name) {
        if (!name) {
            throw new Error('Controller.prototype.saveScript.pre :' +
                'name is null or undefined')
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
     * Returns the source code of the current script, optionally including
     * quantity units and comments.
     *
     * @param {Boolean} includeUnits Whether to include the quantity units
     * in the output.
     * @param {Boolean} includeComments (optional) Whether to include the
     * comments belonging to the quantities in the output
     * @return {String} The source code of the current script, with or without
     * units and comments as specified.
     */
    Controller.prototype.scriptToString = function(includeUnits, includeComments) {
        return this.script.toString(includeUnits, includeComments);
    };

    /**
     * Builds the model defined in the given source code and sets it
     * as the current script.
     *
     * @param {String} source List of quantity definitions and optionally
     * comments
     * @modifies this.script
     * @post A new script has been created, containing all quantities
     * defined in source.
     */
    Controller.prototype.setScriptFromSource = function(source) {
    	// Stop the current model and create a new script with the
    	// given source
        this.stop(false);
        this.script = new Script(source);
    };

    /**
     * Plots the relation between two Quantities.
     *
     * @param quantity1 {Object} quantity
     * @param quantity2 {Object} quantity
     * @pre quantity1, quantity2 = category 3, category 4 quantity
     * @pre quantity1 != null
     * @pre quantity1 != undefined
     * @pre quantity2 != null
     * @pre quantity2 != undefined
     * @return {Object} plot information for descartes
     */
    Controller.prototype.plot = function(quantity1, quantity2) {
        if (!quantity1) {
            throw new Error('Controller.prototype.plot.pre :' +
                'quantity1 is null or undefined')
        }
        if (!quantity2) {
            throw new Error('Controller.prototype.plot.pre :' +
                'quantity2 is null or undefined')
        }
        //TODO 
        //TODO Implementation
        //TODO Tests
    };

    /**
     * Generates a number of iterations of SPEA.
     *
     * @param iterations {Number} number of iterations
     * @pre model.Script contains pareto definitions
     * @pre iterations != null
     * @pre iterations != undefined
     * @return {Object} List Quantities
     */
    Controller.prototype.generate = function(iterations) {
        if (!iterations) {
            throw new Error('Controller.prototype.generate.pre :' +
                'iterations is null or undefined')
        }
        //TODO 
        //TODO Implementation
        //TODO Tests
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
     * @param x = {Number} Horizontal coordinate of the quantity
     * @param y = {Number }Vertical coordinate of the quantity
     * @pre name, x, y != null
     * @pre name, x,y != undefined
     * @post model.quantity.x = x
     * @post model.quantity.y = y
     */
    Controller.prototype.setPosition = function(quantity, x, y) {
        if (!quantity) {
            throw new Error('Controller.prototype.generate.pre :' +
                'quantity is null or undefined')
        }
        if (!x) {
            throw new Error('Controller.prototype.generate.pre :' +
                'x is null or undefined')
        }
        if (!y) {
            throw new Error('Controller.prototype.generate.pre :' +
                'y is null or undefined')
        }
        //TODO Implementation
        //TODO Tests
    };


    // Exports are needed, such that other modules may invoke methods from this module file.
    return Controller;
});
