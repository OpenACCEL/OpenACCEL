/*global env: true */
'use strict';

var fs = require('jsdoc/fs');
var outdir = env.opts.destination;

var data;

function getData() {
    return data({
        comment: {
            "!is": ""
        }
    }).order("longname");
}

function handleMember(m) {
    var output = "";
    var hasDesc = m.description;
    var hasType = m.type && m.type.names && m.type.names.length;

    // Section header
    output += "\\subsubsection{" + m.name + "} \n";
    // constant indicator
    if (m.kind == "constant") {
        output += "$\\langle$ Constant $\\rangle$ \n";
    }
    // Information fields
    if (hasDesc || hasType) {
        output += "\\begin{description} \n"

        if (hasDesc) {
            output += "\\item[Description:]" + m.description + "\n";
        }
        if (hasType) {
            // type is defined
            output += "\\item[Type:]" + m.type.names[0] + "\n";
        }
        output += "\\end{description} \n";
    }

    return output;
}

function handleMethod(m) {
    var output = "";
    // subsubsection for each method
    output += "\\subsubsection{" + m.name + "(";
    if (m.params && m.params.length) {
        output += m.params[0].name;
        for (var i = 1; i < m.params.length; i++) {
            output += ", " + m.params[i].name;
        }
    }
    output += ")} \n";

    if (m.description) {
        // Description
        output += "\\paragraph{Description:} \\hfill \\\\ \n" + m.description + "\n";
    }
    if (m.params && m.params.length) {
        // parameters
        output += "\\paragraph{Parameters:} \\hfill \\\\ \n";
        output += "\\begin{tabular}{|l|l|l|}\n";
        output += "\\hline\n";
        output += "\\textbf{Name} & \\textbf{Type} & \\textbf{Description} \\\\ \n";
        output += "\\hline\n";
        for (var i in m.params) {
            output += "\\texttt{" + ((m.params[i].name) ? m.params[i].name : "") + "} & ";
            output += ((m.params[i].type && m.params[i].type.names && m.params[i].type.names.length) ? m.params[i].type.names[0] : "") + " & ";
            output += ((m.params[i].description) ? m.params[i].description : "") + "\\\\ \n";
            output += "\\hline\n";
        }
        output += "\\end{tabular}\n";
    }
    if (m.pre && m.pre.length) {
        // preconditions
        output += "\\paragraph{Preconditions:} \n";
        output += "\\begin{itemize}  \n";
        for (var i in m.pre)
            output += "\\item  " + m.pre[i] + "\n";
        output += "\\end{itemize}  \n";
    }
    if (m.post && m.post.length) {
        // post conditions
        output += "\\paragraph{Postconditions:}\n";
        output += "\\begin{itemize}  \n";
        for (var i in m.post)
            output += "\\item  " + m.post[i] + "\n";
        output += "\\end{itemize}  \n";
    }
    if (m.exceptions && m.exceptions.length) {
        // exceptions
        output += "\\paragraph{Throws:} \\hfill \\\\ \n";
        output += "\\begin{tabular}{|l|l|}\n";
        output += "\\hline\n";
        output += "\\textbf{Type} & \\textbf{Description} \\\\ \n";
        output += "\\hline\n";
        for (var i in m.exceptions) {
            output += ((m.exceptions[i].type && m.exceptions[i].type.names && m.exceptions[i].type.names.length) ? m.exceptions[i].type.names[0] : "") + " & ";
            output += ((m.exceptions[i].description) ? m.exceptions[i].description : "") + "\\\\ \n";
            output += "\\hline\n";
        }
        output += "\\end{tabular}\n";
    }

    if (m.returns && m.returns.length) {
        // return variable
        output += "\\paragraph{Returns:} \\hfill \\\\ \n";
        output += ((m.returns[0].description) ? m.returns[0].description + "\\\\ \n":"");
        output += ((m.returns[0].type && m.returns[0].type.names && m.returns[0].type.names.length) ? "\\underline{Type:} " + m.returns[0].type.names[0] + "\n": "");

    }
    return output;
}

function handleClass(c) {
    var output = "";
    // new section for a new class
    output += "\\section{" + c.name + "} \n";
    if (c.classdesc) {
        // Description of class
        output += "\\textbf{Description: }" + c.classdesc + "\n";
    }

    // ==========================================
    // Member variables of the class
    output += "\\subsection{Members} \n";

    var members = getData().filter({
        kind: ["member", "constant"]
    });

    // handle each member variable
    members.each(function(m) {
            if (!m.comment || !m.memberof || !m.memberof == c.name) {
                return;
            }
            output += handleMember(m);
        }


    );

    // ==========================================
    // Methods 
    output += "\\subsection{Methods} \n";

    var methods = getData().filter({
        kind: "function"
    });


    // handle each method
    methods.each(function(m) {
        if (!m.comment || !m.memberof || !m.memberof == c.name) {
            return;
        }
        output += handleMethod(m);

    });
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
    output += "\\subsection{Members} \n";

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

    output += "\\subsection{Methods} \n";

    // Handle each global method
    globalMet.each(function(g) {
        if (!g.comment) {
            return;
        }
        output += handleMethod(g);

    });
    return output;
}

exports.publish = function(taffydata) {
    var output = "";


    data = taffydata;

    // First handle all global definitions
    output += handleGlobals();

    // Extract all classes from this data
    var classes = getData().filter({
        kind: "class"
    });

    // Handle each class
    classes.each(function(c) {
        if (!c.comment) {
            return;
        }
        output += handleClass(c);


    });

    getData().each(function(r) {
        //console.log(r);

    });

    fs.mkPath(outdir);
    fs.writeFileSync(outdir + "jsdoc.tex", output);

};