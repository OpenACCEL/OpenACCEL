/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
    fileModule = "fs";
} else {
    fileModule = "jquery";

    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define(["View/Input", "View/HTMLBuffer", "cm/lib/codemirror", "cm/addon/edit/matchbrackets", "cm/mode/ACCEL/ACCEL"], /**@lends View*/ function(Input, HTMLBuffer, CodeMirror) {
    /**
     * @class
     * @classdesc The Scripts tab.
     */
    function Scripts() {
        /**
         * Buffer to contain script information text
         * @memberof View
         * @type {HTMLbuffer}
         */
        this.scriptBuffer = new HTMLBuffer('#scriptinfo');

        /**
         * Search input field.
         *
         * @type {Input}
         */
        this.Input = new Input(this.scriptBuffer);

        /**
         * The lists for demo scripts and script tags respectively
         */
        this.demoScriptList = new this.Input.SelectionList('#demoscripts', function(script) {
            $('#demoscripts > a').removeClass('help_current');
            $('#demoscripts > a').filter(function(i) {
                return $(this).attr("value") == script;
            }).addClass('help_current');
            view.tabs.scripts.showScript(script);
        });
        this.tagList = new this.Input.SelectionList('#scripttags', function(tag) {
            $('#scripttags > a').removeClass('help_current');
            $('#scripttags > a').filter(function(i) {
                return $(this).attr("value") == tag;
            }).addClass('help_current');

            if (tag == "All") {
                view.tabs.scripts.viewScriptsForTag(tag);
            } else {
                var beginCount = tag.lastIndexOf("(");
                var tagname = tag.substr(0, beginCount-1);
                view.tabs.scripts.viewScriptsForTag(tagname);
            }
        });

        /**
         * The database of help articles, in their categories
         *
         * @type {Object}
         */
        this.articles = {};

        /**
         * A partitioning of all articles into the different help categories.
         *
         * @type {Object}
         */
        this.articlesByCategory = {};

        /**
         * List containing the names of all articles
         *
         * @type {Array}
         */
        this.articleNames = [];

        /**
         * All available demo scripts that can be loaded into OpenACCEL
         *
         * @type {Array}
         */
        this.demoScripts = [];

        /**
         * All available demo script tags
         *
         * @type {Array}
         */
        this.scriptTags = [];

        /**
         * A list of the names of all ACCEL functions.
         *
         * @type {Array}
         */
        this.ACCELFunctionNames = [];

        /**
         * Whether this tab will be entered for the first time the
         * next time it's entered.
         *
         * @type {Boolean}
         */
        this.firstEnter = true;

        /**
         * The CodeMirror instance to use for previewing scripts
         *
         * @type {CodeMirror}
         */
        this.cm = CodeMirror;

        /**
         * The CodeMirror editor currently used for previewing
         *
         * @type {CodeMirror}
         */
        this.previewEditor = null;
    }

    /**
     * Event that gets called when this tab gets opened.
     *
     * Loads the demo scripts and tags, if not already done.
     */
    Scripts.prototype.onEnterTab = function(newState) {
        view.hasPlot = false;

        // If this is the first time the tab is activated, setup everything
        if (this.firstEnter) {

            // Setup demo scripts list
            this.demoScripts = controller.getDemoScripts().sort();
            this.synchronizeDemoScripts(this.demoScripts);

            // Setup script tags list
            this.scriptTags = controller.getScriptTags();
            this.synchronizeScriptTags(this.scriptTags);

            // Setup ACCEL functions list
            this.ACCELFunctionNames = controller.getACCELFunctions();
            this.firstEnter = false;
        }
    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Scripts.prototype.onLeaveTab = function() {

    };

    /**
     * Event that gets called when the hash changes but
     * stays within this tab
     */
    Scripts.prototype.onHashChange = function(oldState, newState) {

    };

    /**
     * Asks the user for a script name and submits the script to the server.
     */
    Scripts.prototype.submitScript = function() {
        var name = prompt("Please enter a name to identify your script. If the name you propose is not unique, we will add a number to it", "myScriptName");
        if (name == null) {
            return;
        }

        var script = controller.getScriptSource();
        if (script.length <= 3) {
            alert("Error: There is no script to submit.")
        }

        $.ajax({
            type: "POST",
            url: "http://www.openaccel.nl/php/keyMapDBI.php?task=setPost",
            data : {
                'propName': name,
                'pst' : script
            },
            context: this,
            success: function(result, status) {
                alert("Script succesfully uploaded. Visit this link to view your script:\n\nhttp://www.openaccel.nl/#userscript=" + result);
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
     * Shows the contents of the script with the given name,
     * if it exists.
     * If it does not exist, an error message is displayed instead.
     *
     * @param  {scriptName} scriptName The name of the script to display
     */
    Scripts.prototype.showScript = function(scriptName) {
        var script = controller.getDemoScript(scriptName);
        this.scriptBuffer.empty();

        // If script not found, display error message
        if (!script) {
            this.scriptBuffer.append('<h2 style="padding-left: 0px;">Script not found</h2>');
            this.scriptBuffer.append('<div class="help_text">It may have been deleted, or the name may be incorrect.</div>');
            this.scriptBuffer.flip();
            return;
        }

        $('#demoscripts > a').removeClass('help_current');
        $('#demoscripts > a').filter(function(i) {
            return $(this).attr("value") == scriptName;
        }).addClass('help_current');

        // Construct normal article heading
        var title = script.name[0].toUpperCase() + script.name.slice(1);
        this.scriptBuffer.append('<div><h2 style="padding-left: 0px; display: inline; margin-top: 5px; vertical-align: middle;">' + title + ' (v' + script.version + ')</h2><input id="loadScriptButton" type="button" class="buttonin" value="Load this script" onclick="view.setState({\'tab\': \'editrun\', \'script\': \'' + script.name + '\'});" /></div>');


        /**----- Add every member of the script object as a separate paragraph with it's heading -----**/
        var text;

        // Author(s)
        if (script.authors) {
            text = "";

            if (script.authors.length > 0) {
                for (var elem in script.authors) {
                    var author = script.authors[elem].name;
                    text += author + ", ";
                }
                text = text.slice(0, -2);
            } else {
                text = "Unknown";
            }

            if (script.authors.length > 1) {
                this.scriptBuffer.append('<h3 class="script_heading">Authors</h3>');
            } else {
                this.scriptBuffer.append('<h3 class="script_heading">Author</h3>');
            }
            this.scriptBuffer.append('<div class="script_text">' +  text + '</div>');
        }

        // Description
        if (script.description && script.description !== '') {
            text = view.tabs.scripts.formatForHelp(script.description);
            this.scriptBuffer.append('<h3 class="script_heading">Description</h3>');
            this.scriptBuffer.append('<div class="script_text">' +  text + '</div>');
        }

        // Source
        if (script.source && script.source !== '') {
            text = script.source;
            this.scriptBuffer.append('<h3 class="script_heading">Source</h3>');
            this.scriptBuffer.append('<div class="script_text"><textarea id="scriptsourcepreview" cols=110 rows=25>' +  text + '</textarea></div>');
        }

        this.scriptBuffer.flip();

        // Make read-only advanced editor from textarea containing script source
        this.previewEditor = this.cm.fromTextArea(document.getElementById('scriptsourcepreview'), {
            mode: 'ACCEL',
            theme: 'default',
            matchBrackets: true,
            lineNumbers: true,
            lineWrapping: false,
            undoDepth: 50,             // Try to save some memory
            viewportMargin: Infinity,    // Always render entire document, so that text search and e.g. added event handlers work correctly
            readOnly: true
        });

        // Highlight search phrase if any
        var search = view.encodeHTML($('#scriptname').val().trim());
        if (search.length > 2) {
            var re = new RegExp(search, "gi");
            $('div.script_text').not("#authors").each(function() {
                // Remove old matches first, then highlight new ones!
                var oldText = $(this).html();
                var newText = oldText.replace(re, '<span class="scripts_match">$&</span>');
                $(this).html(newText);
            });
        }
    };

    /**
     * Formats the given piece of text for display in a help article. This formats all occurences of the ACCEL and Descartes
     * logos and highlights all matches of the current searcg phrase, if any.
     *
     * @param  {String} text The text to format for display in a help article
     * @return {String} The formatted text
     */
    Scripts.prototype.formatForHelp = function(text) {
        var search = view.encodeHTML($('#scriptname').val().trim());

        // Format ACCEL logo's
        text = text.replace(new RegExp('\\+ACCELTM\\+', 'g'), '<span class="accelTM">ACCEL</span>');

        // Format Descartes logo's
        text = text.replace(new RegExp('\\+DESCARTESTM\\+', 'g'), '<span class="descartesTM">Descartes</span>');

        // Highligh search matches
        if (search !== '' && search.length > 2) {
            text = text.replace(new RegExp(search, "gi"), '<span class="scripts_match">$&</span>');
        }

        return text;
    };

    /**
     * Searches the help database contents for the given phrase,
     * and displays all help topics that return a match in the list.
     *
     * @param  {String} search The phrase to search for in the help database
     */
    Scripts.prototype.searchScripts = function(search) {
        /**
         * Removes any search highlights from the given text
         *
         * @param {String} text The text from which to remove search highlights
         * @return {String} The given text, with search highlights removed
         */
        function clearMatches(text) {
            return text.replace(/<span class="scripts_match">([^<]*)<\/span>/gi, '$1');
        }

        // Encode HTML to avoid matching html inside article text
        var phrase = view.encodeHTML(search);

        // Do a global, case-insensitive search
        var re = new RegExp(phrase, "gi");

        // If search term not longer than 2 characters, only clear
        // current search highlights and return
        if (phrase.length <= 2) {
            // Clear existing matches
            $('div.script_text').not("#authors").each(function() {
                var newText = clearMatches($(this).html());
                $(this).html(newText);
            });

            // Display all demo's again
            this.synchronizeDemoScripts(this.demoScripts);

            return;
        }

        // Search in currently displayed article
        $('div.script_text').not("#authors").each(function() {
            // Remove old matches first, then highlight new ones!
            var oldText = clearMatches($(this).html());
            var newText = oldText.replace(re, '<span class="scripts_match">$&</span>');
            $(this).html(newText);
        });

        // Search in all (other) articles
        var matches = controller.searchDemoScripts(search);

        this.synchronizeDemoScripts(matches);
    };

    Scripts.prototype.loadDemoScript= function(demoscript) {
        console.log('demoscript: ' + demoscript);
    };

    Scripts.prototype.synchronizeDemoScripts = function(demoscripts) {
        this.demoScriptList.set(_.map(demoscripts, 'name'));
    };

    Scripts.prototype.synchronizeScriptTags = function(tags) {
        var tags = _.map(tags, function(tag) {
            return tag.name + ' (' + tag.scriptCount + ')';
        });
        tags.unshift("All");

        this.tagList.set(tags);
    };

    Scripts.prototype.viewScriptsForTag = function(tag) {
        if (tag == "All") {
            this.synchronizeDemoScripts(this.demoScripts)
        } else {
            var matches = controller.scriptsWithTag(tag);
            this.synchronizeDemoScripts(matches);
        }
    };

    return Scripts;
});
