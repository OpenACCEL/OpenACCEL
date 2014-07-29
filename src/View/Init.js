var tooltips = {};

function resizeContainer() {
    var windowWidth = $(window).innerWidth();
    var fixedWidth = 900;
    var variableWidth = windowWidth * 0.8;
    var newMaxWidth = Math.max(fixedWidth, variableWidth);

    var container = $('#container');
    var content = $('#main');

    content.css(
        {
            'min-width': fixedWidth,
            'max-width': newMaxWidth
        }
    );

    container.css(
        {
            'left': Math.max(0, (windowWidth - newMaxWidth) / 2),
            'width': variableWidth
        }
    );
}

//------------------------------------------------------------------------------

function syntaxErrorMessage(id, error, selector) {
    this.id = id;

    var errorContainer = $(selector);
    var source = errorContainer.html();
    var errorLines = source.split('\n');
    var errorEnd = errorLines[error.lastLine - 1];

    errorLines[error.firstLine - 1] = errorEnd.substr(0, error.endPos) + '<span id = "errorlocation' + this.id + '"></span>' + errorEnd.substr(error.endPos);

    var newsource = errorLines.join('\n');
    errorContainer.html(newsource);

    var errorlocation = $('#errorlocation' + this.id);
    var pos = errorlocation.offset();

    errorContainer.children().remove();

    this.x = pos.left;
    this.y = 16 + pos.top;
    this.text = '';
    if (error.found === '') {
        this.text = '<span style = "color: #FF1144;">Syntax Error</span> Expected expression or operator at position ' + error.endPos + '.';
    } else {
        this.text = '<span style = "color: #FF1144;">Syntax Error</span> Unexpected \"' + error.found + '\" at position ' + error.startPos + ' to ' + error.endPos + '.'; /*' in line ' + error.firstLine;*/
    }
}

function runtimeErrorMessage(id, error, selector) {
    this.x = 0;
    this.y = 0;

    if (false) { //TODO check if attributable to single quantity definition

    } else {
        //Default display location
        var errorlocation = $(selector);
        var pos = errorlocation.offset();
        console.log(pos);

        this.x = -92 + pos.left + errorlocation.width();
        this.y = 48 + pos.top;
    }

    this.text = '<span style = "color: #FF1144;">Runtime Error</span> ' + error.message;
}

var errorCount = 0;

function handleError(error) {
    var errormsg = null;
    errorCount++;

    switch(error.constructor.name) {
        case 'SyntaxError':
            errormsg = new syntaxErrorMessage(errorCount, error, '#scriptline');
            break;
        case 'TypeError':
            //previously thrown when excessive whitespace was input
            break;
        case 'RuntimeError':
            errormsg = new runtimeErrorMessage(errorCount, error, '#scriptoptions');
            break;
        case 'Error':
            errormsg = new runtimeErrorMessage(errorCount, error, '#scriptoptions');
            break;
        default:
            errormsg = {
                id: errorCount,
                x: 0,
                y: 16,
                text: '<span style = "color: #FF1144;">Unknown error</span> Something went wrong internally during compilation.'
            };
            break;
    }

    $('.tooltipcontainer > .errormessage').filter(":visible").trigger('click');
    var errorTooltip = new Tooltip(errorCount++, 'errormessage', errormsg.x, errormsg.y);
    errorTooltip.set(errormsg.text);
}

//------------------------------------------------------------------------------

$(document).ready(
    function() {
        $('#main').tabs();

        $('#main').on('tabsbeforeactivate',
            function(event, ui) {
                $('.tooltipcontainer > .datamessage').filter(":visible").trigger('click');

                leaving = ui.oldPanel[0].id;
                switch (leaving) {
                    case 'editrun':
                        // Pause script when leaving edit/run tab, indicating it has
                        // been paused automatically by the system and not by the user
                        controller.pause(true);
                        break;
                    case 'ioedit':
                        // Build script from inputted source when leaving IO/edit
                        try {
                            if (editor) {
                                editor.save();
                            }
                            controller.setScriptFromSource($('#scriptarea').val());
                            showValues = false;
                            $('#showvalues').val('Show values');
                        } catch (e) {

                            if (typeof(e) === 'SyntaxError') {
                                console.log(e.message);
                            } else {
                                console.log(e);
                            }
                        }
                        break;
                    default:
                        break;
                }

                //Tooltips stored and hidden
                tooltips[leaving] = $('.tooltipcontainer').filter(":visible");
                tooltips[leaving].toggle(false);
            }
        );

        $('#main').on('tabsactivate',
            function(event, ui) {
                entering = ui.newPanel[0].id;
                switch (entering) {
                    case 'editrun':
                        // If autoexecute is true, resume script only when it has been paused
                        // by the system, and start executing when it is not paused but compiled
                        if (controller.autoExecute) {
                            if (controller.isPaused()) {
                                controller.resume(true);
                            } else {
                                controller.run();
                            }

                        }
                        break;
                    case 'ioedit':
                        setTimeout(function() {updateAdvancedEditor(); focusAdvancedEditor(); }, 100);
                        break;
                    default:
                        break;
                }

                //Tooltips loaded and shown
                try {
                    tooltips[entering].toggle(true);
                } catch(e) {

                }

                resizeContainer();
            }
        );

        $(window).on('load',
            function(event, ui) {
                resizeContainer();
                $('#loading').toggle(false);
            }
        );

        $(window).on('resize',
            function() {
                resizeContainer();
            }
        );

        $('.disabled').attr('disabled', 'disabled').off('click');
        $('.disabled').children().attr('disabled', 'disabled').off('click');
    }
);

