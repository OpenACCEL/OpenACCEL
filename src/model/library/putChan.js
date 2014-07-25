this.std.putChan = function(myChannelName,myValue) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof myChannelName) == 'string') {
        var value = arrayToObject(myValue);
        var fnd = false;
        for (var i = 0; i < putChanTimers.length; i++) {
            if (putChanTimers[i].chanName == myChannelName) {
                // this channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - putChanTimers[i].time < MINURLDELAY) {
                    return myValue;
                } else {
                    // we can call the server again.
                    var encodedData = JSON.stringify(value);
                    var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl
                    });
                    putChanTimers[i].time = chanTime;
                    return myValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = putChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            putChanTimers[k] = {
                'returnValue': value,
                'time': chanTime,
                'chanName': myChannelName
            };
            var encodedData = JSON.stringify(value);
            var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl
            });
            return myValue;
        }
    } else {
        throw new Error("\nfirst argument of putChan() must be a string");
    }
};
