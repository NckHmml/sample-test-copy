var jwt = require('jwt-simple');

var config = require('./config/config.json');
var dataAccess = require('./dataAccess.js');

/**
 * Handles the events request
 */
exports.events = function (req, res, next) {
    var params = req.params, token;
    
    // Try to decode the token
    try {
        token = jwt.decode(params.token, config.secret);
    } catch (err) {
        res.send({ code: 401, message: '[token] is not valid' });
        return next();
    }

    // Check from
    if (!params.from) {
        res.send(400, '[from] cannot be empty');
        return next();
    }
    
    // Check limit
    if (params.limit && params.limit <= 0) {
        res.send(400, '[limit] must equal or be higher than 1');
        return next();
    }
    
    dataAccess.getUserInfo(token.id, function (user) {
        // Error handling
        if (!user) {
            res.send({ code: 401, message: 'User not found' });
            return next();
        }
        
        // Check if user is a company
        if (user.group_id != 2) {
            res.send({ code: 401, message: 'User is not a company' });
            return next();
        }

        // Query for company events
        dataAccess.getCompanyEvents(params, user.id, function (events) {
            // Error handling
            if (!events) {
                res.send(500, 'Something went wrong');
                return next();
            }
            
            // Send response
            res.send({
                code: 200,
                events: events
            });
            return next();
        });
    });
};