//------------------------------------------------------------------------------

/**
 * Constructs a buffer object to contain updated content of a div and update the div when desired.
 *
 * @memberof View
 * @param {String} div Id of the div who's content is to be buffered
 * @class
 * @classdesc Buffer class to contain updated content of a div and update the div when desired
 */
function HTMLbuffer(div) {
    this.div = div;
    this.html = '';

    /**
     * Clears the buffer
     */
    this.empty = function() {
        this.html = '';
    };

    /**
     * Checks whether the buffer is empty
     *
     * @return {Boolean} True if and only if buffer is empty
     */
    this.isEmpty = function() {
        return (this.html === '');
    };

    /**
     * Hides the target html element if the buffer is empty, show otherwise
     *
     * @param {String} selector to indicate which element should be hidden
     */
    this.hideIfEmpty = function(target) {
        $(target).toggle(!this.isEmpty());
    };

    /**
     * Appends html to the buffer
     *
     * @param {String} html String to be appended to the buffer
     */
    this.append = function(html) {
        this.html = this.html + html;
    };

    /**
     * Replaces the content in the div with the content in the buffer
     */
    this.flip = function() {
        var target = $(this.div);
        if (target.html() !== this.html) {
            target.html(this.html);
        }
    };
}

//------------------------------------------------------------------------------

/**
 * Constructs a new Tooltip object
 *
 * @param {String} id      String to be used as a suffix in the id values of the generated html elements
 * @param {String} div     Selector to indicate which element the Tooltip should be associated with
 * @param {String} classes Classes to be assigned to the generated tooltip to affect the look and feel
 *
 * @memberof View
 * @class
 * @classdesc Tooltip object to be able to show the user messages related to a specific UI-element
 */
function Tooltip(id, classes, x, y) {
    this.id = id;
    this.classes = classes;
    this.x = x;
    this.y = y;

    this.getHTML = function(message) {
        return '' +
            '<div class = "tooltipcontainer">' +
                '<div id = "tooltip' + this.id + '" class = "tooltip ' + this.classes + '">' +
                    ' + message + ' +
                '</div>' +
            '</div>';
    };

    this.initialize = function() {
        $(document.body).append(this.getHTML(''));

        var tooltip = $('#tooltip' + this.id);
        tooltip.toggle(false);

        tooltip.parent().css(
            {
                'padding-left': -20 + this.x,
                'padding-top': 10 + this.y
            }
        );

        tooltip.on('click',
            function() {
                $(this).animate({padding: '+=8'}, 50,
                    function() {
                        $(this).animate({opacity: 0, width: 0, height: 0}, 200,
                            function() {
                                //$(this).toggle(false);
                                $(this).parent().remove();
                            }
                        );
                    }
                );
            }
        );
        tooltip.on('mouseenter',
            function() {
                $(this).animate({opacity: 0.8}, 200);
            }
        );
        tooltip.on('mouseleave',
            function() {
                $(this).animate({opacity: 1}, 100);
            }
        );
    };

    this.initialize();

    this.set = function(message) {
        $('#tooltip' + this.id).html(message);
        $('#tooltip' + this.id).toggle(true);
    };
}

//------------------------------------------------------------------------------


function ValueList(selector) {
    this.selector = selector;
    this.initialized = false;
    this.size = 0;

    /**
     * Buffer to contain HTML for the required list
     *
     * @memberof View
     * @type {HTMLbuffer}
     */
    this.buffer = new HTMLbuffer(selector);

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
     * @type {HTMLbuffer}
     */
    this.buffer = new HTMLbuffer(this.selector);

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

//------------------------------------------------------------------------------

function deselect() {
    var sel = window.getSelection();
    sel.removeAllRanges();
}

function selectContent(selector) {
    var element = $(selector)[0];
    var range = document.createRange();
    range.selectNodeContents(element);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function encodeHTML(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getPrecision(number) {
    //To compensate for javascript's floating point errors we use a correction variable which will temporarily convert floats to ints
    var correction = 100000;
    var numberdecimals = (number * correction - Math.floor(number) * correction) / correction;
    var precision = 0;

    while (numberdecimals % 1 !== 0) {
        numberdecimals *= 10;
        precision++;
    }
    return precision;
}