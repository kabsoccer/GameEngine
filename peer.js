var peer;
var connection;

var connectedToServer = false;
var connectedToPeer = false;

var playerId;

var onData;

function tryConnect(id, success, failure) {
    peer = new Peer(id, { key: 'htv51s57rg22o6r' });

    peer.on('open',
        function() {
            peer.on('connection', function(conn) {
                console.log('got connection from', conn);

                connection = conn;
                connectedToPeer = true;
                conn.on('data', onData);
            });

            success();
        });

    peer.on('close', failure);
}

function connectToServer() {
    tryConnect(
        1,
        function() {
            console.log('connected with id', peer.id);

            connectedToServer = true;
            playerId = 1;

            connectToPeer();
        },
        function() {
            tryConnect(
                2,
                function() {
                    console.log('connected with id', peer.id);

                    connectedToServer = true;
                    playerId = 2;

                    connectToPeer();
                },
                function() {
                    console.log('failed to connect');
                }
            );
        }
    );
}

function connectToPeer() {
    if (!connectedToServer) return;

    var conn = peer.connect(3 ^ playerId);

    conn.on('open', function() {
        console.log('connection', conn, 'open');

        connectedToPeer = true;
        connection = conn;
    });

    conn.on('error', function(err) {
        console.log('error in connection', conn, err);
    });

    conn.on('close', function() {
        console.log('closed connection', conn);
    });

    conn.on('data', onData);
}

function setDataListener(listener) {
    onData = listener;
}