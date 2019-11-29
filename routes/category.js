const router = require('express').Router();

// Input validation package
// https://www.npmjs.com/package/validator
const validator = require('validator');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed

// for json path - Tell MS SQL to return results as JSON 
const SQL_SELECT_ALL = 'SELECT * FROM dbo.Category ORDER BY CategoryName ASC for json path;';

// for json path, without_array_wrapper - use for single json result
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.Category WHERE CategoryId = @id for json path, without_array_wrapper;';


// GET listing of all categories
// Address http://server:port/category
// returns JSON
router.get('/', async (req, res) => {

    // Get a DB connection and execute SQL
    try {
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // execute query
            .query(SQL_SELECT_ALL);
        
        // Send HTTP response.
        // JSON data from MS SQL is contained in first element of the recordset.
        res.json(result.recordset[0]);

      // Catch and send errors  
      } catch (err) {
        res.status(500)
        res.send(err.message)
      }
});

// GET a single product by id
// id passed as parameter via url
// Address http://server:port/product/:id
// returns JSON
router.get('/:id', async (req, res) => {

    // read value of id parameter from the request url
    const categoryId = req.params.id;

    // Validate input - important as a bad input could crash the server or lead to an attack
    // See link to validator npm package (at top) for doc.
    // If validation fails return an error message
    if (!validator.isNumeric(categoryId, { no_symbols: true })) {
        res.json({ "error": "invalid id parameter" });
        return false;
    }

    // If validation passed execute query and return results
    // returns a single product with matching id
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set name parameter(s) in query
            .input('id', sql.Int, categoryId)
            // execute query
            .query(SQL_SELECT_BY_ID);

        // Send response with JSON result    
        res.json(result.recordset)

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});

module.exports = router;
