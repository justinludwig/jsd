/**
 * @file test/jsd_test.js Test jsd functionality.
 */

var TestParse = new Utl.TestSuite();
Utl.TestAll.add("TestParse", TestParse);

var TestModel = new Utl.TestSuite();
Utl.TestAll.add("TestModel", TestModel);

var TestPrint = new Utl.TestSuite();
Utl.TestAll.add("TestPrint", TestPrint);

function testParseSimple() {
    Utl.assert(Utl.equals([], new JSD().parse()), "test parse null input");
    Utl.assert(Utl.equals([], new JSD().parse("")), "test parse empty input");
    Utl.assert(Utl.equals([], new JSD().parse("/* nada */ foo // bar \n /* * */ baz /* nix */")), "test parse no javadoc");
    Utl.assert(Utl.equals([new JSD.Tag("file", "foo.js", "My file."), new JSD.Tag("function", "foo", "My fn.", ["x", "y", "z.z-z"]), new JSD.Tag("param", "o", "My param."), new JSD.Tag("var", "v", "My var.")], new JSD().parse("/** @file foo.js My file. */ /** My fn. @function {x y z.z-z} foo @param o My param. */ function foo(o) {} /** @var v My var. */ var v;")), "test parse simple");
    Utl.assert(Utl.equals([new JSD.Tag("function", "foo", "My foo.")], new JSD().parse("/***\n *** @function foo\n *** My foo.\n ***/")), "test parse extra asterixes");
    Utl.assert(Utl.equals([new JSD.Tag("function", "foo", "My {@link Foo} for {@link Bar}.")], new JSD().parse("/** @function foo My {@link Foo} for {@link Bar}. */")), "test parse with inner tags");
}
TestParse.add("testParseSimple", testParseSimple);

function testHierarchicalModeler() {
    var jsd = { tags: [
        new JSD.Tag("class", "Foo"),
        new JSD.Tag("function", "f"),
        new JSD.Tag("param", "x"),
        new JSD.Tag("param", "y"),
        new JSD.Tag("property", "p"),
        new JSD.Tag("class", "Bar"),
        new JSD.Tag("function", "g"),
        new JSD.Tag("param", "a"),
        new JSD.Tag("param", "b"),
        new JSD.Tag("event", "e"),
        new JSD.Tag("param", "ex"),
        new JSD.Tag("param", "ey")
    ] };
    var oldChildToParents = JSD.hierarchicalModeler.childToParents;
    JSD.hierarchicalModeler.childToParents = {
        "function": ["class"],
        property: ["class"],
        event: ["class"],
        param: ["function", "event"]
    };
    JSD.hierarchicalModeler.call(jsd, jsd);
    JSD.hierarchicalModeler.childToParents = oldChildToParents;

    Utl.assert(jsd.tags[0].functions, "test hierarchical modeler Foo functions");
    Utl.assert(Utl.equals(1, jsd.tags[0].functions.length), "test hierarchical modeler functions length");
    Utl.assert(Utl.equals("f", jsd.tags[0].functions[0].value), "test hierarchical modeler Foo.f");
    Utl.assert(jsd.tags[0].properties, "test hierarchical modeler Foo properties");
    Utl.assert(Utl.equals(1, jsd.tags[0].properties.length), "test hierarchical modeler Foo properties length");
    Utl.assert(Utl.equals("p", jsd.tags[0].properties[0].value), "test hierarchical modeler Foo.p");
    Utl.assert(jsd.tags[1].params, "test hierarchical modeler Foo.f params");
    Utl.assert(Utl.equals(2, jsd.tags[1].params.length), "test hierarchical modeler Foo.f params length");
    Utl.assert(Utl.equals("x", jsd.tags[1].params[0].value), "test hierarchical modeler Foo.f.x");
    Utl.assert(Utl.equals("y", jsd.tags[1].params[1].value), "test hierarchical modeler Foo.f.y");
    Utl.assert(jsd.tags[5].functions, "test hierarchical modeler Bar functions");
    Utl.assert(Utl.equals(1, jsd.tags[5].functions.length), "test hierarchical modeler Bar functions length");
    Utl.assert(Utl.equals("g", jsd.tags[5].functions[0].value), "test hierarchical modeler Bar.g");
    Utl.assert(jsd.tags[5].events, "test hierarchical modeler Bar events");
    Utl.assert(Utl.equals(1, jsd.tags[5].events.length), "test hierarchical modeler Bar events length");
    Utl.assert(Utl.equals("e", jsd.tags[5].events[0].value), "test hierarchical modeler Bar.e");
    Utl.assert(jsd.tags[6].params, "test hierarchical modeler Bar.g params");
    Utl.assert(Utl.equals(2, jsd.tags[6].params.length), "test hierarchical modeler Bar.g params length");
    Utl.assert(Utl.equals("a", jsd.tags[6].params[0].value), "test hierarchical modeler Bar.g.a");
    Utl.assert(Utl.equals("b", jsd.tags[6].params[1].value), "test hierarchical modeler Bar.g.b");
    Utl.assert(jsd.tags[9].params, "test hierarchical modeler Bar.e params");
    Utl.assert(Utl.equals(2, jsd.tags[9].params.length), "test hierarchical modeler Bar.e params length");
    Utl.assert(Utl.equals("ex", jsd.tags[9].params[0].value), "test hierarchical modeler Bar.e.ex");
    Utl.assert(Utl.equals("ey", jsd.tags[9].params[1].value), "test hierarchical modeler Bar.e.ey");
}
TestModel.add("testHierarchicalModeler", testHierarchicalModeler);
