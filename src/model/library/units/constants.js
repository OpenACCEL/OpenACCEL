var MINURLDELAY = 1000;
// every call to a url is protected by a timer to prevent bandwith exhaustion: one URL shall not be called more frequently than
// once every MINURLDELAY millisec. Calls that occur more frequently will simply return the same value as the previous call
// to that URL. A URL, here, is interpreted as the part prior to the question mark. Indeed, a same host can be spammed by a
// high frequent series of calls each time with different parameters. We don't both the same host more often than
// once every MINURLDELY millisec. On the other hand, we ensure that the parameters of every call are different, so that
// browsers cannot cache results ,thereby hiding any changes in server-side state.
var putChanTimers = [];
var getChanTimers = [];
// entries in the array urlTimers are distinguished by the host. That is, all calls to the keyMap-url are scheduled via the same array urlTimers. For this
// reason, there should not be two or more calls to getUrl in one script. In case multiple in- or out channels are needed, we can use the keyMap server, but
// then we need to schedule them based on the key-name. For this reason, we have two extra arrays with timers.

var urlTimers = [];

var E = Math.E;

var PI = Math.PI;
