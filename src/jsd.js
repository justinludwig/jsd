/**
 * @file jsd.sh Main jsd code.
 */

/**
 * @class JSD
 * Main jsd class.
 */
function JSD(o) {
    // copy properties from o
    if (o)
        for (var i in o)
            this[i] = o[i];

    return this;
}

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

    for (var re = /\/\*\*([^\v]+?)\*\/([^\v]*?)(?=\/\*\*|$)/g, a; a = re.exec(this.input);) {
        var comment = a[1];
        // strip leading and trailing asterixes
        comment = comment.replace(/^\*+|\*+$/g, "");
        // strip line-starting asterixes
        comment = comment.replace(/\s*\*+\s*/g, " ");

        var context = a[2] || "";
        // strip c-style comments
        context = context.replace(/\/\/.*/g, "");
        // strip c++-style comments
        context = context.replace(/\/\*([^\/]*?)\*\//g, "");
        // strip leading and trailing whitespace
        context = context.replace(/^\s*|\s*$/g, "");

        this.parseComment(comment, context);
    }
    
    //Utl.log(Utl.dump(this.tags));
    return this.tags;
}

JSD.INNER_COMMENT = /\{@([^\s}]+)\s*([^\s}]*)([^}]*)}/g;

// parse special inner tags (ie {@link Foo})
JSD.prototype.parseInnerComment = function(s) {
    var inner = [];
    for (var re = JSD.INNER_COMMENT, a; a = re.exec(s);)
        inner.push(new JSD.Tag(a[1], a[2], Utl.trim(a[3])));
    return inner;
}

