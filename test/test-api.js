module("api");

var basic_provisioning = function() {
    var api = new flyingsquirrel.API(api_url);

    var endpoint = api.create_endpoint("test_3",
                                       {'a':['pub','test'],
                                        'b':['sub','test']});
    ok(endpoint.protocols['socket.io'], "create endpoint");

    var ticket = api.generate_ticket("test_3", 'test_user');
    ok(ticket.length > 1, "generate ticket");

    var conn = new flyingsquirrel.Connection(
        endpoint.protocols['socket.io'], ticket);
    conn.on_connect = function () { ok(true);};
    conn.publish('a', '123');
    conn.subscribe('b', function (msg) {
                       equals(msg, '123');
                       conn.disconnect();
                       conn.on_disconnect = function () {throw "bad event";};
                       conn.on_connect = function () {throw "bad event";};
                       api.delete_endpoint("test_3");
                       start();
                   });
    conn.connect();
};
asyncTest("basic provisioning", 4, basic_provisioning);


var api_sychronous = function () {
    var api = new flyingsquirrel.API(api_url);
    var ename = 'test_' + Math.random();

    var edef = {'a':['pub','test'], 'b':['sub','test']};
    var endpoint = api.create_endpoint(ename, edef);
    equal(ename, endpoint.endpoint_name);
    ok(endpoint.protocols['socket.io'].length > 0);
    ok(endpoint.protocols['websockets'].length > 0);
    deepEqual(edef, endpoint.definition);

    var d = api.delete_endpoint(ename);
    equal(204, d);
};
test("API (synchronous)", api_sychronous);


var api_asychronous = function () {
    var api = new flyingsquirrel.API(api_url);
    var ename = 'test_' + Math.random();

    var edef = {'a':['pub','test'], 'b':['sub','test']};
    var r = api.create_endpoint(
        ename, edef,
        function (status, endpoint) {
            equal(ename, endpoint.endpoint_name);
            ok(endpoint.protocols['socket.io'].length > 0);
            ok(endpoint.protocols['websockets'].length > 0);
            deepEqual(edef, endpoint.definition);
            var r = api.delete_endpoint(
                ename,
                function (status, d) {
                    equal(204, d);
                    start();
                });
            ok(r === null);
        });
    ok(r === null);
};
asyncTest("API (asynchronous)", api_asychronous);
