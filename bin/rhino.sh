#!/bin/sh

JSD_HOME=`dirname $0`/..
SRC="$1"
OUT="$2"
SHELL=${3-shell}

java -cp "$JSD_HOME/lib/js.jar" org.mozilla.javascript.tools.$SHELL.Main "$JSD_HOME/src/rhino.js" "$SRC" "$OUT"
