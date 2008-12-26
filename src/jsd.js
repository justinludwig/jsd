/**
 * @file jsd.sh Main jsd code.
 */

/**
 * @class JSD
 * Main jsd class.
 */
function JSD() {
    return this;
}

/**
 * @function {static} log
 * Logs a message at the optional level for the optional category.
 * @param {string} msg Message to log.
 * @param {optional string} level Level at which to log (ie "DEBUG" etc).
 * @param {optional string} cat Category for which to log.
 */
JSD.log = function(msg, level, cat) {
    var s = (cat ? cat + ": " : "") + (level ? "(" + level + ") " : "") + String(msg);
    if (typeof print != "undefined")
        print(s);
    else if (typeof alert != "undefined")
        alert(s);
}

/**
 * @function {static boolean} equals
 * Returns true if two objects are equal.
 * @param x First object.
 * @param y Second object.
 * @return True if both objects are equal.
 */
JSD.equals = function(x, y) {
    if (x == y)
        return true;
    if (x == null || y == null)
        return false;

    // done if x or y is primitive
    function type(a) {
        var t = typeof a;
        return (t == "function" || t == "object")
    }
    if (!type(x) || !type(y))
        return false;
    
    // use custom equals fn
    if (x.equals)
        return x.equals(y);
    if (y.equals)
        return y.equals(x);

    // recurse into complex object
    function recurse(a, b) {
        for (var i in a) {
            //JSD.log("equals " + i + ": " + a[i] + "=" + b[i]);
            if (!JSD.equals(a[i], b[i]))
                return false;
        }
        return true;
    }
    return recurse(x, y) && recurse(y, x);
}

/**
 * @function {static string} dump
 * Dumps out specified object.
 * @param o Object to dump.
 * @param {int} tabs Tab depth.
 * @return Dumped object.
 */
JSD.dump = function(o, tabs) {
    tabs = tabs || 0;
    
    if (o == null || (typeof o != "function" && typeof o != "object"))
        return String(o);

    var a = [];
    function tab() { for (var i = 0; i < tabs; i++) a.push("\t"); }

    a.push("{");
    tabs++;
    for (var i in o) {
        a.push("\n");
        tab();
        a.push(i);
        a.push(": ");
        a.push(JSD.dump(o[i], tabs));
    }
    a.push("\n");
    tabs--;
    tab();
    a.push("}");

    return a.join("");
}

/**
 * @function {static string[string]} mapArgs
 * Maps dash cmd-line args (ie --foo) to their values.
 * For example maps ["-f", "x", "-bar", "--foo", "y"]
 * to { f: "x", bar: "", foo: "y" }.
 * @param {string[]} a Arguments array.
 * @return Map of arguments.
 */
JSD.mapArgs = function(a) {
    var m = {};
    for (var i = 0; i < a.length; i++)
        if (/^-+/.test(a[i]))
            m[a[i].replace(/^-+/, "")] = (!/^-+/.test(a[i+r1i]) ? a[i+1] : "");
    return m;
}

/**
 * @function {static string} trim
 * Trims the leading and trailing whitespace from a string.
 * @param {string} s String to trim.
 * @return Trimmed string.
 */
JSD.trim = function(s) {
    return (s ? s.replace(/^\s+|\s+$/g, "") : "");
}

/**
 * @function {static} assert
 * Throws an error if the specfied value is falsey.
 * @param {boolean} value Value to test.
 * @param {optional string} msg Message to display if falsey.
 */
JSD.assert = function(expr, msg) {
    if (!expr)
        throw new Error(msg || "assertion failed");
}

/**
 * @class JSD.TestSuite
 * A group of tests.
 * Each test is either a function or another TestSuite.
 */
JSD.TestSuite = function(name) {
    this.tests = {};
    return this;
}

/**
 * @function add Add a new test to this suite.
 * @param {string} name Test name.
 * @param test Function or other {@link TestSuite}.
 */
JSD.TestSuite.prototype.add = function(name, test) {
    this.tests[name] = test;
}

/**
 * @function run Runs this suite.
 */
JSD.TestSuite.prototype.run = function() {
    for (var i in this.tests) {
        JSD.log("running " + i + "...", "INFO", "test");
        var test = this.tests[i];
        if (test.run)
            test.run();
        else
            test();
    }
}

/** @scope JSD */

/**
 * @function {string} run
 * Runs jsd.
 * @param {string} s Input text.
 * @return Output text.
 */
JSD.prototype.run = function(s) {
    this.parse(s);
    this.model();
    return this.print();
}

JSD.prototype.parse = function(s) {
    this.input = s || this.input || "";
    this.tags = this.tags || [];

    for (var re = /\/\*\*([^\v]+?)\*\//g, a; a = re.exec(s);) {
        var comment = a[1];
        // strip leading and trailing asterixes
        comment = comment.replace(/^\*+|\*+$/g, "");
        // strip line-starting asterixes
        comment = comment.replace(/\s*\*+\s*/g, " ");
        this.parseComment(comment);
    }
    
    //JSD.log(JSD.dump(this.tags));
    return this.tags;
}

// parse special inner tags (ie {@link Foo})
JSD.prototype.parseInnerComment = function(s) {
    for (var re = /\{@([^\s}]+)\s*([^\s}]*)([^}]*)}/g, a; a = re.exec(s);) {
        var name = a[1];
        var value = a[2];
        var text = JSD.trim(a[3]);
    }
}

JSD.prototype.parseComment = function(s) {
    s = s || "";

    // temporarily remove inner tags (ie {@link Foo})
    s = s.replace(/\{@/g, "{#");

    for (var re = /([^\@]+?\s)?@([^\s@]+)\s*(?:\{([^\}]*)\}\s*)?([^\s@]*)([^@]*)/g, a; a = re.exec(s);) {
        var text0 = JSD.trim(a[1]);
        var name = a[2];
        var modifiers = JSD.trim(a[3]);
        var value = a[4];
        var text1 = JSD.trim(a[5]);

        // combine leading and following text
        var text = text0;
        if (text1) {
            if (text)
                text = text + " " + text1;
            else
                text = text1;
        }
        text = text.replace(/\{#/g, "{@");

        this.tags.push(new JSD.Tag(name, value, text, modifiers ? modifiers.split(/\s+/) : []));
    }
}

JSD.prototype.model = function(modelers) {
    this.modelers = modelers || this.modelers || [];
    for (var i = 0, m; m = this.modelers[i]; i++)
        m();
    return this;
}

JSD.prototype.print = function() {
    this.output = JSD.dump(this);
    return this.output;
}

/**
 * @class JSD.Tag
 * Represents a javadoc tag.
 */
JSD.Tag = function(name, value, text, modifiers) {
    this.name = name || "";
    this.value = value || "";
    this.text = text || "";
    this.modifiers = modifiers || [];
    return this;
}


