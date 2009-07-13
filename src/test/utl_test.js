/**
 * @file test/utl_test.js Test utilities.
 */

var TestUtl = new Utl.TestSuite();
Utl.TestAll.add("TestUtl", TestUtl);

function testTrim() {
    Utl.assertEquals("", Utl.trim(""), "test trim empty string");
    Utl.assertEquals("", Utl.trim(" \n "), "test trim all-whitespace string");
    Utl.assertEquals("foo", Utl.trim("foo"), "test trim no-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim("foo bar baz"), "test trim interior-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim(" \n foo bar baz"), "test trim leading-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim("foo bar baz \n "), "test trim trailing-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim(" \n foo bar baz \n "), "test trim leading-and-trailing-whitespace string");
}
TestUtl.add("testTrim", testTrim);

function testEscapeJS() {
    Utl.assertEquals("", Utl.escapeJS(""), "test escapeJS empty string");
    Utl.assertEquals("foo", Utl.escapeJS("foo"), "test escapeJS no-reserved-chars string");
    Utl.assertEquals("\\\\\\\'\\\"\\n\\rfoo\\\\\\\'\\\"\\n\\r", Utl.escapeJS("\\\'\"\n\rfoo\\\'\"\n\r"), "test escapeJS reserved-chars string");
}
TestUtl.add("testEscapeJS", testEscapeJS);

function testEquals() {
    Utl.assert(Utl.equals(), "assert undefined equals undefined");
    Utl.assert(Utl.equals(null), "assert null equals undefined");
    Utl.assert(Utl.equals(null, null), "assert null equals null");
    Utl.assert(!Utl.equals(""), "assert empty-string not equals undefined");
    Utl.assert(Utl.equals("", ""), "assert empty-string equals empty-string");
    Utl.assert(Utl.equals("foo", "foo"), "assert foo equals foo");
    Utl.assert(!Utl.equals("foo", "bar"), "assert foo not equals bar");
    Utl.assert(Utl.equals([], []), "assert empty-array equals empty-array");
    Utl.assert(Utl.equals(["foo"], ["foo"]), "assert foo-array equals foo-array");
    Utl.assert(!Utl.equals(["foo"], []), "assert foo-array not equals empty-array");
    Utl.assert(!Utl.equals([], ["foo"]), "assert empty-array not equals foo-array");
    Utl.assert(!Utl.equals(["foo"], ["bar"]), "assert foo-array not equals bar-array");
    Utl.assert(Utl.equals({}, {}), "assert empty-object equals empty-object");
    Utl.assert(Utl.equals({ x: 1, y: "foo", z: null }, { x: 1, y: "foo", z: null }), "assert object equals object");
    Utl.assert(Utl.equals({ x: [], y: { foo: "foo" }, z: { a: ["a","b"], o: { i: 1, j: 2 } } }, { x: [], y: { foo: "foo" }, z: { a: ["a","b"], o: { i: 1, j: 2 } } }), "assert complex-object equals complex-object");
    Utl.assert(!Utl.equals({ x: 1 }, { x: 2 }), "assert object property not equals object property");
    Utl.assert(!Utl.equals({ x: { y: 1 } }, { x: { y: 2 } }), "assert complex-object property not equals complex-object property");
    Utl.assert(!Utl.equals({ x: { y: 1, z: 2 } }, { x: { y: 1 } }), "assert object property missing in second");
    Utl.assert(!Utl.equals({ x: { y: 1 } }, { x: { y: 1, z: 2 } }), "assert object property missing in first");

}
TestUtl.add("testEquals", testEquals);

function testSplitIntoFiles() {
    Utl.assertEquals({}, Utl.splitIntoFiles(), "test null split into files");
    Utl.assertEquals({}, Utl.splitIntoFiles(""), "test empty-string split into files");
    Utl.assertEquals({}, Utl.splitIntoFiles("foo"), "test no-op split into files");
    Utl.assertEquals({ "d/f1.txt": "bar", "d/f2.txt": "baz" }, Utl.splitIntoFiles("foo\n==========d/f1.txt==========\nbar\n==========d/f2.txt==========\nbaz"), "test simple split into files");
}
TestUtl.add("testSplitIntoFiles", testSplitIntoFiles);

function testPluralize() {
    Utl.assertEquals("", Utl.pluralize(), "test pluralize null");
    Utl.assertEquals("", Utl.pluralize(""), "test pluralize empty-string");
    Utl.assertEquals("foos", Utl.pluralize("foo"), "test pluralize foo");
    Utl.assertEquals("fooses", Utl.pluralize("foos"), "test pluralize foos");
    Utl.assertEquals("fooies", Utl.pluralize("fooy"), "test pluralize fooy");
}
TestUtl.add("testPluralize", testPluralize);
