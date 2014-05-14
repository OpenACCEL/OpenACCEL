let func = macro {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        var $x = function() { return ($expr); };
        exe.$x = $x;
    }
    rule {
        ($x = $expr:expr ; $dim)
    } => {
        var $x = function() { return ($expr); };
        $x.dim = $dim;
        exe.$x = $x;
    }

    // Function declarations.
    rule {
        ($x($xs (,) ...) = $expr:expr)
    } => {
        var $x = function($xs (,) ...) { return ($expr); };
        exe.$x = $x;
    }
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        var $x = function($xs (,) ...) { return ($expr); };
        $x.dim = $dim;
        exe.$x = $x;
    }
}