/*global env: true */
'use strict';

var fs = require('jsdoc/fs');
var outdir = env.opts.destination;

var membersection = "\\subsubsection*{\\underline{Members}}\n";
var methodsection = "\\subsubsection*{\\underline{Methods}} \n";
var classsection = "\\subsubsection*{\\underline{Classes}} \n";

var data;

function getData() {
    return data({
        comment: {
            "!is": ""
        }
    }).order("longname");
}

function replaceSpecial(s) {
    var result = s.replace(/(\\)/g, "\\textbackslash ");
    result = result.replace("~", "\\textasciitilde ");
    result = result.replace("^", "\\textasciicircum ");
    result = result.replace(/([#$%&_{}])/g, function(sym) {
        return "\\" + sym
    });
    return result;

}

function handleMember(m) {
    var output = "";
    var hasDesc = m.description;
    var hasType = m.type && m.type.names && m.type.names.length;

    // Section header
    output += "\\subsubsection{" + replaceSpecial(m.name) + "} \n";
    // constant indicator
    if (m.kind == "constant") {
        output += "$\\langle$ Constant $\\rangle$ \n";
    }
    // Information fields
    if (hasDesc || hasType) {
        output += "\\begin{description} \n"

        if (hasDesc) {
            output += "\\item[Description:]" + replaceSpecial(m.description) + "\n";
        }
        if (hasType) {
            // type is defined
            output += "\\item[Type:]" + m.type.names[0] + "\n";
        }
        output += "\\end{description} \n";
    }
    output += "\n\n\\smallskip\\hrulefill\n\n";

    return output;
}

function handleMethod(m) {
    var output = "";
    // subsubsection for each method
    output += "\\subsubsection{" + replaceSpecial(m.name) + "(";
    if (m.params && m.params.length) {
        output += m.params[0].name;
        for (var i = 1; i < m.params.length; i++) {
            output += ", " + replaceSpecial(m.params[i].name);
        }
    }
    output += ")} \n";

    if (m.description) {
        // Description
        output += "\\paragraph{Description:} \\hfill \\\\ \n" + replaceSpecial(m.description) + "\n";
    }
    if (m.params && m.params.length) {
        // parameters
        output += "\\paragraph{Parameters:} \\hfill \\\\ \n";
        output += "\\begin{tabular}{|l|l|p{0.6\\textwidth}|}\n";
        output += "\\hline\n";
        output += "\\textsc{Name} & \\textsc{Type} & \\textsc{Description} \\\\ \n";
        output += "\\hline\n\\hline\n";
        for (var i in m.params) {
            output += ((m.params[i].name) ? replaceSpecial(m.params[i].name) : "") + "& ";
            output += ((m.params[i].type && m.params[i].type.names && m.params[i].type.names.length) ? m.params[i].type.names[0] : "") + " & ";
            output += ((m.params[i].description) ? replaceSpecial(m.params[i].description) : "") + "\\\\ \n";
            output += "\\hline\n";
        }
        output += "\\end{tabular}\n";
    }
    if (m.pre && m.pre.length) {
        // preconditions
        output += "\\paragraph{Preconditions:} \n";
        output += "\\begin{itemize}  \n";
        for (var i in m.pre)
            output += "\\item  " + replaceSpecial(m.pre[i]) + "\n";
        output += "\\end{itemize}  \n";
    }
    if (m.post && m.post.length) {
        // post conditions
        output += "\\paragraph{Postconditions:}\n";
        output += "\\begin{itemize}  \n";
        for (var i in m.post)
            output += "\\item  " + replaceSpecial(m.post[i]) + "\n";
        output += "\\end{itemize}  \n";
    }
    if (m.exceptions && m.exceptions.length) {
        // exceptions
        output += "\\paragraph{Throws:} \\hfill \\\\ \n";
        output += "\\begin{tabular}{|l|p{0.6\\textwidth}|}\n";
        output += "\\hline\n\\hline\n";
        output += "\\textsc{Type} & \\textsc{Description} \\\\ \n";
        output += "\\hline\n";
        for (var i in m.exceptions) {
            output += ((m.exceptions[i].type && m.exceptions[i].type.names && m.exceptions[i].type.names.length) ? m.exceptions[i].type.names[0] : "") + " & ";
            output += ((m.exceptions[i].description) ? replaceSpecial(m.exceptions[i].description) : "") + "\\\\ \n";
            output += "\\hline\n";
        }
        output += "\\end{tabular}\n";
    }

    if (m.returns && m.returns.length) {
        // return variable
        output += "\\paragraph{Returns:} \\hfill \\\\ \n";
        output += ((m.returns[0].description) ? replaceSpecial(m.returns[0].description) + "\\\\ \n" : "");
        output += ((m.returns[0].type && m.returns[0].type.names && m.returns[0].type.names.length) ? "\\textsc{Type:} " + m.returns[0].type.names[0] + "\n" : "");

    }

    output += "\n\n\\smallskip\\hrulefill\n\n";
    return output;
}

function handleClass(c) {
    var output = "";
    // new section for a new class
    output += "\\subsection{" + replaceSpecial(c.name) + "} \n";
    if (c.classdesc) {
        // Description of class
        output += "\\textbf{Description: }" + replaceSpecial(c.classdesc) + "\n";
    }

    output += handleMembers(c.longname);
    output += handleMethods(c.longname);

    return output;
}

function handleGlobals() {
    var output = "";

    // Handle global definitions
    // Members
    var globalMem = getData().filter({
        scope: "global",
        kind: ["member", "constant"]
    });

    output += "\\section{Global} \n";
    if (globalMem.count() > 0) {
        output += membersection;
    }

    // Handle each global members
    globalMem.each(function(g) {
        if (!g.comment) {
            return;
        }
        output += handleMember(g);

    });

    // Methods
    var globalMet = getData().filter({
        scope: "global",
        kind: "function"
    });

    if (globalMet.count() > 0) {
        output += methodsection;
    }

    // Handle each global method
    globalMet.each(function(g) {
        if (!g.comment) {
            return;
        }
        output += handleMethod(g);

    });
    return output;
}

function handleMembers(memberOf) {
    var output = "";
    var members = getData().filter({
        kind: ["member", "constant"],
        memberof: memberOf
    });

    if (members.count() > 0) {
        output += membersection;
    }

    // handle each member variable
    members.each(function(m) {
        output += handleMember(m);
    });



    return output;
}

function handleMethods(memberOf) {
    var output = "";
    var methods = getData().filter({
        kind: "function",
        memberof: memberOf
    });

    if (methods.count() > 0) {
        output += methodsection;
    }


    // handle each method
    methods.each(function(m) {
        output += handleMethod(m);
    });
    return output;
}



exports.publish = function(taffydata) {
    var output = "{\\ttfamily\n";


    data = taffydata;

    // First handle all global definitions
    output += handleGlobals();

    var namespaces = getData().filter({
        kind: "namespace"
    });

    var nsNames = [''];

    namespaces.each(function(n) {
        output += "\\section{" + replaceSpecial(n.longname) + "}\n";
        if (n.description) {
            output += "\\paragraph{Description}" + replaceSpecial(n.description);
        }

        nsNames.push(n.longname);

        output += "\\setcounter{subsubsection}{0}\n"

        // handle members of this namespace
        output += handleMembers(n.longname);
        output += handleMethods(n.longname);


        // Extract all classes for this namespace
        var nsclasses = getData().filter({
            kind: "class",
            memberof: n.longname
        });

        if (nsclasses.count() > 0) {
            output += classsection;
        }

        // Handle each class
        nsclasses.each(function(c) {
            if (!c.comment) {
                return;
            }
            output += handleClass(c);
        });

    });

    // Extract all classes without namespace
    var classes = getData().filter({
        kind: "class"
    });

    var noNSClasses = [];
    classes.each(function(c) {
        if (nsNames.indexOf(c.memberof) == -1) {
            noNSClasses.push(c);
        }
    });


    if (noNSClasses.length > 0) {
        output += "\\section{$\\langle$ No Namespace $\\rangle$}\n";
    }

    // Handle each class
    noNSClasses.forEach(function(c) {
        if (!c.comment) {
            return;
        }
        output += handleClass(c);


    });

    output += "}";

    fs.mkPath(outdir);
    fs.writeFileSync(outdir + "jsdoc.tex", output);

};
