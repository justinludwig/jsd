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

