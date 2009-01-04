/**
 * @file rhino.js Rhino-specific javascript.
 */

load("src/utl.js");
load("src/jsd.js");
load("src/jst.js");

Utl.readDirectory = function(file, filter, charset) {
    if (!file.exists()) return "";

    if (file.isDirectory()) {
        var a = [];
        var files = filter ? file.listFiles(filter) : file.listFiles();
        for (var i = 0; i < files.length; i++)
            a.push(Utl.readDirectory(files[i], filter, charset));
        return a.join("");
    }

    return readFile(file.getPath(), charset || "utf8");
}

Utl.readDirectories = function(files, filter, charset) {
    var a = [];
    for (var i = 0; i < files.length; i++) {
        var file = new java.io.File(files[i]);
        a.push(Utl.readDirectory(file, filter));
    }
    return a.join("\n");
}

Utl.createDirectoryAndFileTypeFilter = function(type) {
    return new java.io.FileFilter({
        accept: function(file) {
            return (file.isDirectory() || file.getName().endsWith(type));
        }
    });
}

Utl.writeToDirectory = function(dir, s) {
    // normalize dir path
    dir = dir || ".";
    if (!/\/$/.test(dir))
        dir += "/";

    // write files
    var files = Utl.splitIntoFiles(s);
    for (var i in files)
        Utl.writeFile(dir + i, files[i]);
}

Utl.writeFile = function(file, s) {
    try {
        var out = new java.io.FileWriter(file);
        out.write(new java.lang.String(s).toCharArray());
    } catch (e) {
        Utl.log(e, "ERROR", "rhino");
    } finally {
        if (out)
            out.close();
    }
}

// need a print statement here for some reason
print("running...");

(function(args) {
    var out = (args.pop() || "");
    var src = (args.pop() || "").split(/\s/);

    args = Utl.mapArgs(args);
    var conf = args.c || args.conf || args.config || "conf/default.conf";
    load(conf);

    var tpl = JSD.template;
    if (tpl.constructor == String)
        tpl = tpl.split(/\s/);

    var jsd = new JSD.TemplateDriven({
        input: Utl.readDirectories(src, Utl.createDirectoryAndFileTypeFilter(".js")),
        template: Utl.readDirectories(tpl, Utl.createDirectoryAndFileTypeFilter(".jst"))
    });
    Utl.writeToDirectory(out, jsd.run());
})(arguments);
