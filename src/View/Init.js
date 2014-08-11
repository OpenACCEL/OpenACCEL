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
    var source = errorContainer.text();
    var errorLines = source.split('\n');

    var errorEnd = errorLines[error.lastLine - 1];

    errorLines[error.firstLine - 1] = errorEnd.substr(0, error.endPos) + '<span id = "errorlocation' + this.id + '"></span>' + errorEnd.substr(error.endPos);

    var newsource = errorLines.join('\n');
    errorContainer.html(newsource);

    var errorlocation = $('#errorlocation' + this.id);
    var pos = errorlocation.offset();

    errorContainer.children().remove();

    // Ensure the popup is never displayed outside of the input field
    var minX = errorContainer.offset().left;
    var maxX = errorContainer.offset().left + errorContainer.outerWidth();
    this.x = (pos.left-3 < minX) ? minX : ((pos.left-3 > maxX) ? maxX : pos.left-3)
    this.y = 16 + pos.top;
    this.text = '';
    if (error.type === 'lexical') {
        this.text = '<span style = "color: #FF1144;">Syntax Error</span> Unexpected \"' + error.found + '\" at position ' + (error.startPos+1) + '.';
    } else if (error.found === '') {
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

    if (error.type === 'lexical') {
        this.text = '<span style = "color: #FF1144;">Syntax Error</span> ' + error.message;
    } else {
        this.text = '<span style = "color: #FF1144;">Runtime Error</span> ' + error.message;
    }
}

var errorCount = 0;

function handleError(error) {
    var errormsg = null;
    errorCount++;

    switch(error.constructor.name) {
        case 'SyntaxError':
            // Can be either a lexical scanner or parsing error. Handle appropriately
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
                            if (view.tabs.ioedit.editor) {
                                view.tabs.ioedit.editor.save();
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
                    case 'simulation':
                        controller.pause(true);
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
                    case 'simulation':
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
                        setTimeout(function() {
                            view.tabs.ioedit.updateAdvancedEditor();
                            view.tabs.ioedit.focusAdvancedEditor();
                        }, 100);
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
