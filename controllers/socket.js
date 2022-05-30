const io = require("../socketio.js").getIO()

const showData = (req, res) => {
    const notify = {
        data: req.body
    }

    io.emit('notification', notify)
    res.send(notify)
}

module.exports = {
    showData
}