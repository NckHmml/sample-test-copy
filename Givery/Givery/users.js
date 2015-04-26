var jwt = require('jwt-simple');
var moment = require('moment');

var dataAccess = require('./dataAccess.js');
var config = require('./config/config.json');

/**
 * Handles the events request
 */
exports.events = function (req, res, next) {
    var params = req.params;
    
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
    
    // Query for user events
    dataAccess.getUserEvents(params, function (events) {
        res.send({
            code: 200,
            events: events
        });
        return next();
    });
};

/**
 * Handles the reserve request
 */
exports.reserve = function (req, res, next) {
    var params = req.params, token;
    
    // Try to decode the token
    try {
        token = jwt.decode(params.token, config.secret);
    } catch (err) {
        res.send({ code: 401, message: '[token] is not valid' });
        return next();
    }
    
    // Check token expiration 
    if (moment().diff(token.exp) >= 0) {
        res.send({ code: 401, message: '[token] expired' });
        return next();
    }
    
    // Get user info, as we dont save it in the token due to security reasons
    dataAccess.getUserInfo(token.id, function (user) {
        // Error handling
        if (!user) {
            res.send({ code: 401, message: 'User not found' });
            return next();
        }
        
        // Check if user is student
        if (user.group_id !== 1) {
            res.send({ code: 401, message: 'User is not a student' });
            return next();
        }
        
        // Try to reserve the event
        dataAccess.tryReserveEvent(user.id, params.event_id, params.reserve === 'true', function (result) {
            // Error handling
            if (!result) {
                res.send(500, 'something went wrong');
                return next();
            }
            
            // Cannot reserve already reaserved event.
            if (result === 501) {
                res.send({ code: 501, message: 'Already reserved' });
                return next();
            }
            
            // Cannot unreserve not reaserved event
            if (result === 502) {
                res.send({ code: 502, message: 'Not reserved' });
                return next();
            }
            
            res.send({ code: 200 });
            return next();
        });
    });
};