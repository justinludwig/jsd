/**
 * @file test/jsd_test.js Test jsd functionality.
 */

var TestAll = new JSD.TestSuite();

var TestParse = new JSD.TestSuite();
TestAll.add("TestParse", TestParse);

var TestModel = new JSD.TestSuite();
TestAll.add("TestModel", TestModel);

var TestPrint = new JSD.TestSuite();
TestAll.add("TestPrint", TestPrint);

function testEquals() {
    JSD.assert(JSD.equals(), "assert undefined equals undefined");
    JSD.assert(JSD.equals(null), "assert null equals undefined");
    JSD.assert(JSD.equals(null, null), "assert null equals null");
    JSD.assert(!JSD.equals(""), "assert empty-string not equals undefined");
    JSD.assert(JSD.equals("", ""), "assert empty-string equals empty-string");
    JSD.assert(JSD.equals("foo", "foo"), "assert foo equals foo");
    JSD.assert(!JSD.equals("foo", "bar"), "assert foo not equals bar");
    JSD.assert(JSD.equals([], []), "assert empty-array equals empty-array");
    JSD.assert(JSD.equals(["foo"], ["foo"]), "assert foo-array equals foo-array");
    JSD.assert(!JSD.equals(["foo"], []), "assert foo-array not equals empty-array");
    JSD.assert(!JSD.equals([], ["foo"]), "assert empty-array not equals foo-array");
    JSD.assert(!JSD.equals(["foo"], ["bar"]), "assert foo-array not equals bar-array");
    JSD.assert(JSD.equals({}, {}), "assert empty-object equals empty-object");
    JSD.assert(JSD.equals({ x: 1, y: "foo", z: null }, { x: 1, y: "foo", z: null }), "assert object equals object");
    JSD.assert(JSD.equals({ x: [], y: { foo: "foo" }, z: { a: ["a","b"], o: { i: 1, j: 2 } } }, { x: [], y: { foo: "foo" }, z: { a: ["a","b"], o: { i: 1, j: 2 } } }), "assert complex-object equals complex-object");
    JSD.assert(!JSD.equals({ x: 1 }, { x: 2 }), "assert object property not equals object property");
    JSD.assert(!JSD.equals({ x: { y: 1 } }, { x: { y: 2 } }), "assert complex-object property not equals complex-object property");
    JSD.assert(!JSD.equals({ x: { y: 1, z: 2 } }, { x: { y: 1 } }), "assert object property missing in second");
    JSD.assert(!JSD.equals({ x: { y: 1 } }, { x: { y: 1, z: 2 } }), "assert object property missing in first");

}
TestAll.add("testEquals", testEquals);

function testParseSimple() {
    JSD.assert(JSD.equals([], new JSD().parse()), "test parse null input");
    JSD.assert(JSD.equals([], new JSD().parse("")), "test parse empty input");
    JSD.assert(JSD.equals([], new JSD().parse("/* nada */ foo // bar \n /* * */ baz /* nix */")), "test parse no javadoc");
    JSD.assert(JSD.equals([new JSD.Tag("file", "foo.js", "My file."), new JSD.Tag("function", "foo", "My fn.", ["x", "y", "z.z-z"]), new JSD.Tag("param", "o", "My param."), new JSD.Tag("var", "v", "My var.")], new JSD().parse("/** @file foo.js My file. */ /** My fn. @function {x y z.z-z} foo @param o My param. */ function foo(o) {} /** @var v My var. */ var v;")), "test parse simple");
    JSD.assert(JSD.equals([new JSD.Tag("function", "foo", "My foo.")], new JSD().parse("/***\n *** @function foo\n *** My foo.\n ***/")), "test parse extra asterixes");
}
TestParse.add("testParseSimple", testParseSimple);

