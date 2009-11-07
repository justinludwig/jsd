/**
 * @file default.conf
 * This is the default jsd config file.
 * It is itself a javascript file.
 */

// .jst template directory
JSD.template = "template/default";
// .jst template extensions
JSD.templateType = ".jst";
// src extensions
JSD.srcType = ".js";
// extensions of files in template directory to ignore
JSD.ignoreType = ".svn ~ .swp .DS_Store";

// array of functions to execute on model
JSD.modelers = [
    JSD.synonymModeler, // replace synonyms with canonical name
    JSD.emptyFileModeler, // clean up empty file tags
    JSD.hierarchicalModeler, // add child arrays to parent tags
    JSD.endNamespaceModeler, // clean up "end" tags
    JSD.nameModeler, // replace parent's value with "name" tag
    JSD.descriptionModeler, // merge "description" tags into parent's text
    JSD.topLevelModeler, // add top-level arrays for top-level tags
    JSD.nsModeler, // create map of ns (namespace) tags
    JSD.nsModeler.disjointModeler, // add child arrays to parent tags based on namespaces
    JSD.nsModeler.topModeler, // create list of top-level ns tags
    JSD.nsModeler.containersModeler, // create list of ns tags which contain other top-level tags
    JSD.nsModeler.globalsModeler, // include pseudo "globals" tag in ns.all, ns.top, and ns.containers
    JSD.ohModeler, // create graph of object-hierarchy (based on "extends", etc)
    JSD.projectModeler // creates master "project" jsd property
];

// map of tag names to replacement-names
JSD.synonymModeler.tagToReplacement = {
    scope: "namespace",
    "var": "property"
};

// array of tags to add to the top-level
JSD.topLevelModeler.topLevelTags = [
    "class",
    "end",
    "event",
    "file",
    "function",
    "ifunction",
    "interface",
    "module",
    "namespace",
    "project",
    "property",
    "struct"
];

// array of namespace-able tags
JSD.nsModeler.namespaceTags = [
    "class",
    "event",
    "function",
    "ifunction",
    "interface",
    "module",
    "namespace",
    "property",
    "struct"
];

// special globals namespace
JSD.nsModeler.globalsModeler.tag = new JSD.Tag("namespace", "Globals", "Global varibles and functions.");

JSD.hierarchicalModeler._myabbr = {
    classes: ["class", "end", "interface", "namespace"]
};

// map of child tag names to possible parent tag names
JSD.hierarchicalModeler.childToParents = {
    "...": ["param"],
    author: JSD.topLevelModeler.topLevelTags,
    constructor: ["class"],
    description: JSD.topLevelModeler.topLevelTags,
    deprecated: JSD.nsModeler.namespaceTags,
    event: JSD.hierarchicalModeler._myabbr.classes,
    "extends": ["class", "function", "ifunction", "interface", "struct"],
    "function": JSD.hierarchicalModeler._myabbr.classes,
    ifunction: JSD.hierarchicalModeler._myabbr.classes,
    "implements": ["ifunction", "interface"],
    inheritdesc: ["class", "event", "function", "ifunction", "interface", "property", "struct"],
    name: JSD.topLevelModeler.topLevelTags,
    paramset: ["constructor", "event", "function", "ifunction"],
    param: ["constructor", "event", "function", "ifunction", "paramset"],
    property: ["class", "end", "interface", "namespace", "struct"],
    requires: ["module"],
    "return": ["function", "ifunction"],
    see: JSD.topLevelModeler.topLevelTags,
    since: JSD.topLevelModeler.topLevelTags,
    struct: JSD.hierarchicalModeler._myabbr.classes,
    "throws": ["function", "ifunction"],
    timestamp: ["file", "project"],
    version: ["file", "project"]
};

// default project tag
JSD.projectModeler.tag = new JSD.Tag("project", "JS Docs");

// map of child relation to parent relation
JSD.ohModeler.relations = {
    "extends": "extendedBy",
    "implements": "implementedBy"
};
