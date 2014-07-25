this.std.getChan = function(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof x) == 'string') {
        var fnd = false;
        for (var i = 0; i < getChanTimers.length; i++) {
            if (getChanTimers[i].chanName == x) {
                // ithis channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - getChanTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return getChanTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from channel ' + x + '; status=' + status.response);
                            getChanTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    getChanTimers[i].time = chanTime;
                    return getChanTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = getChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            getChanTimers[k] = {
                'returnValue': 0,
                'time': chanTime,
                'chanName': x
            };
            var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from channel; status=' + status.response);
                    getChanTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getChan() must be a string");
    }

};
