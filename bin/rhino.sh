#!/bin/sh

JSD_HOME=`dirname $0`/..
SRC=$1
OUT=$2

java -cp $JSD_HOME/lib/js-14.jar org.mozilla.javascript.tools.shell.Main $JSD_HOME/src/rhino.js "$SRC" "$OUT"
