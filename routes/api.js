exports.api = {
    list: function (req, res) {
        if (req.session.list) {
            res.json(req.session.list);
        } else {
            res.send(200);
        }
    },
    add: function (req, res) {
        if (!req.session.list) {
            req.session.list = [];
        };
        // Only for test =)
        if (req.body) {
            if (req.body.hasOwnProperty("id") && req.body.id >= 0) {
                req.session.list[req.body.id] = req.body;
            }
            res.send(200);
        }
    }
};