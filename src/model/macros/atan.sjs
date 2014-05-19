let atan = macro {
    rule { ($x) } => {
        (function() {
            return Math.atan($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.atan($x);
        })()
    }
}