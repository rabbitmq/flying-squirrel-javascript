
Flying Squirrel Javascript Client
=================================


Flying Squirrel Client
======================

The Flying Squirrel Client is built on top of
[socket.io](https://github.com/LearnBoost/Socket.IO/) library. Put
that inside html "head" tag:

    <script type="text/javascript"
            src="http://cdn.socket.io/stable/socket.io.js"></script>

    <script type="text/javascript"
            src="http://cdn.squirr.us/flying-squirrel-client-0.0.0.js"></script>


To establish a client connection you need two variables
`transport_url` and `ticket`.

    var connection = new flyingsquirrel.Connection(TRANSPORT_URL, TICKET);

    connection.subscribe('recv-channel', function (msg) {
        alert("got a message " + msg);
    });
    connection.publish('send-channel', value),

    connection.connect();


Documentation
-------------

### Connection object

    var connection = new flyingsquirrel.Connection(transport_url, ticket, [options]);

#### Options:

 - *debug* (false) - enable extra debugging.
 - *socket_opts* ({}) - extra socket.io flags, see socket.io documentation for details.

#### Methods:

 - *connect()*
 - *disconnect()*
 - *publish(channel, body)*
 - *subscribe(channel, callback)*
 - *request(channel, question, callback)*
 - *serve(channel, callback)*


Flying Squirrel API
===================

The Flying Squirrel API requires [jQuery](http://jquery.com/)
library. Put that inside html "head" tag:

    <script type="text/javascript"
            src="http://code.jquery.com/jquery-1.6.min.js"></script>

    <script type="text/javascript"
            src="http://cdn.squirr.us/flying-squirrel-api-0.0.0.js"></script>


To connect to Flying Squirrel service need the `api_url`.

    var api = new flyingsquirrel.API(API_URL);

    var endpoint = api.create_endpoint("echo_example",
                                       {'send-channel': ['pub', 'echo],
                                        'recv-channel': ['sub', 'echo']});

    var transport_url = endpoint.protocols['socket.io'];
    var ticket = api.generate_ticket("echo_example", 'test_user');


Documentation
-------------

### API object

    var api = new flyingsquirrel.API(API_URL);

#### Methods:

 - *create_endpoint(name, definition, [callback])*
 - *delete_endpoint(name, [callback])*
 - *generate_ticket(name, identity, [callback], [timeout])*