JSD.prototype.parseComment = function(s, context) {
    s = s || "";

    // temporarily remove inner tags (ie {@link Foo})
    s = s.replace(/\{@/g, "{#");

    for (var re = /([^\@]+?\s)?@([^\s@]+)\s*(?:\{([^\}]*)\}\s*)?([^\s@]*)([^@]*)/g, a; a = re.exec(s);) {
        var text0 = Utl.trim(a[1]);
        var name = a[2];
        var modifiers = Utl.trim(a[3]);
        modifiers = modifiers ? modifiers.split(/\s+/) : [];
        var value = a[4];
        var text1 = Utl.trim(a[5]);

        // combine leading and following text, adding back inner tags
        var text = Utl.trim(text0 + " " + text1).replace(/\{#/g, "{@");

        this.tags.push(new JSD.Tag(name, value, text, modifiers, context));
        // context applies only to first tag
        context = "";
    }
}

JSD.prototype.model = function(modelers) {
    this.modelers = modelers || this.modelers || [];
    for (var i = 0, m; m = this.modelers[i]; i++) {
        m.call(this, this);
    }
    return this;
}

JSD.prototype.print = function() {
    this.output = Utl.dump(this);
    return this.output;
}

JSD.prototype.urlTo = function(name, tag, base) {
    if (!name) return "";
    name = name.replace(/#/g, ".");

    // find tag this name represents
    var ns = this.ns.map[name];
    if (!ns) {
        if (!tag) return "";
        var prefix = tag.value;

        // calculate name if name is relative to tag
        while (true) {
            var prefixedName = prefix + "." + name;
            ns = this.ns.map[prefixedName];
            if (ns)
                break;

            // try next tag ancestor
            prefix = prefix.replace(/\.?[^.]*$/, "");
            if (!prefix)
                return "";
        }
        name = prefixedName;
    }

    // if not a container, url is to parent document + hash
    var hash = "";
    if (!this.ns.isContainer(name)) {
        hash = "#" + name.replace(/.*\./, "");
        name = name.replace(/\.[^.]*$/, "");
    }
    
    var url = name.replace(/\./, "/") + ".html" + hash;
    return (base ? Utl.relUrl(base, url) : url);
}

JSD.prototype.linkTo = function(name, tag, base) {
    var url = this.urlTo(name, tag, base);
    if (!url) return name || "";

    return ["<a href=\"", url, "\">", name, "</a>"].join("");
}

JSD.prototype.replaceLinks = function(text, tag, base) {
    if (!text) return "";
    var m = this;

    return text.replace(JSD.INNER_COMMENT, function(s, name, value, text) {
        return (name == "link" ? m.linkTo(value, tag, base) : s);
    });
}

/**
 * @class JSD.Tag
 * Represents a javadoc tag.
 */
JSD.Tag = function(name, value, text, modifiers, context) {
    this.name = (name || "").toLowerCase();
    this.value = value || "";
    this.text = text || "";
    this.modifiers = modifiers || [];
    this.context = context || "";
    return this;
}

/**
 * @function {JSD.Tag[]} sortByValue Sorts the specified list of tags.
 * @param {JSD.Tag[]} list List of tags to sort.
 * @return List of sorted tags.
 */
JSD.Tag.sortByValue = function(list) {
    list.sort(function(x, y) {
        var xvalue = x.value || "", yvalue = y.value || "";
        if (xvalue < yvalue) return -1;
        if (xvalue > yvalue) return 1;
        return 0;
    });
    return list;
}

/** @end JSD.Tag */

/**
 * @class JSD.TemplateDriven
 * Template-driven class jsd.
 */
JSD.TemplateDriven = function(o) {
    var jsd = new JSD(o);
    for (var i in jsd)
        if (!this[i])
            this[i] = jsd[i];
    return this;
}

JSD.TemplateDriven.prototype.print = function(s) {
    this.template = s || this.template;
    return new JST().run(this.template, { jsd: this });
}

/** @scope JSD */

/**
 * @function hierarchicalModeler
 * Modeler which popuplates "parent" tags
 * with an array of their "children",
 * based on the childToParents conf setting.
 */
JSD.hierarchicalModeler = function() {
    var map = JSD.hierarchicalModeler.childToParents;
    if (!map) return;

    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++) {
        var parents = map[tag.name];
        if (parents)
            for (var j = i - 1; j >= 0; j--) {
                var parent = tags[j];
                if (parents.indexOf(parent.name) != -1) {
                    //Utl.log(tag.name + ": " +  tag.value + ", parent " + parent.name + ": " + parent.value);
                    // add child to foos array in parent tag
                    Utl.addToArrayProperty(parent, tag.name, tag, true);
                    break;
                }
            }
    }
}

/**
 * @function topLevelModeler
 * Modeler which populates arrays of top-level tags
 * in the main jsd object,
 * based on the topLevelTags conf setting.
 */
JSD.topLevelModeler = function() {
    var list = JSD.topLevelModeler.topLevelTags;
    if (!list) return;

    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++)
        if (list.indexOf(tag.name) != -1)
            Utl.addToArrayProperty(this, tag.name, tag, true);
}

/**
 * @function synonymModeler
 * Modeler which replaces tag names with their synonyms,
 * based on the tagToReplacement conf setting.
 */
JSD.synonymModeler = function() {
    var map = JSD.synonymModeler.tagToReplacement;
    if (!map) return;

    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++) {
        var replacement = map[tag.name];
        // skip native Object functions like constructor
        if (typeof replacement == "string")
            tag.name = replacement;
    }
}

/**
 * @function endNamespaceModeler
 * Modeler which clears out any extra "end" tag data
 * (so as to make it work like a global "scope" tag).
 */
JSD.endNamespaceModeler = function() {
    if (!this.ends) return;

    for (var i = 0, tag, tags = this.ends; tag = tags[i]; i++) {
        tag.value = "";
        tag.text = "";
        tag.modifiers = [];
    }
}

