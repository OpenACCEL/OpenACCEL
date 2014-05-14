let log = macro {
    rule { ($x) } => {
        (function() {
            return Math.log($x) / Math.log(10);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.log($x) / Math.log(10);
        })()
    }
}