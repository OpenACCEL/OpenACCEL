let quantifier = macro {
    rule {
        ($dummy:ident, $domain:expr, $exp:expr, $func:expr)
    } => {
        (function() {
            var domain = $domain;

            var zipResult = this.libraries.std.unaryZip(domain, (function($dummy) {
                return $exp;
            }).bind(this));

            return this.libraries.std.foldl(zipResult, $func);
        }).call(this)
    }
}