JSD.nsModeler = function() {
    var names = JSD.nsModeler.namespaceTags;
    if (!names) return;

    var nameslength = names.length;
    var tags = this.tags;

    // list including each namespace tag object
    var list = [];
    for (var i = 0, tag; tag = tags[i]; i++)
        // skip non-namespaces and global namespace
        if (tag.value && names.indexOf(tag.name) != -1) {
            list.push(tag);

            // prefix child namespaces
            for (var j = 0; j < nameslength; j++) {
                var children = tag[Utl.pluralize(names[j])];
                if (children)
                    for (var k = 0, child; child = children[k]; k++)
                        child.value = tag.value + "." + child.value;
            }
        }
    
    // create map of all namespaces; each value is a tag or array of tags
    var map = {};
    for (var i = 0, tag; tag = list[i]; i++) {
        var v = tag.value;
        var existing = map[v];

        if (!existing)
            map[v] = tag;
        else if (existing.constructor == Array)
            existing.push(tag);
        else
            map[v] = [existing, tag];
    }

    // combine arrays into single object, replacing references to each
    var remap = [];
    for (var i in map) {
        var multi = map[i];
        if (multi.constructor != Array) continue;

        // replace array with combined object
        var merged = Utl.merge(multi);
        // remove extra namespace/scope decls from tag name
        merged.name = merged.name.replace(/ namespace|namespace /g, "");
        map[i] = merged;

        // save originals to remap
        for (var j = 0, tag; tag = multi[j]; j++)
            remap.push({ original: tag, merged: merged });
    }

    // merge remapped tags in the specified tags list
    function merge(tags) {
        if (!tags) return;
        for (var i = 0, tag, inTags = []; tag = tags[i]; i++)
            for (var m = 0, remapped; remapped = remap[m]; m++)
                if (remapped.original == tag) {
                    // replace first original with merged
                    if (inTags.indexOf(remapped.merged) == -1) {
                        inTags.push(remapped.merged);
                        tags[i] = remapped.merged;
                    // remove other originials
                    } else {
                        tags.splice(i--, 1);
                    }
                }
    }

    // remap global tags list from multi-tags to merged tag
    merge(tags);

    // remap each tag's child lists from multi-tags to merged tag
    for (var i = 0, tag; tag = tags[i]; i++)
        for (var j = 0; j < nameslength; j++)
            merge(tag[Utl.pluralize(names[j])]);

    // create ns property
    this.ns = {
        map: map
    };
}

JSD.nsModeler.sortedModeler = function(jsd) {
    var map = this.ns.map;

    // create list of all namespaces
    var list = [];
    for (var i in map)
        list.push(map[i]);
        
    this.ns.sorted = JSD.Tag.sortByValue(list);
}

JSD.nsModeler.topModeler = function() {
    var map = this.ns.map;

    // create list of top-level namespaces
    var list = [];
    for (var i in map) {
        var tag = map[i];
        if (!/\./.test(tag.value))
            list.push(tag);
    }
        
    this.ns.top = JSD.Tag.sortByValue(list);
}

JSD.nsModeler.containersModeler = function(jsd) {
    var map = this.ns.map;
    var names = JSD.nsModeler.namespaceTags;

    // create list of namespaces with child namespaces
    var list = [];
    for (var i in map) {
        var tag = map[i];
        for (var j = 0, name; name = names[j]; j++) {
            var children = tag[Utl.pluralize(name)];
            if (children) {
                list.push(tag);
                break;
            }
        }
    }
        
    this.ns.containers = JSD.Tag.sortByValue(list);
    this.ns.isContainer = JSD.nsModeler.isContainer;
}

JSD.nsModeler.isContainer = function(name) {
    if (!name) return false;

    // if passed tag
    if (name.name)
        return this.containers.indexOf(name) != -1;

    // if passed name
    for (var i = 0, tag; tag = this.containers[i]; i++)
        if (tag.value == name)
            return true;

    return false;
}

/**
 * @function disjointNamespacesModeler
 * Modeler which connects parents to children based on namespaces
 * (ex adds Foo.Bar as child of Foo).
 */
JSD.nsModeler.disjointModeler = function() {
    var names = JSD.nsModeler.namespaceTags;
    if (!names) return;

    var tags = this.tags;
    var map = this.ns.map;

    for (var i = 0, tag; tag = tags[i]; i++) {
        // skip non-namespace tags
        if (names.indexOf(tag.name) == -1) continue;

        // calc parent name by stripping last segment from tag value
        var prefix = tag.value.replace(/\.?[^.]*$/, "");
        var parent = map[prefix];
        if (!parent) continue;

        // attach child to parent
        var plural = Utl.pluralize(tag.name);
        var children = parent[plural];
        if (children) {
            // check if parent already contains child
            if (children.indexOf(tag) == -1)
                children.push(tag);
        } else {
            parent[plural] = [tag];
        }
    }
}

