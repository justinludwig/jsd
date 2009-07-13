/**
 * @file utl.js Generic utilites.
 */

/**
 * @namespace Utl
 */
var Utl = {

/**
 * @function {string} trim
 * Trims the leading and trailing whitespace from a string.
 * @param {string} s String to trim.
 * @return Trimmed string.
 */
trim: function(s) {
    return (s ? s.replace(/^\s+|\s+$/g, "") : "");
},

/**
 * @function {string} escapeJS
 * Escapes javascript string content.
 * @param {string} s String to escape.
 * @return Escaped string.
 */
escapeJS: function(s) {
    return s.replace(/([\\'"])/g, "\\$1").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
},

/**
 * @function {boolean} equals
 * Returns true if two objects are equal.
 * @param x First object.
 * @param y Second object.
 * @return True if both objects are equal.
 */
equals: function(x, y) {
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
            //Utl.log("equals " + i + ": " + a[i] + "=" + b[i]);
            if (!Utl.equals(a[i], b[i]))
                return false;
        }
        return true;
    }
    return recurse(x, y) && recurse(y, x);
},

/**
 * @function log
 * Logs a message at the optional level for the optional category.
 * @param {string} msg Message to log.
 * @param {optional string} level Level at which to log (ie "DEBUG" etc).
 * @param {optional string} cat Category for which to log.
 */
log: function(msg, level, cat) {
    var s = (cat ? cat + ": " : "") + (level ? "(" + level + ") " : "") + String(msg);
    if (typeof print != "undefined")
        print(s);
    else if (typeof alert != "undefined")
        alert(s);
},

/**
 * @function {string} dump
 * Dumps out specified object.
 * @param o Object to dump.
 * @param {int} tabs Tab depth.
 * @return Dumped object.
 */
dump: function(o, tabs) {
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
        a.push(Utl.dump(o[i], tabs));
    }
    a.push("\n");
    tabs--;
    tab();
    a.push("}");

    return a.join("");
},

/**
 * @function {string[]} propertyNames
 * Returns array of the property names for object o.
 * @param o Object for which to list property names.
 * @return Array of property names.
 */
propertyNames: function(o) {
    var a = [];
    if (o)
        for (var i in o)
            a.push(i);
    return a;
},

/**
 * @function {object[]} propertyValues
 * Returns array of the property values for object o.
 * @param o Object for which to list property values.
 * @return Array of property values.
 */
propertyValues: function(o) {
    var a = [];
    if (o)
        for (var i in o)
            a.push(o[i]);
    return a;
},

/**
 * @function addToArrayProperty
 * Adds (or creates and adds) the specified value
 * to the array with the specified name.
 * @param o Object to which to add.
 * @param {string} name Array property name.
 * @param value Value to add to array.
 * @param {optional boolean} True to pluralize array property name.
 */
addToArrayProperty: function(o, name, value, pluralize) {
    if (pluralize)
        name = Utl.pluralize(name);
        
    if (!o[name])
        o[name] = [];
    o[name].push(value);
},

/**
 * @function {string[string]} mapArgs
 * Maps dash cmd-line args (ie --foo) to their values.
 * For example maps ["-f", "x", "-bar", "--foo", "y"]
 * to { f: "x", bar: "", foo: "y" }.
 * @param {string[]} a Arguments array.
 * @return Map of arguments.
 */
mapArgs: function(a) {
    var m = {};
    for (var i = 0; i < a.length; i++)
        if (/^-+/.test(a[i]))
            m[a[i].replace(/^-+/, "")] = (!/^-+/.test(a[i+r1i]) ? a[i+1] : "");
    return m;
},

/**
 * @function {string[string]) splitIntoFiles
 * Splits string marked with file delimiters
 * into map of file names to file content.
 * @param {string} s String to split.
 * @return Map of file names to file content.
 */
splitIntoFiles: function(s) {
    var o = {};
    for (var re = /={10}([^=]+)={10}([^\v]*?)(?=={10}|$)/g, r; r = re.exec(s);)
        o[Utl.trim(r[1])] = Utl.trim(r[2]);
    return o;
},

/**
 * @function {string} pluralize
 * Converts word to plural.
 * @param {string} s Word to pluralize.
 * @return Plural word.
 */
pluralize: function(s) {
    if (!s) return "";

    var sc = Utl.pluralize.specialCases || {};
    var r = sc[s];
    if (r) return r;

    var a = s.match(/(.*?)y$/);
    if (a)
        return a[1] + "ies";

    if (/s$/.test(s))
        return s + "es";

    return s + "s";
},

/**
 * @function assert
 * Throws an error if the specfied value is falsey.
 * @param {boolean} expr Value to test.
 * @param {optional string} msg Message to display if falsey.
 */
assert: function(expr, msg) {
    if (expr) return;

    msg = msg || "assertion failed";
    Utl.log(Utl.dump(expr), "DEBUG", "assert");
    throw new Error(msg);
},

/**
 * @function assertEquals
 * Throws an error if two objects are not equal.
 * @param x First object .
 * @param y Second object .
 * @param {optional string} msg Message to display if not equal.
 */
assertEquals: function(x, y, msg) {
    if (Utl.equals(x, y)) return;

    msg = msg || "equals assertion failed";
    Utl.log(Utl.dump(x), "DEBUG", "assert");
    Utl.log(Utl.dump(y), "DEBUG", "assert");
    throw new Error(msg);
}
} /** @end Utl */

/**
 * @class Utl.TestSuite
 * A group of tests.
 * Each test is either a function or another TestSuite.
 */
Utl.TestSuite = function(name) {
    this.tests = {};
    return this;
}

/**
 * @function add Add a new test to this suite.
 * @param {string} name Test name.
 * @param test Function or other {@link TestSuite}.
 */
Utl.TestSuite.prototype.add = function(name, test) {
    this.tests[name] = test;
}

/**
 * @function run Runs this suite.
 */
Utl.TestSuite.prototype.run = function() {
    for (var i in this.tests) {
        Utl.log("running " + i + "...", "INFO", "test");
        var test = this.tests[i];
        if (test.run)
            test.run();
        else
            test();
    }
}

/** @scope */

/**
 * @var {Utl.TestSuite} TestAll All tests.
 */
Utl.TestAll = new Utl.TestSuite();
