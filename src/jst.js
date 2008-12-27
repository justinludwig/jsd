/**
 * @file jst.sh Templating code.
 */

/**
 * @class JST
 * Main templating class.
 */
function JST(o) {
    // copy properties from o
    if (o)
        for (var i in o)
            this[i] = o[i];
    
    return this;
}

JST.directors = {};

JST.prototype.run = function(s, args) {
    // reset template
    if (s) {
        this.template = s;
        delete this.fn;
    }
    
    // rebuild function
    if (!this.fn)
        this.fn = this.build(this.template, args);
    
    // execute function
    return this.execute(args);
}

JST.prototype.execute = function(args) {
    return this.executeAs(this, args);
}

JST.prototype.executeAs = function(o, args) {
    o = o || this;
    args = args || [];

    // extract property values from map
    if (args.constructor != Array)
        args = Utl.propertyValues(args);

    return this.fn.apply(o, args);
}

JST.prototype.build = function(s, args) {
    this.template = s || this.template;
    
    // extract property names from map
    if (args && args.constructor != Array)
        args = Utl.propertyNames(args);
    this.args = args || this.args;

    // build function
    this.fn = eval(this.wrap(this.parse(this.template), this.args));
    return this.fn;
}

JST.prototype.wrap = function(s, args) {
    var a = [];
    a.push("(function(");
    if (args)
        for (var i = 0; i < args.length; i++) {
            if (i > 0) a.push(",");
            a.push(args[i]);
        }
    a.push("){\nvar __a=[];\nfunction out(x){__a.push(String(x));}\n");
    a.push(s || "");
    a.push("\nreturn __a.join(\"\");\n})");
    return a.join("");
}

JST.prototype.parse = function(s) {
    s = s || "";
    // strip comments
    s = s.replace(/<%--[^\v]*?--%>/g, "");

    // skip empty string (causes infinite loop in re)
    if (!s) return "";
    
    var directors = this.directors || JST.directors;
    var a = [], lastIndex = 0, type = "";
    // parse <%x %> tags
    for (var re = /(?:^|%>)([^\v]*?)(?:<%([@!=]?)|$)/g, r; r = re.exec(s);) {
        // tag content
        var js = Utl.trim(s.substring(lastIndex, r.index));

        // handle tag end
        switch (type) {
            case "=": a.push(js); a.push(");"); break;
            case "@": a.push(this.parseDirective(js)); break;
            default: a.push(js); break;
        }

        // print literal content (outside of tags)
        a.push("\nout(\"");
        a.push(Utl.escapeJS(r[1]));
        a.push("\");\n");

        // index of next tag content start
        lastIndex = r.index + r[0].length;
        // type of next tag
        type = r[2] || "";

        // handle tag start
        switch (type) {
            case "=": a.push("out("); break;
        }
    }

    this.code = a.join("");
    // strip empty out() statements
    this.code = this.code.replace(/out\(("")?\);\n/g, "");
    //Utl.log(Utl.dump(this.code));
    return this.code;
}

JST.prototype.parseDirective = function(s) {
    var directors = this.directors || JST.directors;

    // find directive handler
    var directive = String(s.match(/\w+/));
    var director = directors[directive];
    if (!director)
        return "";

    // build directive attribute map
    var attrs = {};
    for (var re = /(\w+)\s*=\s*["']([^"']*)['"]/g, r; r = re.exec(s);)
        attrs[r[1]] = r[2];

    // invoke directive handler
    return director(directive, attrs);
}
