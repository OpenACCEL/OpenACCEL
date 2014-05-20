let abs = macro {
    rule { ($x) } => {
        (function() {
            return Math.abs($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.abs($x);
        })()
    }
}