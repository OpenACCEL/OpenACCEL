let func = macro {
    rule {
        ($x = $expr)
    } => {
        $x = function() { return ($expr); };
        exe.$x = $x;
    }
    rule {
        ($x = $expr ; $dim)
    } => {
        $x = function() { return ($expr); };
        $x.dim = $dim;
        exe.$x = $x;
    }
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
}