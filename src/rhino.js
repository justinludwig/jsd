/**
 * @file rhino.js Rhino-specific javascript.
 */

load("src/utl.js");
load("src/jsd.js");
load("src/jst.js");

/** @namespace Utl */

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

/**
 * @function {java.io.FileFilter} createDirectoryAndFileTypeFilter
 * Creates a FileFilter that accepts direcories, and files ending with the specified extension.
 * @param {string} type Space-delimited list of extensions (ie ".js .css .html").
 * @param {optional boolean} reject True to reject the specified types instead of accepting it.
 * @return Filter which accepts directories and accepts/rejects the specified file types.
 */
Utl.createDirectoryAndFileTypeFilter = function(type, reject) {
    if (type.constructor == String)
        type = type.split(/\s/);

    return new java.io.FileFilter({
        accept: function(file) {
            if (!reject && file.isDirectory()) return true;

            for (var i = 0, l = type.length; i < l; i++)
                if (file.getName().endsWith(type[i]))
                    return !reject;

            return !!reject;
        }
    });
}

Utl.cleanDirectory = function(dir) {
    // normalize dir path
    dir = dir || ".";
    if (!/\/$/.test(dir))
        dir += "/";

    var file = new java.io.File(dir);
    Utl.deleteDirectory(file);
}

Utl.deleteDirectory = function(root, skipRoot) {
    if (!root.exists())
        return;

    if (root.isDirectory())
        for (var i = 0, file, files = root.listFiles(); file = files[i]; i++)
            Utl.deleteDirectory(file);

    if (!skipRoot)
        root["delete"](); // delete is js keyword
}

/**
 * @function copyDirectories
 * Creates a (recursive) copy of the first directory/file at the second location.
 * @param {java.io.File} src Directory to copy.
 * @param {java.io.File} dst Location of copy to create.
 * @param {optional java.io.FileFilter} filter Filter to restrict files to copy.
 */
Utl.copyDirectories = function(src, dst, filter) {
    // allow array of src directories
    if (src.constructor == Array) {
        for (var i = 0, l = src.length; i < l; i++)
            Utl.copyDirectories(src[i], dst, filter);
        return;
    }

    // coerce src to file
    if (src.constructor == String)
        src = new java.io.File(src);
    if (!src.exists()) return;

    // coerce dst to file
    if (dst.constructor == String)
        dst = new java.io.File(dst);

    // copy directory recursively
    if (src.isDirectory()) {
        dst.mkdirs();

        var files = filter ? src.listFiles(filter) : src.listFiles();
        for (var i = 0; i < files.length; i++)
            Utl.copyDirectories(files[i], new java.io.File(dst, files[i].getName()), filter);
        return;
    }

    // copy file content
    var buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 0x400);
    try {
        var input = new java.io.FileInputStream(src);
        var out = new java.io.FileOutputStream(dst);

        var len = input.read(buf);
        while (len != -1) {
            out.write(buf, 0, len);
            len = input.read(buf);
        }

    // clean up
    } finally {
        if (input) input.close();
        if (out) out.close();
    }
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
        input: Utl.readDirectories(src, Utl.createDirectoryAndFileTypeFilter(JSD.srcType || ".js"), "\n/** @file {path} */\n", "\n/** @end */\n"),
        template: Utl.readDirectories(tpl, Utl.createDirectoryAndFileTypeFilter(JSD.templateType || ".jst")),
        modelers: JSD.modelers
    });

    // wipe output directory
    Utl.cleanDirectory(out);
    // run jsd
    Utl.writeToDirectory(out, jsd.run());
    // copy non-template files (.css, .gif, etc) to output directory
    Utl.copyDirectories(tpl, out, Utl.createDirectoryAndFileTypeFilter((JSD.templateType || ".jst") + " " + (JSD.ignoreType || ""), true));

})(arguments);
