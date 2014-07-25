this.std.cursorX = function() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return this.mouseX;
};

this.std.cursorX.isTimeDependent = true;
