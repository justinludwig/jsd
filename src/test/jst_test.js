/**
 * @file test/jst_test.js Test templating functionality.
 */

var TestTemplate = new Utl.TestSuite();
Utl.TestAll.add("TestTemplate", TestTemplate);

function testParseTemplate() {
    Utl.assertEquals("", new JST().parse(), "test parse null template");
    Utl.assertEquals("", new JST().parse(""), "test parse empty template");
    Utl.assertEquals("", new JST().parse("<%-- comment --%>"), "test parse only-comment template");
    Utl.assertEquals("\nout(\"foo\");\n", new JST().parse("foo"), "test parse simple template");
    Utl.assertEquals("\nout(\"\\n\\rthis is foo@bar.com\\'s \\\"template\\\"!\");\n", new JST().parse("\n\rthis is foo@bar.com's \"template\"!"), "test parse escaped-content template");
    Utl.assertEquals("\nfoo\n", new JST().parse("<% foo %>"), "test parse single-scriptlet template");
    Utl.assertEquals("\nfoo\nbar\nout(baz);\n\n", new JST().parse("<% foo %><%! bar %><%= baz %><%@ baal %><%-- comment --%>"), "test parse multiple-scriptlet template");
    Utl.assertEquals("\nout(\"\\n\\r\\n\\r\");\nvar my = this.my;\nout(\"\\n\\r<h1>\");\nout(my.title);\nout(\"</h1>\\n\\r<p>Hello \");\nif (my.url) {\nout(\"<a href=\\\"\");\nout(my.host + \"/\" + my.url);\nout(\"\\\">\");\n}\nout(my.world);\nif (my.url) {\nout(\"</a>\");\n}\nout(\"</p>\\n\\r\");\n", new JST().parse("\n\r<%-- my template --%>\n\r<%! var my = this.my; %>\n\r<h1><%= my.title %></h1>\n\r<p>Hello <%-- only print anchor if I have a url --%><% if (my.url) { %><a href=\"<%=my.host + \"/\" + my.url%>\"><% } %><%= my.world %><% if (my.url) { %></a><% } %></p>\n\r"), "test parse empty template");
    Utl.assertEquals("\nfoo bar\n", new JST({
        directors: {
            foo: function() { return "foo bar"; }
        }
    }).parse("<%@ foo %>"), "test parse simple-directive template");
    Utl.assertEquals("\nbar=true&baz=true\n", new JST({
        directors: {
            foo: function(n, o) { return "bar=" + (o.bar=="x y z") + "&baz=" + (o.baz=="p=q"); }
        }
    }).parse("<%@ foo bar=\"x y z\" baz='p=q' %>"), "test parse complex-directive template");
}
TestTemplate.add("testParseTemplate", testParseTemplate);

function testRunTemplate() {
    Utl.assert(new JST().build(), "test build null template");
    Utl.assertEquals("", new JST().run(), "test run null template");
    Utl.assertEquals("", new JST().run(""), "test run empty template");
    Utl.assertEquals("", new JST().run("<%-- comment --%>"), "test run only-comment template");
    Utl.assertEquals("foo", new JST().run("foo"), "test run simple template");
    Utl.assertEquals("\n\rthis is foo@bar.com's \"template\"!", new JST().run("\n\rthis is foo@bar.com's \"template\"!"), "test run escaped-content template");
    Utl.assertEquals("foo", new JST().run("<% out(\"foo\"); %>"), "test run single-scriptlet template");
    Utl.assertEquals("foobarbaz", new JST().run("<% out(\"foo\"); %><%! out('bar'); %><%= 'baz' %><%@ baal %><%-- comment --%>"), "test run multiple-scriptlet template");
    Utl.assertEquals("bar", new JST().run("<%=foo%>", { foo: "bar" }), "test run single-argument template");
    Utl.assertEquals("123", new JST().run("<%=foo%><%=bar%><%=baz%>", { foo: 1, bar: 2, baz: 3 }), "test run multiple-argument template");
    Utl.assertEquals("\n\r\n\r\n\r<h1>My Title</h1>\n\r<p>Hello <a href=\"http://foo/bar\">My World</a></p>\n\r", new JST({ my: { title: "My Title", host: "http://foo", url: "bar", world: "My World" }  }).run("\n\r<%-- my template --%>\n\r<%! var my = this.my; %>\n\r<h1><%= my.title %></h1>\n\r<p>Hello <%-- only print anchor if I have a url --%><% if (my.url) { %><a href=\"<%=my.host + \"/\" + my.url%>\"><% } %><%= my.world %><% if (my.url) { %></a><% } %></p>\n\r"), "test run extended template");
}
TestTemplate.add("testRunTemplate", testRunTemplate);
