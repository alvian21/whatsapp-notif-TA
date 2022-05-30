const async = require('async')
const { response } = require('express')

exports.connection_client = function (endpoint, socket) {


    // endpoint.emit('message', 'connectingg....');

    socket.on('news', function (newsreel) {
        endpoint.emit(newsreel)
    })

    // endpoint.emit(socket)
}
