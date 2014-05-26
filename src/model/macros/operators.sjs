operator (__add__) 12 left { $l, $r } => #{ zip($l, $r, add) }
operator (__subtract__) 12 left { $l, $r } => #{ zip($l, $r, subtract) }
operator (__multiply__) 14 left { $l, $r } => #{ zip($l, $r, multiply) }
operator (__divide__) 14 left { $l, $r } => #{ zip($l, $r, divide) }
operator (__modulo__) 14 left { $l, $r } => #{ zip($l, $r, modulo) }

operator (__subtract__) 14 { $u } => #{ -$u }
