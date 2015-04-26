var moment = require('moment');
var jwt = require('jwt-simple');

var config = require('./config/config.json');
var dataAccess = require('./dataAccess.js');

/**
 * Handles a login request 
 */
exports.login = function (req, res, next) {
    dataAccess.userLogin(req.params, function (user) {
        if (!user) {
            // Invalid login
            res.send({ code : 500 });
            return next();
        }
        
        // Create token
        var token = jwt.encode({
            id: user.id,
            exp: moment().add(1, 'h').valueOf()
        }, config.secret);
        
        // Send valid response
        res.send({
            code: 200,
            user: user,
            token: token
        });
        return next();
    });
};