JSD.nsModeler.globalsModeler = function() {
    var top = this.ns.top;
    var containers = this.ns.containers;
    var globals = this.ns.globals = JSD.nsModeler.globalsModeler.tag;

    // allow output to skip globals if empty
    globals.empty = true;

    for (var i = 0, tag; tag = top[i]; i++)
        if (containers.indexOf(tag) == -1) {
            var plural = Utl.pluralize(tag.name);
            var a = globals[plural];

            if (a)
                a.push(tag);
            else
                globals[plural] = [tag];

            // clear empty flag
            globals.empty = false;
        }

    // add "globals" tag to ns data
    if (!globals.empty) {
        top.unshift(globals);
        containers.unshift(globals);
        this.ns.map[globals.value] = globals;
    }
}

/**
 * @function projectModeler
 * Modeler which merges multiple project declarations
 * and the default project ({@link JSD.defaultProject})
 * into the <code>project</code> property of the main jsd object.
 */
JSD.projectModeler = function() {
    this.project = Utl.merge((this.projects || []).concat(JSD.projectModeler.tag));
}

// object hierarchy
JSD.ohModeler = function() {
    var relations = JSD.ohModeler.relations;
    if (!relations) return;

    var map = this.ns.map;
    var graph = {};

    // adds tag (and optionally other tag) to graph
    // @param {JSD.Tag} tag This tag.
    // @param {optional JSD.Tag} other Other tag.
    // @param {optional boolean} True if tag is parent of other.
    function add(tag, other, parent) {
        var t = graph[tag.value];
        if (!t)
            t = graph[tag.value] = { sup: {}, sub: {} };

        if (!other) return t;

        var o = graph[other.value];
        if (!o)
            o = graph[other.value] = { sup: {}, sub: {} };

        t[parent ? "sub" : "sup"][other.value] = o;
        o[parent ? "sup" : "sub"][tag.value] = t;
        return t;
    }

    // checks if tag already has specified relation with other tag,
    // and if it doesn't, sets up the relation
    // @param {JSD.Tag} tag This tag.
    // @param t Graph entry for this tag (returned by add()).
    // @param {string} relation Tag's relation to other tags ("extends").
    // @param {string} reverse Reverse of relation ("extendedBy").
    // @param {boolean} True if relation is child -> parent (true for "extends", false for "extendedBy").
    function check(tag, t, relation, reverse, parent) {
        var rels = tag[Utl.pluralize(relation)];
        if (rels)
            for (var k = 0, rel; rel = rels[k]; k++) {
                var other = map[rel.value];
                if (other && !(t[parent ? "sub" : "sup"][rel.value])) {
                    // add reverse to other tag
                    Utl.addToArrayProperty(other, reverse, new JSD.Tag(reverse, tag.value, rel.text), true);
                    // add to oh list
                    add(tag, other, parent);
                }
            }
    }

    for (var i in map) {
        // add item to object-hierarchy graph
        var tag = map[i];
        var t = add(tag);

        for (var j in relations) {
            var relation = j;
            var reverse = relations[j];

            // check child -> parent relations (borrows, extends)
            check(tag, t, relation, reverse, false);
            // check parent -> child relations (lends, extendedBy)
            check(tag, t, reverse, relation, true);
        }
    }
    
    this.oh = {
        graph: graph
    };
}

/**
 * @function emptyFileModeler
 * Modeler which removes empty file tags
 * (files tags with no other tags inside).
 */
JSD.emptyFileModeler = function() {
    var count = 1; // don't automatically remove first tag
    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++)
        if (tag.name == "file") {
            if (count < 1)
                tags.splice(i-- - 1, 1); // remove prev file tag
            count = 0;
        } else {
            count++;
        }
}

/**
 * @function nameModeler
 * Modeler which replaces parent's value with value of "name" tag.
 */
JSD.nameModeler = function() {
    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++) {
        var names = tag.names;
        if (!names || !names[0]) continue;

        // replace parsed name with specified name
        tag.value = names[0];

        // remove name tags
        delete tag.names;
    }
}

/**
 * @function descriptionModeler
 * Modeler which inserts "description" tag into parent tag's "text" property.
 */
JSD.descriptionModeler = function() {
    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++) {
        var descriptions = tag.descriptions;
        if (!descriptions) continue;

        // insert descriptions into text
        for (var j = 0, desc; desc = descriptions[j]; j++)
            tag.text = [desc.value, desc.text, tag.text].join(" ");

        // remove description tags
        delete tag.descriptions;
    }
}

