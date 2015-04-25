var mysql = require('mysql');
var moment = require('moment');
var config = require('./config/config.json');

var connection = mysql.createConnection(config.mysql);

/**
 * Tries to get the user from the database
 * @param userdata data to login with
 * @param callback function to execute when finished
 */
exports.userLogin = function (userdata, callback) {
    connection.query('SELECT * FROM users WHERE email = ? AND password = sha1(?)', [userdata.email, userdata.password], function (err, rows, fields) {
        if (err || rows.length != 1)
            return callback(false);
        return callback(rows[0]);
    });
};

/**
 * Tries to get user events from the database
 * @param params query data such as limit, offset and from date
 * @param callback function to execute when finished
 */
exports.getUserEvents = function (params, callback) {
    var query = 'SELECT * FROM events WHERE start_date >= ? ORDER BY start_date';
    
    // Add the LIMIT to the query
    if (params.limit || params.offset) {
        query += ' LIMIT ';
        if (params.limit)
            query += parseInt(params.limit).toString();
        else
            query += '18446744073709551615'; // dev.mysql suggests this
        
        query += ' OFFSET ';
        if (params.offset)
            query += parseInt(params.offset).toString();
        else
            query += '0';
    }
    
    connection.query(query, [params.from], function (err, rows, fields) {
        if (err)
            return callback(false);
        
        rows = rows.map(function (row) {
            // Custom date format
            row.start_date = moment(row.start_date).format("YYYY-MM-DD HH:mm:ss");
            return row;
        });
        
        return callback(rows);
    });
};

/**
 * Tries to get user info by id
 * @param id user id to get its info from
 * @param callback function to execute when finished
 */
exports.getUserInfo = function (id, callback) {
    connection.query('SELECT * FROM users WHERE id = ?', [id], function (err, rows, fields) {
        if (err || rows.length != 1)
            return callback(false);
        return callback(rows[0]);
    });
};

/**
 * Tries to reserve an event for an user
 * @param userId id of the user
 * @param eventId id of the event
 * @param reserve boolean to state if it should be reserved or unreserved
 * @param callback function to execute when finished
 */
exports.tryReserveEvent = function (userId, eventId, reserve, callback) {
    connection.query('SELECT * FROM attends WHERE user_id = ? AND event_id = ?', [userId, eventId], function (err, rows, fields) {
        if (err)
            return callback(false);
        if (rows.length > 0 && reserve)
            return callback(501);
        if (rows.length == 0 && !reserve)
            return callback(502);
        
        if (reserve) {
            connection.query('INSERT INTO attends (user_id, event_id) VALUES (?, ?)', [userId, eventId], function (err) {
                if (err)
                    return callback(false);
                return callback(true);
            });
        } else {
            connection.query('DELETE FROM attends WHERE user_id = ? AND event_id = ?', [userId, eventId], function (err) {
                if (err)
                    return callback(false);
                return callback(true);
            });
        }
    });
};

/**
 * Tries to get company events from the database
 * @param params query data such as limit, offset and from date
 * @param usedId user_id of the company
 * @param callback function to execute when finished
 */
exports.getCompanyEvents = function (params, userId, callback) {
    var query = 'SELECT * FROM (SELECT events.*, COUNT(attends.user_id) AS number_of_attendees FROM events LEFT JOIN attends ON events.id = attends.event_id WHERE events.user_id = ? GROUP BY events.id) as events WHERE start_date >= ? ORDER BY start_date';
    
    // Add the LIMIT to the query
    if (params.limit || params.offset) {
        query += ' LIMIT ';
        if (params.limit)
            query += parseInt(params.limit).toString();
        else
            query += '18446744073709551615'; // dev.mysql suggests this
        
        query += ' OFFSET ';
        if (params.offset)
            query += parseInt(params.offset).toString();
        else
            query += '0';
    }
    
    connection.query(query, [userId, params.from], function (err, rows, fields) {
        if (err) 
            return callback(false);
        
        rows = rows.map(function (row) {
            // Custom date format
            row.start_date = moment(row.start_date).format("YYYY-MM-DD HH:mm:ss");
            return row;
        });
        
        return callback(rows);
    });
};