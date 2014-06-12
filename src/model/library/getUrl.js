function getUrl(url) {
    if ((typeof url) == 'string') {
        var comps = url.split('?');
        // comps[0] is the part of the URL. Check if this occurs in the array 
        var fnd = false;
        for (var i = 0; i < urlTimers.length; i++) {
            if (urlTimers[i].baseName == comps[0]) {
                // it exists. See at what time we called it.
                fnd = true;
                var urlDate = new Date();
                var urlTime = urlDate.getTime();
                if (urlTime - urlTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return urlTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            urlTimers[i].returnValue = JSON.parse(data);
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from server; status=' + status.response);
                            urlTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    urlTimers[i].time = urlTime;
                    return urlTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = urlTimers.length;
            var urlDate = new Date();
            var urlTime = urlDate.getTime();
            urlTimers[k] = {
                'returnValue': 0,
                'time': urlTime,
                'baseName': comps[0]
            };
            var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    urlTimers[i].returnValue = JSON.parse(data);
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from server; status=' + status.response);
                    urlTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getURL() must be a string");
    }

}
