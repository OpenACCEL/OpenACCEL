let cond = macro {
    rule { 
        ($x:expr,$y:expr,$z:expr)
    } => {
        (($x)?($y):($z))
    }
}