const mysql = require('mysql');

// Connection Pool
const centrala = mysql.createPool({
    connectionLimit : 100,
    host            : '130.211.194.76',
    user            : 'root',
    password        : 'Bakalarka123',
    database        : 'kauflandcentrala',
});
const pools = {kauflandpezinok: mysql.createPool({
    connectionLimit : 100,
    host            : '130.211.194.76',
    user            : 'root',
    password        : 'Bakalarka123',
    database        : 'kauflandpezinok',
}), kauflandpoprad: mysql.createPool({
    connectionLimit : 100,
    host            : '130.211.194.76',
    user            : 'root',
    password        : 'Bakalarka123',
    database        : 'kauflandpoprad',
}), kauflandkosice: mysql.createPool({
    connectionLimit : 100,
    host            : '130.211.194.76',
    user            : 'root',
    password        : 'Bakalarka123',
    database        : 'kauflandkosice',
})};
const POCET_POBOCIEK = 3;

exports.test = () => {
    // Test connection to database
    centrala.getConnection((err, connection) => {
        if(err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);
        connection.release();
    });
    for(let key in pools) {
        pools[key].getConnection((err, connection) => {
            if(err) throw err; // not connected!
            console.log('Connected as ID ' + connection.threadId);
            connection.release();
        });
    }
}

exports.queryStock = (query, variables, table, callback) => {
    centrala.getConnection((err, connection) => {
        if(err) console.error(err); // not connected!
        console.log('Connected as ID ' + connection.threadId);
        connection.query(query, variables, (err, rows) => {
            // When done with the connection, release it
            connection.release();
            if (!err) {
                if(!rows.length) {
                    return callback(rows);
                }
                let response = {};
                let i = 0;
                for(let row of rows){
                    response[row.ct] = { nazov: row.nazov, ID_typt: row.ID_typt, spolu: 0 };
                }
                for(let key in pools) {
                    pools[key].getConnection((err, connection) => {
                        if(err) console.error(err); // not connected!
                        console.log('Connected as ID ' + connection.threadId);
                        connection.query(`SELECT * FROM ${table} WHERE ct IN (${mysql.escape(Object.keys(response), true)})`, (err, rows) => {
                            connection.release();
                            if (!err) {
                                for(let row of rows){
                                    response[row.ct][key] = row.mnozstvo;
                                    response[row.ct].spolu += row.mnozstvo;
                                }
                                i++;
                                if(POCET_POBOCIEK === i){
                                    callback(response);
                                }
                            }
                            else {
                                console.error(err);
                            }
                            console.log(`The data from ${table} table: \n`, rows);
                        });
                    });
                }
            } else {
                console.error(err);
            }
            console.log(`The data from ${table} table: \n`, rows);
        });
    });
}

exports.query = (query, variables, table, callback) => {
    centrala.getConnection((err, connection) => {
        if(err) console.error(err); // not connected!
        console.log('Connected as ID ' + connection.threadId);
        connection.query(query, variables, (err, rows) => {
            // When done with the connection, release it
            connection.release();
            if (!err) {
                callback(rows);
            } else {
                console.error(err);
            }
            console.log(`The data from ${table} table: \n`, rows);
        });
    });
}

exports.queryAll = (db, query, variables, defaultVariables, table, callback) => {
    let response = {};
    let i = 0;
    for(let key in pools) {
        pools[key].getConnection((err, connection) => {
            if(err) console.error(err); // not connected!
            console.log('Connected as ID ' + connection.threadId);
            let handler = (err, rows) => {
                // When done with the connection, release it
                connection.release();
                if (!err) {
                    response[key] = rows;
                    i++;
                    if(POCET_POBOCIEK === i){
                        callback(response);
                    }
                } else {
                    console.error(err);
                }
                console.log(`The data from ${table} table: \n`, rows);
            }
            if(db == key){
                connection.query(query, variables, handler);
            }
            else{
                connection.query(query, defaultVariables, handler);
            }
        });
    }
}