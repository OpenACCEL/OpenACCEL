let func = macro {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        exe.$x = function() { return ($expr); };
    }
    rule {
        ($x = $expr:expr ; $dim)
    } => {
        exe.$x = function() { return ($expr); };
        exe.$x.dim = $dim;
    }

    // Function declarations.
    rule {
        ($x($xs (,) ...) = $expr:expr)
    } => {
        exe.$x = function($xs (,) ...) { return ($expr); };
    }
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        exe.$x = function($xs (,) ...) { return ($expr); };
        exe.$x.dim = $dim;
    }
}
