module("client");

var basic_socketio_factory = function(edef, mangle_ticket) {
    var api = new flyingsquirrel.API(api_url);
    var ename = 'test_' + Math.random();
    var endpoint = api.create_endpoint(ename, edef);
    equal(ename, endpoint.endpoint_name);

    var protocol_url = endpoint.protocols['socket.io'];
    ok(protocol_url.length > 1);

    var ticket = api.generate_ticket(ename, 'test_user');
    ok(ticket.length > 1);

    if (mangle_ticket) {
        ticket = mangle_ticket(ticket);
    }
    var conn = new flyingsquirrel.Connection(protocol_url,
                                             ticket,
                                             {debug:true});
    var cleanup = function () {
        cleanup = function () {
            console.error("cleanup called twice!");
            throw "cleanup called twice!";
        };
        var d = api.delete_endpoint(ename);
        equal(204, d);
    };
    return {conn:conn, cleanup:cleanup};
};

var basic_roundtrip = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']});
    var conn = app.conn;

    conn.on_connect = function () {ok(true);};
    conn.on_disconnect = function () {
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        app.cleanup();
        start();
    };

    var expected = ['1', '2', '3'];
    $.each(expected, function (_, msg) {
               conn.publish('a', msg);
           });

    conn.subscribe('b', function (msg) {
                       equals(msg, expected.shift());
                       if (expected.length === 0) {
                           conn.disconnect();
                       }
                   });
    conn.connect();
};
asyncTest("basic roundtrip", 9, basic_roundtrip);


var test_disconnect = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']});
    var conn = app.conn;

    conn.on_connect = function () {
        ok(true);
        conn.publish('a', '1');
        conn.disconnect();
    };
    conn.on_disconnect = function () {
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        setTimeout(function () {
                       app.cleanup();
                       start();
                   }, 500);
    };
    conn.subscribe('b', function (msg) {
                       ok(false);
                   });
    conn.connect();
};
asyncTest("disconnect after connect", 6, test_disconnect);

var test_bad_ticket1 = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']},
                                   function(t) {return t + 'a+';});
    var conn = app.conn;

    conn.on_connect = function () {
        throw "unexpected connect event";
    };
    conn.on_disconnect = function (_conn, reason, descr) {
        equal('refused', reason);
        equal('malformed_ticket', descr);
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        app.cleanup();
        start();
    };
    conn.connect();
};
asyncTest("bad ticket (wrong b64 encoding)", 7, test_bad_ticket1);

var test_bad_ticket2 = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']},
          function(t) {return 'pgxFx6pmsr0ZZWGnj09lEUkTlM9Nh26KdGVzdF91c2Vy';});
    var conn = app.conn;

    conn.on_connect = function () {
        throw "unexpected connect event";
    };
    conn.on_disconnect = function (_conn, reason, descr) {
        equal('refused', reason);
        equal('invalid_hmac', descr);
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        app.cleanup();
        start();
    };
    conn.connect();
};
asyncTest("bad ticket (unauthorized)", 7, test_bad_ticket2);


var test_utf8_message = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']});
    var conn = app.conn;

    conn.on_connect = function () {ok(true);};
    conn.on_disconnect = function () {
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        app.cleanup();
        start();
    };
    var expected = ['1\x02',
                    'யாaமறிந்த மொ ٱلْحَمْدُ لِلّٰهِ رَبِّ ٱلْعَالَمِينَ ٱلرَّحْمـَبنِ ٱلرَّحِيمِ مَـالِكِ يَوْمِ ٱلدِّينِ',
                   '學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？ 人不知而不慍，不亦君子乎？」 有子曰：「其為人也孝弟，而好犯上者，鮮矣； 不好犯上，而好作亂者，未之有也。君子務本，本立而道生。 孝弟也者，其為仁之本與！」',
                   '\x01\x02\x03',
                   'Μῆνιν ἄειδε θεὰ Πηληϊάδεω ᾿Αχιλῆος (1) οὐλομένην, ἣ μυρί’ ᾿Αχαιοῖς ἄλγε’ ἔθηκε, πολλὰς δ’ ἰφθίμους ψυχὰς ῎Αϊδι προΐαψεν'];

    $.each(expected, function (_, msg) {
               conn.publish('a', msg);
           });

    conn.subscribe('b', function (msg) {
                       equals(msg, expected.shift());
                       if (expected.length === 0) {
                           conn.disconnect();
                       }
                   });
    conn.connect();
};
asyncTest("utf8 in messages", 11, test_utf8_message);


var test_empty_messages = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']});
    var conn = app.conn;

    conn.on_connect = function () {ok(true);};
    conn.on_disconnect = function () {
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        app.cleanup();
        start();
    };
    var expected = ['',
                    '',
                    '',
                    '',
                    ''];

    $.each(expected, function (_, msg) {
               conn.publish('a', msg);
           });

    conn.subscribe('b', function (msg) {
                       equals(msg, expected.shift());
                       if (expected.length === 0) {
                           conn.disconnect();
                       }
                   });
    conn.connect();
};
asyncTest("empty messages", 11, test_empty_messages);


var test_broken_frame = function() {
    var app = basic_socketio_factory({'a':['pub','test'], 'b':['sub','test']});
    var conn = app.conn;

    conn.on_connect = function () {ok(true);};
    conn.on_disconnect = function (_conn, reason, descr) {
        equal('error', reason);
        equal('malformed_frame', descr);
        ok(true);
        conn.on_disconnect = function () {throw "bad event";};
        conn.on_connect = function () {throw "bad event";};
        app.cleanup();
        start();
    };

    var expected = ['a ', 'a b  ', ' a b c', '', '  a', '\x00\xFF x \x00\xff'];

    // Send first bunch
    $.each(expected, function (_, msg) {
               conn.publish('a', msg);
           });
    conn.subscribe('b', function (msg) {
                       equals(msg, expected.shift());
                       if (expected.length === 0) {
                           // Send error frame
                           conn.socket.send("this is a broken json");
                       }
                   });
    conn.connect();
};
asyncTest("broken frame and recovery", 14, test_broken_frame);
