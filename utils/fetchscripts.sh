#!/bin/bash
while read p; do
	wget "http://www.keesvanoverveld.com/Accel/php/retrieveDemo.php?file=$p.txt" -O "../test/model/scripts/$p.accel"
done < scriptlist