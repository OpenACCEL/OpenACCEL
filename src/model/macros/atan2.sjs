let atan2 = macro {
    rule { ($x, $y) } => {
        (function() {
            return Math.atan2($y, $x);
        })()
    }

    rule { ($x:expr, $y:expr) } => {
        (function() {
            return Math.atan2($y, $x);
        })()
    }
}