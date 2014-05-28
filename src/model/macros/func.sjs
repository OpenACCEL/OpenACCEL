macro func {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        func($x() = $expr)
    }
    rule {
        ($x = $expr:expr ; $dim)
    } => {
        func($x() = $expr)
        exe.$x.dim = $dim;
    }

    // Function declarations.
    rule {
        ($x($xs (,) ...) = $expr:expr)
    } => {
        exe.$x = function($xs (,) ...) {
            // If a quantity is time dependant, look up if there exists a previous version.
            if (true /* exe.__report__ && exe.__report__.$x.isTimeDependant */) {
                if (exe.$x[exe.__time__] === undefined) {
                    exe.$x[exe.__time__] = $expr;
                }
                return exe.$x[exe.__time__];
            } else {
                if (exe.$x[0] === undefined) {
                    exe.$x[0] = ($expr);
                }
                return exe.$x[0];
            }
        };
    }
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
        exe.$x.dim = $dim;
    }
}