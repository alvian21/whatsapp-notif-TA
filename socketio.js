const socketIO = require('socket.io')

let io;

modules.exports = {
    init: function (server) {
        io = socketIO(server)
        return io;
    },
    getIO: function () {
        if (!io) {
            throw new Error('cant get io instance before calling')
        }
        return io;
    }
}