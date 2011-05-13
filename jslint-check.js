#!/usr/bin/env rhino
load('jslint.js');

if (arguments.length < 1) {
    print("usage: jslint-check input-file.js ...");
    quit(1);
}

var options = {forin: true,
               maxerr: 10,
               browser: true};

var all_found = 0;

for (var argno in arguments) {
    var filename = arguments[argno];

    JSLINT(readFile(filename), options);

    var e = JSLINT.errors, found = 0;

    print(" [*] JSLinting \"" + filename + "\"." );
    for ( var i = 0; i < e.length; i++ ) {
        var w = e[i];

        found++;
        print(w.evidence);
        print( "    Problem at line " + w.line + " character " + w.character + ": " + w.reason  + "\n");
    }

    if ( found > 0 ) {
        print(" [!] " + found + " Error(s) found.");
    } else {
        print(" [+] ok");
    }
    all_found += found;
}

if ( all_found > 0 ) {
    quit(1);
} else {
    quit(0);
}
