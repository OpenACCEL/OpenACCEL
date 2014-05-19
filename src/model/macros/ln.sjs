let ln = macro {
    rule { ($x) } => {
        (function() {
            return Math.log($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.log($x);
        })()
    }
}