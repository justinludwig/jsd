/**
 * @file rhino.js Rhino-specific javascript.
 */

load("src/utl.js");
load("src/jsd.js");
load("src/jst.js");

Utl.readDirectory = function(file, filter, header, footer, charset) {
    if (!file.exists()) return "";

    if (file.isDirectory()) {
        var a = [];
        var files = filter ? file.listFiles(filter) : file.listFiles();
        files.sort();
        for (var i = 0; i < files.length; i++)
            a.push(Utl.readDirectory(files[i], filter, header, footer, charset));
        return a.join("");
    }

    header = header ? header.replace(/\{([^}]+)\}/g, function(s, s1) {
        var fn = "get" + s1.charAt(0).toUpperCase() + s1.substring(1);
        return file[fn]();
    }) : "";
    footer = footer || "";

    return header + readFile(file.getPath(), charset || "utf8") + footer;
}

Utl.readDirectories = function(files, filter, header, footer, charset) {
    var a = [];
    for (var i = 0; i < files.length; i++) {
        var file = new java.io.File(files[i]);
        a.push(Utl.readDirectory(file, filter, header, footer, charset));
    }
    return a.join("");
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
        try {
            // make directory structure
            var file = new java.io.File(dir + i);
            var parent = file.getParentFile();
            parent.mkdirs();
            // write file
            Utl.writeFile(file, files[i]);
        } catch (e) {
            Utl.log(e, "ERROR", "rhino");
        }
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
        input: Utl.readDirectories(src, Utl.createDirectoryAndFileTypeFilter(".js"), "\n/** @file {path} */\n", "\n/** @end */\n"),
        template: Utl.readDirectories(tpl, Utl.createDirectoryAndFileTypeFilter(".jst")),
        modelers: JSD.modelers
    });
    Utl.writeToDirectory(out, jsd.run());
})(arguments);
