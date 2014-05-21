/**
 * File containing the Controller Class
 *
 * @author Loct
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    sweetModule = 'sweet.js';
} else {
    sweetModule = 'sweet';

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
define(["model/script", "model/compiler"], /**@lends Controller*/ function(Script, Compiler) {

    /**
     * @class
     * @classdesc Base controller class.
     */
    function Controller() {
        this.script = new Script();
        this.numIterations = 0;
        this.executing = false;
        this.compiler = new Compiler();
    }
    
    /**
     * Main execution loop of the script.
     */
    Controller.prototype.execute = function() {
    	this.executing = true;

    	// TODO initiate runloop of script
    } 

    /**
     * Stops script execution
     * 
     * @post controller.executing == false
     */
    Controller.prototype.stop = function() {
        this.executing = false;  
    } 

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
        if(!iterations) {
            throw new Error('Controller.prototype.setIteration.pre :' +
                'iterations is null or undefined')
        }
        if(!(iterations >= 0)) {
            throw new Error('Controller.prototype.setIteration.pre :' +
                'iterations is not greater or equal to 0')
        }
        this.numIterations = iterations;
        //TODO Tests
    } 

    /**
     * Retrieves list of quantities.
     * 
     * @return {Object} List of quantities
     */
    Controller.prototype.getQuantities = function() {
        return this.script.quantities;
    }

    /**
     * Retrieves, if possible, a quantity from the model.
     * NOTE: For sake of the demo, this function is a duplicate of getValue.
     * @param quantity {String} quantity name
     * @pre quantity != null
     * @pre quantity != undefined
     * @pre quantity \in Script
     * @return {Object} the Quantity
     */
    Controller.prototype.getQuantity = function(quantity) {
        if(!quantity) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity is null or undefined')
        }
        if (!this.script.hasQuantity(quantity)) {
        	throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
        }
        //TODO Precondition quantity \in Script 
        //TODO Implementation
        //TODO Tests
        return this.script.getQuantity(quantity);
    } 

    /**
     * Adds a quantity to a model.
     *
     * @param definition {String} Contains a quantity on the LHS and a defition on the RHS
     * @pre definition != null
     * @pre definition != undefined
     * @pre model.ScriptAnalyzer() == true
     * @post definition \in Script
     * @return {Object} list of quantities
     */
    Controller.prototype.addQuantity = function(definition) {
        //TODO Precondition, syntax checking
        if(!definition) {
            throw new Error('Controller.prototype.addQuantity.pre violated :' +
                'definition is null or undefined')
        }
        
        // Stop script execution, add quantity, recompile, and 
        // start again if todo list is empty
        this.stop();
        report = this.script.addQuantity(definition);
        this.compileScript(this.script);
        this.execute();
    } 

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
        if(!qtyName) {
            throw new Error('Controller.prototype.addQuantityuantity.pre violated :' +
                'qtyName is null or undefined')
        }
        if (!this.script.hasQuantity(qtyName)) {
        	throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
        }

        this.script.deleteQuantity(qtyName);
        this.compileScript(this.script);
    }
    /**
     * Compiles the given script.
     * @param  {Script} script script to compile
     */
    Controller.prototype.compileScript = function(script) {
        script.exe = this.compiler.compile(script).exe;
    }     

    /**
     * Retrieves, if possible, a value of a quantity.
     * NOTE: For sake of the demo, this function is a duplicate of getQuantity.
     * @param quantity = {String} quantity 
     * @pre quantity != null
     * @pre quantity != undefined
     * @pre quantity \in Script
     * @return {Number} value of quantity
     */
    Controller.prototype.getValue = function(quantity) {
        if(!quantity) {
            throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity is null or undefined')
        }
        if (!this.script.hasQuantity(quantity)) {
        	throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
        }

        return this.script.getQuantity(quantity).value;
    }

    /**
     * Sets the value of a quantity.
     *
     * @param quantity = {Object} quantity
     * @param value = {Number} value
     * @pre value != null
     * @pre value != undefined
     * @pre quantity != null
     * @pre quantity != undefined
     * @pre quantity \in Script
     * @post model.Quantity.value = value
     */
    Controller.prototype.setValue = function(quantity, value) {
        if(!value) {
            throw new Error('Controller.prototype.setValue.pre :' +
                'value is null or undefined')
        }
        if(!quantity) {
            throw new Error('Controller.prototype.setValue.pre :' +
                'quantity is null or undefined')
        }
        if (!this.script.hasQuantity(quantity)) {
        	throw new Error('Controller.prototype.getQuantity.pre :' +
                'quantity does not exist')
        }

        this.script.setValue(quantity, value);
    } 

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
    } 

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
    } 

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
    }

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
        if(!name) {
            throw new Error('Controller.prototype.loadDemoScript.pre :' +
                'name is null or undefined')
        }
        //TODO Precondition name \in model.DemoScripts
        //TODO Implementation
        //TODO Tests
    } 

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
        if(!name) {
            throw new Error('Controller.prototype.saveScript.pre :' +
                'name is null or undefined')
        }
        //TODO Precondition name \in model.DemoScripts
        //TODO Implementation
        //TODO Tests
    } 

    /**
     * Retrieves the currently loaded script from the model.
     *
     * @return {Object} script
     */
    Controller.prototype.getScript = function() {
        return this.script;
    } 

    /**
     * Sets the script to the model.

     * @param script = {String} list of quantity definitions
     * @post model.Script == script
     */
    Controller.prototype.setScript = function() {
        //TODO Implementation
        //TODO Tests
    }

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
        if(!quantity1) {
            throw new Error('Controller.prototype.plot.pre :' +
                'quantity1 is null or undefined')
        }
        if(!quantity2) {
            throw new Error('Controller.prototype.plot.pre :' +
                'quantity2 is null or undefined')
        }
        //TODO 
        //TODO Implementation
        //TODO Tests
    }

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
        if(!iterations) {
            throw new Error('Controller.prototype.generate.pre :' +
                'iterations is null or undefined')
        }
        //TODO 
        //TODO Implementation
        //TODO Tests
    }    

    /**
     * Gets list of quantities and their position in the network
     * 
     * @return {Object} List Quantities and their position
     */
    Controller.prototype.getNetwork = function() {
        //TODO Implementation
        //TODO Tests
    }

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
    Controller.prototype.setPosition = function(quantity,x,y) {
        if(!quantity) {
            throw new Error('Controller.prototype.generate.pre :' +
                'quantity is null or undefined')
        }
        if(!x) {
            throw new Error('Controller.prototype.generate.pre :' +
                'x is null or undefined')
        }
        if(!y) {
            throw new Error('Controller.prototype.generate.pre :' +
                'y is null or undefined')
        }
        //TODO Implementation
        //TODO Tests
    }   
 
    
    // Exports are needed, such that other modules may invoke methods from this module file.
    return Controller;
});
