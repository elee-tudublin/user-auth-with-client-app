// Connect to MS SQL database and make a connection pool available
let sql = require('mssql');

// config package used to manage configuration options
const config = require('config');

// Setup the Database Connection
// config is used to read values from the connection section of /config/default.json
let dbConnPoolPromise = new sql.ConnectionPool(config.get('connection'))
        .connect()
        .then(pool => {
        console.log('Connected to MSSQL DB')
        return pool
        })
        .catch(err => console.log('Database Connection Failed - error: ', err))

// export the sql and connection pool objects
module.exports = {
    sql, dbConnPoolPromise
};