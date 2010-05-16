/*
Copyright (c) 2010 Justin Ludwig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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
        [new JSD.Tag("file", "foo.js", "My file."), new JSD.Tag("function", "foo", "My fn.", ["x", "y", "z.z-z"], "function foo(o) {}"), new JSD.Tag("param", "o", "My param."), new JSD.Tag("var", "v", "My var.", [], "var v;")],
        new JSD().parse("/** @file foo.js My file. */ /** My fn. @function {x y z.z-z} foo @param o My param. */ function foo(o) {} /** @var v My var. */ var v;")
    , "test parse simple");
    Utl.assertEquals(
        [new JSD.Tag("function", "foo", "My foo.")],
        new JSD().parse("/***\n *** @function foo\n *** My foo.\n ***/")
    , "test parse extra asterixes");
}
TestParse.add("testParseSimple", testParseSimple);

function testParseInner() {
    Utl.assertEquals(
        [new JSD.Tag("function", "foo", "My {@link Foo} for {@link Bar}.")],
        new JSD().parse("/** @function foo My {@link Foo} for {@link Bar}. */")
    , "test parse with inner tags");
    Utl.assertEquals([], new JSD().parseInnerComment() , "test parse null inner comment");
    Utl.assertEquals([], new JSD().parseInnerComment("") , "test parse empty inner comment");
    Utl.assertEquals(
        [new JSD.Tag("link", "Foo"), new JSD.Tag("link", "Bar")],
        new JSD().parseInnerComment("My {@link Foo} for {@link Bar}.")
    , "test parse inner comment");
}
TestParse.add("testParseInner", testParseInner);

function testReplaceLinks() {
    var foo = new JSD.Tag("class", "Foo");
    var foo2 = new JSD.Tag("class", "Foo2");
    var bar = new JSD.Tag("class", "Foo.Bar");
    var bar2 = new JSD.Tag("class", "Foo.Bar2");
    var baz = new JSD.Tag("class", "Foo.Bar.Baz");
    var baz2 = new JSD.Tag("class", "Foo.Bar.Baz2");
    foo.classes = [ bar, bar2 ];
    bar.classes = [ baz, baz2 ];

    var jsd = new JSD();
    jsd.ns = {
        isContainer: JSD.Modeler.nsContainers.isContainer,
        containers: [ foo, bar ],
        map: {}
    };
    for (var i = 0, ns, nss = [ foo, foo2, bar, bar2, baz, baz2 ]; ns = nss[i]; i++)
        jsd.ns.map[ns.value] = ns;

    var oldNamespaceTags = JSD.Modeler.nsMap.namespaceTags;
    JSD.Modeler.nsMap.namespaceTags = [ "class" ];

    Utl.assertEquals("", jsd.urlTo(), "test url to null");
    Utl.assertEquals("", jsd.urlTo(""), "test url to empty");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo"), "test url to Foo");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo", foo), "test url to Foo from Foo");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo", foo2), "test url to Foo from Foo2");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo", bar), "test url to Foo from Bar");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo", baz), "test url to Foo from Baz");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo", null, ""), "test url to Foo from ''");
    Utl.assertEquals("Foo.html", jsd.urlTo("Foo", null, "Foo2.html"), "test url to Bar from Foo2.html");
    Utl.assertEquals("../Foo.html", jsd.urlTo("Foo", null, "Foo/Bar2.html"), "test url to Bar from Bar2.html");
    Utl.assertEquals("../Foo.html", jsd.urlTo("Foo", null, "Foo/Bar.html#Baz2"), "test url to Bar from #Baz2");
    Utl.assertEquals("", jsd.urlTo("Bar"), "test url to Bar");
    Utl.assertEquals("Foo/Bar.html", jsd.urlTo("Bar", foo), "test url to Bar from Foo");
    Utl.assertEquals("Foo/Bar.html", jsd.urlTo("Bar", bar), "test url to Bar from Bar");
    Utl.assertEquals("Foo/Bar.html", jsd.urlTo("Bar", bar2), "test url to Bar from Bar2");
    Utl.assertEquals("Foo/Bar.html", jsd.urlTo("Bar", baz), "test url to Bar from Baz");
    Utl.assertEquals("Foo/Bar.html", jsd.urlTo("Foo.Bar"), "test url to Foo.Bar");
    Utl.assertEquals("Foo/Bar.html", jsd.urlTo("Foo.Bar", null, "Foo2.html"), "test url to Bar from Foo2.html");
    Utl.assertEquals("Bar.html", jsd.urlTo("Foo.Bar", null, "Foo/Bar2.html"), "test url to Bar from Bar2.html");
    Utl.assertEquals("Bar.html", jsd.urlTo("Foo.Bar", null, "Foo/Bar.html#Baz2"), "test url to Bar from #Baz2");
    Utl.assertEquals("", jsd.urlTo("Baz"), "test url to Baz");
    Utl.assertEquals("", jsd.urlTo("Baz", foo), "test url to Baz from Foo");
    Utl.assertEquals("Foo/Bar.html#Baz", jsd.urlTo("Baz", bar), "test url to Baz from Bar");
    Utl.assertEquals("Foo/Bar.html#Baz", jsd.urlTo("Baz", baz), "test url to Baz from Baz");
    Utl.assertEquals("Foo/Bar.html#Baz", jsd.urlTo("Baz", baz2), "test url to Baz from Baz2");
    Utl.assertEquals("Foo/Bar.html#Baz", jsd.urlTo("Foo.Bar.Baz"), "test url to Foo.Bar.Baz");
    Utl.assertEquals("Foo/Bar.html#Baz", jsd.urlTo("Foo.Bar#Baz"), "test url to Foo.Bar#Baz");
    Utl.assertEquals("Foo/Bar.html#Baz", jsd.urlTo("Foo.Bar.Baz", null, "Foo2.html"), "test url to Baz from Foo2.html");
    Utl.assertEquals("Bar.html#Baz", jsd.urlTo("Foo.Bar.Baz", null, "Foo/Bar2.html"), "test url to Baz from Bar2.html");
    Utl.assertEquals("Bar.html#Baz", jsd.urlTo("Foo.Bar.Baz", null, "Foo/Bar.html#Baz2"), "test url to Baz from #Baz2");

    Utl.assertEquals("", jsd.linkTo(), "test link to null");
    Utl.assertEquals("", jsd.linkTo(""), "test link to empty");
    Utl.assertEquals("<a href=\"Foo.html\">Foo</a>", jsd.linkTo("Foo"), "test link to Foo");
    Utl.assertEquals("XYZ", jsd.linkTo("XYZ"), "test link to XYZ");

    Utl.assertEquals("", jsd.replaceLinks(), "test replace null links");
    Utl.assertEquals("", jsd.replaceLinks(""), "test replace empty links");
    Utl.assertEquals(
        "My <a href=\"Foo.html\">Foo</a> for Bar.",
        jsd.replaceLinks("My {@link Foo} for {@link Bar}."),
    "test replace links");

    JSD.Modeler.nsMap.namespaceTags = oldNamespaceTags;
}
TestParse.add("testReplaceLinks", testReplaceLinks);

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
    var oldChildToParents = JSD.Modeler.parentChild.childToParents;
    JSD.Modeler.parentChild.childToParents = {
        "function": ["class"],
        property: ["class"],
        event: ["class"],
        param: ["function", "event"]
    };
    JSD.Modeler.parentChild.call(jsd, jsd);
    JSD.Modeler.parentChild.childToParents = oldChildToParents;

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
TestModel.add("testParentChildModeler", testParentChildModeler);
