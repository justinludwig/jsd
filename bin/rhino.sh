#!/bin/sh

JSD_HOME=`dirname $0`/..
FILES=$1

java -cp $JSD_HOME/lib/js-14.jar org.mozilla.javascript.tools.shell.Main $JSD_HOME/src/rhino.js "$FILES"
