/*
 * A Script Store that saves scripts to and loads scripts from a server.
 *
 * @author Edward Brinkmann
 *
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

define(["model/datastores/AbstractScriptStore", 
        "jquery",
        "model/NetworkError"], /**@lends Model*/ 
        function(AbstractScriptStore, $, NetworkError) {
    /**
     * @class
     * @classdesc 
     */

    function ServerScriptStore() {
        /**
         * Configuration variables
         */
        this.scriptIndexUrl = "";
        this.loadScriptUrl = "";
        this.loadScriptParam = "";
        this.saveScriptUrl = "";

        this.scriptList = [];
        this.scriptListRetrieved = false;
    }

    ServerScriptStore.prototype = new AbstractScriptStore();
        /**
         * Retrieves a list of all the scripts in this store and calls the provided completion
         * handler function with the result.
         *
         * @param completionHandler The callback function to call with the result. Must accept
         * a single parameter containing the array of script names.
         */
        ServerScriptStore.prototype.getScripts = function(completionHandler) {
            if (inBrowser) {
                if (!this.scriptListRetrieved) {
                    $.ajax({
                        context: this,
                        type: "GET",
                        url: this.scriptIndexUrl,

                        success: (function(result) {
                            if (result) {
                                // Iterate through all returned scriptnames and add them to our array
                                for (var i = 0; i < result.length; i++) {
                                    this.scriptList.push(result[i]["name"]);
                                }

                                // Call provided completion handler
                                completionHandler(this.scriptList);
                            }
                        }).bind(this),

                        error: function(err) {
                            throw new NetworkError("Error retrieving list of scripts: " + err);
                        },

                        fail: function(err) {
                            throw new NetworkError("Error retrieving list of scripts: " + err);
                        },

                        async: true
                    });
                } else {
                    completionHandler(this.scriptList);
                }
            }
        };

        /**
         * Saves the given script source as a script with the given name to the
         * store.
         *
         * @param {String} name The name to give to the script to be stored
         * @param {String} source The source of the script to save in the store.
         */
        ServerScriptStore.prototype.saveScript = function(name, source) {

        };

        /**
         * Retrieves the script with the given name from the store.
         *
         * @param {String} name The name of the script to load from the store
         * @return {String} The source of the script with name name, or null if there
         * is no script in the store with this name.
         */
        ServerScriptStore.prototype.loadScript = function(name) {
            if (inBrowser) {
                $.ajax({
                    context: this,
                    type: "GET",
                    url: this.loadScriptUrl + "?" + this.loadScriptParam + "=" + name,

                    success: (function(result) {
                        if (result) {
                            // Iterate through all returned scriptnames and add them to our array
                            for (var i = 0; i < result.length; i++) {
                                this.scriptList.push(result[i]["name"]);
                            }
                        }
                    }).bind(this),

                    error: function(err) {
                        throw new NetworkError("Error retrieving list of scripts: " + err);
                    },

                    fail: function(err) {
                        throw new NetworkError("Error retrieving list of scripts: " + err);
                    },

                    async: false
                });
            }
        };
    }

    // Exports are needed, such that other modules may invoke methods from this module file.
    return ServerScriptStore;
});
