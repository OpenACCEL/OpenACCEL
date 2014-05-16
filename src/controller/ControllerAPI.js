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
define(["model/script"], /**@lends Controller*/ function(Script) {

    /**
     * @class
     * @classdesc Base controller class.
     */
    function Controller() {
        this.script = new Script();
        this.execute = true;
        this.iterations = 0;
    }
    
    /**
     * Main execution loop of the script
     */
    Controller.prototype.execution = function() {
        //TODO Implementation
        //TODO Tests
    } 

    /**
     * Pauses execution of the script
     * @post controller.Execute == false
     */
    Controller.prototype.pause = function() {
        this.execute = false;    
        //TODO Tests
    } 

    /**
     * Sets the number of executions of the script
     *
     * @param iteration {Number} number of iterations
     * @pre iterations != null
     * @pre iterations != undefined
     * @pre iterations >= 0
     * @post controller.Iterations == iteration
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
        this.iterations = iterations;
        //TODO Tests
    } 

    /**
     * Retrieves list of Quantities
     * 
     * @return {Object} List of quantities
     */
    Controller.prototype.getquantities = function() {
        //TODO Implementation
        //TODO Tests
    } 

    /**
     * Adds a Quantity to a model
     *
     * @param definition {String} Contains a quantity on the LHS and a defitions on the RHS
     * @pre definition != null
     * @pre definition != undefined
     * @pre model.ScriptAnalyzer() == true
     * @post definition \in Script
     * @return {Object} list of quantities
     */
    Controller.prototype.addQuantity = function(definition) {
        if(!definition) {
            throw new Error('Controller.prototype.addQuantity.pre violated :' +
                'definition is null or undefined')
        }
        this.script.addQuantity(definition);
        //TODO Precondition, syntax checking
        //TODO Implementation
        //TODO Tests
        return this.getquantities;
    } 

    /**
     * Deletes a quantity from a model
     *
     * @param quantity {String} Quantity name
     * @pre quantity != null
     * @pre quantity != undefined
     * @pre model.ScriptAnalyzer() == true
     * @pre definition \in Script
     * @post definition removed from Script
     * @return {Object} list of quantities
     */
    Controller.prototype.deleteQuantity = function(quantity) {
        if(!quantity) {
            throw new Error('Controller.prototype.addQuantity.pre violated :' +
                'quantity is null or undefined')
        }
        //TODO Precondition, removing quantity
        //TODO Implementation
        //TODO Tests
        this.script.deleteQuantity(quantity);
        return this.getquantities;
    }     

    /**
     * Retrieves, if possible, a quantity from the model
     * NOTE: For sake of the demo, this functions is a duplicate of getValue
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
        //TODO Precondition quantity \in Script 
        //TODO Implementation
        //TODO Tests
        return this.script.getQuantity(quantity);
    } 
    /**
     * Retrieves, if possible, a value of a quantity
     * NOTE: For sake of the demo, this functions is a duplicate of quantity
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
        //TODO Precondition name \in Script 
        //TODO Implementation
        //TODO Tests
        return this.script.getQuantity(quantity);
    } 
    /**
     * Sets the value of a quantity
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
        //TODO Precondition quantiy \in Script
        //TODO Implementation
        //TODO Tests
    } 

    /**
     * gets Email address from the model
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
     * gets help files from the model
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
     * gets demo scripts from the model
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
     * loads demo script from the model
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
     * Saves script on server and, returns a link to the script
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
     * Retrieves the currently loaded script from the model
     *
     * @return {Object} script
     */
    Controller.prototype.getScript = function() {
        //TODO Implementation
        //TODO Tests
    } 

    /**
     * sets the script to the model

     * @param script = {String} list of quantity definitions
     * @post model.Script == script
     */
    Controller.prototype.setScript = function() {
        //TODO Implementation
        //TODO Tests
    }

    /**
     * Plots the relation between two Quantities
     * 
     * @param quantity1 = {Object} quantity
     * @param quantity2 = {Object} quantity
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
     * Generates a number of iterations of SPEA
     * 
     * @param iterations = {Number} number of iterations
     * @pre model.Script contains pareto definitions
     * @pre iterations != null
     * @pre iterations != undefined
     * @return {Object} List Quantities
     */
    Controller.prototype.generate = function(iterations) {
        if(!iterations) {
            throw new Error('Controller.prototype.generate.pre :' +
                'quantity1 is null or undefined')
        }
        //TODO 
        //TODO Implementation
        //TODO Tests
    }    

    /**
     * Gets list of quantities and their position in the network
     * 
     * @return {Object} List Quantities
     */
    Controller.prototype.getNetwork = function() {
        //TODO Implementation
        //TODO Tests
    }

    /**
     * Sets the position of a quantity in the network
     * 
     * @param quantity = {Object} Quantity
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
