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
    Utl.assertEquals([], new JSD().parse(), "test parse null input");
    Utl.assertEquals([], new JSD().parse(""), "test parse empty input");
    Utl.assertEquals([], new JSD().parse("/* nada */ foo // bar \n /* * */ baz /* nix */"), "test parse no javadoc");
    Utl.assertEquals(
        [new JSD.Tag("file", "foo.js", "My file."), new JSD.Tag("function", "foo", "My fn.", ["x", "y", "z.z-z"]), new JSD.Tag("param", "o", "My param."), new JSD.Tag("var", "v", "My var.")],
        new JSD().parse("/** @file foo.js My file. */ /** My fn. @function {x y z.z-z} foo @param o My param. */ function foo(o) {} /** @var v My var. */ var v;")
    , "test parse simple");
    Utl.assertEquals(
        [new JSD.Tag("function", "foo", "My foo.")],
        new JSD().parse("/***\n *** @function foo\n *** My foo.\n ***/")
    , "test parse extra asterixes");
    Utl.assertEquals(
        [new JSD.Tag("function", "foo", "My {@link Foo} for {@link Bar}.", [], [ new JSD.Tag("link", "Foo"), new JSD.Tag("link", "Bar") ])],
        new JSD().parse("/** @function foo My {@link Foo} for {@link Bar}. */")
    , "test parse with inner tags");
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
    Utl.assertEquals(1, jsd.tags[0].functions.length, "test hierarchical modeler functions length");
    Utl.assertEquals("f", jsd.tags[0].functions[0].value, "test hierarchical modeler Foo.f");
    Utl.assert(jsd.tags[0].properties, "test hierarchical modeler Foo properties");
    Utl.assertEquals(1, jsd.tags[0].properties.length, "test hierarchical modeler Foo properties length");
    Utl.assertEquals("p", jsd.tags[0].properties[0].value, "test hierarchical modeler Foo.p");
    Utl.assert(jsd.tags[1].params, "test hierarchical modeler Foo.f params");
    Utl.assertEquals(2, jsd.tags[1].params.length, "test hierarchical modeler Foo.f params length");
    Utl.assertEquals("x", jsd.tags[1].params[0].value, "test hierarchical modeler Foo.f.x");
    Utl.assertEquals("y", jsd.tags[1].params[1].value, "test hierarchical modeler Foo.f.y");
    Utl.assert(jsd.tags[5].functions, "test hierarchical modeler Bar functions");
    Utl.assertEquals(1, jsd.tags[5].functions.length, "test hierarchical modeler Bar functions length");
    Utl.assertEquals("g", jsd.tags[5].functions[0].value, "test hierarchical modeler Bar.g");
    Utl.assert(jsd.tags[5].events, "test hierarchical modeler Bar events");
    Utl.assertEquals(1, jsd.tags[5].events.length, "test hierarchical modeler Bar events length");
    Utl.assertEquals("e", jsd.tags[5].events[0].value, "test hierarchical modeler Bar.e");
    Utl.assert(jsd.tags[6].params, "test hierarchical modeler Bar.g params");
    Utl.assertEquals(2, jsd.tags[6].params.length, "test hierarchical modeler Bar.g params length");
    Utl.assertEquals("a", jsd.tags[6].params[0].value, "test hierarchical modeler Bar.g.a");
    Utl.assertEquals("b", jsd.tags[6].params[1].value, "test hierarchical modeler Bar.g.b");
    Utl.assert(jsd.tags[9].params, "test hierarchical modeler Bar.e params");
    Utl.assertEquals(2, jsd.tags[9].params.length, "test hierarchical modeler Bar.e params length");
    Utl.assertEquals("ex", jsd.tags[9].params[0].value, "test hierarchical modeler Bar.e.ex");
    Utl.assertEquals("ey", jsd.tags[9].params[1].value, "test hierarchical modeler Bar.e.ey");
}
TestModel.add("testHierarchicalModeler", testHierarchicalModeler);

function testLinkModeler() {
    var jsd = { tags: [
        new JSD.Tag("class", "Foo", "contains a {@link Bar}.", [], [ new JSD.Tag("link", "Bar") ]),
        new JSD.Tag("class", "Bar", "contains a {@link Foo.Foo2}.", [], [ new JSD.Tag("link", "Bar") ]),
        new JSD.Tag("class", "Foo.Foo2", "calls {@link Bar#bar()}.", [], [ new JSD.Tag("link", "Bar#bar()") ]),
    ] };
    jsd.allNamespaces = jsd.tags;

    Utl.assertEquals("Bar.html", JSD.linkModeler.calculateUrl.call(jsd, jsd.tags[0], "Bar"), "test link modeler url to Bar");
    Utl.assertEquals("Foo/Foo2.html", JSD.linkModeler.calculateUrl.call(jsd, jsd.tags[1], "Foo.Foo2"), "test link modeler url to Foo.Foo2");
    Utl.assertEquals("Bar.html#bar", JSD.linkModeler.calculateUrl.call(jsd, jsd.tags[2], "Bar#bar()"), "test link modeler url to Bar#bar");
    
    JSD.linkModeler.call(jsd, jsd);

    Utl.assertEquals("contains a <a href='Bar.html'>Bar</a>.", jsd.tags[0].text, "test link modeler link to Bar");
    Utl.assertEquals("contains a <a href='Foo/Foo2.html'>Foo.Foo2</a>.", jsd.tags[1].text, "test link modeler link to Bar");
    Utl.assertEquals("calls <a href='Bar.html#bar'>Bar#bar()</a>.", jsd.tags[2].text, "test link modeler link to Bar#bar");
}
TestModel.add("testLinkModeler", testLinkModeler);
