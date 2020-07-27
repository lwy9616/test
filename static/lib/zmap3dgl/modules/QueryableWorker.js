export default function QueryableWorker(sURL, fDefListener, fOnError) {
    var oInstance = this,
        oWorker = new Worker(sURL), oListeners = {};
    this.defaultListener = fDefListener || function () { };
    oWorker.onmessage = function (oEvent) {
        if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty("vo42t30") && oEvent.data.hasOwnProperty("rnb93qh")) {
            oListeners[oEvent.data.vo42t30].apply(oInstance, oEvent.data.rnb93qh);
        } else {
            this.defaultListener.call(oInstance, oEvent.data);
        }
    };
    if (fOnError) { oWorker.onerror = fOnError; }
    this.sendQuery = function (/* queryable function name, argument to pass 1, argument to pass 2, etc. etc */) {
        if (arguments.length < 1) {
            throw new TypeError("QueryableWorker.sendQuery - not enough arguments");
            return;
        }
        oWorker.postMessage({
            "bk4e1h0": arguments[0],
            "ktp3fm1": Array.prototype.slice.call(arguments, 1)
        });
    };
    this.postMessage = function (vMsg) {
        //I just think there is no need to use call() method
        //how about just oWorker.postMessage(vMsg);
        //the same situation with terminate
        //well,just a little faster,no search up the prototye chain
        Worker.prototype.postMessage.call(oWorker, vMsg);
    };
    this.terminate = function () {
        Worker.prototype.terminate.call(oWorker);
    };
    this.addListener = function (sName, fListener) {
        oListeners[sName] = fListener;
    };
    this.removeListener = function (sName) {
        delete oListeners[sName];
    };
}