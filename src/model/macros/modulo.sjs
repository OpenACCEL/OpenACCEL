let mod = macro {
    rule { ($x, $y) } => {
        (function() {
            return $x % $y;
        })()
    }

    rule { ($x:expr, $y:expr) } => {
        (function() {
            return $x % $y;
        })()
    }
}