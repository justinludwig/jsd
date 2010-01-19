#!/bin/sh

JSD_HOME=`dirname $0`/..
SRC=$1
OUT=$2

if [ -z "$SRC" ]; then
    SRC="$JSD_HOME/src"
fi
if [ -z "$OUT" ]; then
    OUT="$JSD_HOME/doc/api"
fi


java -cp "$JSD_HOME/lib/js.jar" org.mozilla.javascript.tools.shell.Main "$JSD_HOME/src/rhino.js" "$SRC" "$OUT"
