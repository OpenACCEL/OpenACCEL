function plot(x) {
    exe.hasPlot = true;

    if (x instanceof Array) {
        exe.plot = x;
        if (exe.plotStatus === '') {
            return 'plot OK';
        } else {
            throw new Error(exe.plotStatus);
        }
    } else {
        var plotTypeError =
            "type mismatch in 'plot': argument must be of the form [graph1, graph2, ...]\n" +
            "so there must be a single argument which is a vector. Each of the (1 or more) graphs has the form\n" +
            "graphi=[control,data,data,data,...] where 'control' is a javascript array assigning values\n" +
            "to parameters, and the 'data'-elements are vectors of scalar data each.";
        throw new Error(plotTypeError);
    }

}
