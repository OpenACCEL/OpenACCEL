let ceil = macro {
    rule { ($x) } => {
        (function() {
            return Math.ceil($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.ceil($x);
        })()
    }
}