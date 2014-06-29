function __do__(code, args) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (typeof code === "string") {
        if (args instanceof Object) {
            for (var arg in args) {
                var target = new RegExp('_' + arg, "g");
                code = code.replace(target, JSON.stringify(args[arg]));
                try {
                    // this is to protect against all disasters like syntax errors in the script string code we can't foresee
                    var res = (new Function(code))();
                    return res;
                } catch (err) {
                    return 'ERROR';
                }
            }
        } else {
            throw new Error("\nFor function do(), second argument must be a vector");
  
        }
    } else {
        throw new Error("\nFor function do(), first argument must be a string (= a code fragment)");
    }
}
