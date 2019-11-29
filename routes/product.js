const router = require('express').Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');

// Input validation package
// https://www.npmjs.com/package/validator
const validator = require('validator');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed

// for json path - Tell MS SQL to return results as JSON 
const SQL_SELECT_ALL = 'SELECT * FROM dbo.Product ORDER BY ProductName ASC for json path;';

// for json path, without_array_wrapper - use for single json result
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.Product WHERE ProductId = @id for json path, without_array_wrapper;';

// for json path, without_array_wrapper - use for single json result
const SQL_SELECT_BY_CATID = 'SELECT * FROM dbo.Product WHERE CategoryId = @id ORDER BY ProductName ASC for json path;';

// Second statement (Select...) returns inserted record identified by ProductId = SCOPE_IDENTITY()
const SQL_INSERT = 'INSERT INTO dbo.Product (CategoryId, ProductName, ProductDescription, ProductStock, ProductPrice) VALUES (@categoryId, @productName, @productDescription, @ProductStock, @ProductPrice); SELECT * from dbo.Product WHERE ProductId = SCOPE_IDENTITY();';
const SQL_UPDATE = 'UPDATE dbo.Product SET CategoryId = @categoryId, ProductName = @productName, ProductDescription = @productDescription, ProductStock = @ProductStock, ProductPrice = @ProductPrice WHERE ProductId = @id; SELECT * FROM dbo.Product WHERE ProductId = @id;';
const SQL_DELETE = 'DELETE FROM dbo.Product WHERE ProductId = @id;';


// GET listing of all products
// Address http://server:port/product
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
    const productId = req.params.id;

    // Validate input - important as a bad input could crash the server or lead to an attack
    // See link to validator npm package (at top) for doc.
    // If validation fails return an error message
    if (!validator.isNumeric(productId, { no_symbols: true })) {
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
            .input('id', sql.Int, productId)
            // execute query
            .query(SQL_SELECT_BY_ID);

        // Send response with JSON result    
        res.json(result.recordset[0])

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});

// GET products by category id
// id passed as parameter via url
// Address http://server:port/product/:id
// returns JSON
router.get('/bycat/:id', async (req, res) => {

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
            .query(SQL_SELECT_BY_CATID);

        // Send response with JSON result    
        res.json(result.recordset[0])

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});

// POST - Insert a new product.
// This async function sends a HTTP post request
router.post('/', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate - this string, inially empty, will store any errors
    let errors = "";

    // Make sure that category id is just a number - note that values are read from request body
    const categoryId = req.body.categoryId;
    if (!validator.isNumeric(categoryId, {no_symbols: true})) {
        errors+= "invalid category id; ";
    }
    // Escape text and potentially bad characters
    const productName = validator.escape(req.body.productName);
    if (productName === "") {
        errors+= "invalid productName; ";
    }
    const productDescription = validator.escape(req.body.productDescription);
    if (productDescription === "") {
        errors+= "invalid productDescription; ";
    }
    // Make sure that category id is just a number
    const productStock = req.body.productStock;
    if (!validator.isNumeric(productStock, {no_symbols: true})) {
        errors+= "invalid productStock; ";
    }
    // Validate currency
    const productPrice = req.body.productPrice;
    if (!validator.isCurrency(productPrice, {allow_negatives: false})) {
        errors+= "invalid productPrice; ";
    }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }

    // If no errors, insert
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set named parameter(s) in query
            .input('categoryId', sql.Int, categoryId)    
            .input('productName', sql.NVarChar, productName)
            .input('productDescription', sql.NVarChar, productDescription)
            .input('productStock', sql.Int,  productStock)
            .input('productPrice', sql.Decimal, productPrice)
            // Execute Query
            .query(SQL_INSERT);      
    
        // If successful, return inserted product via HTTP   
        res.json(result.recordset[0]);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
    
});

// PUT update product
// Like post but productId is provided and method = put
router.put('/:id', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate input values (sent in req.body)
    let errors = "";
    const productId = req.params.id;
    if (!validator.isNumeric(productId, {no_symbols: true})) {
        errors+= "invalid product id; ";
    }
    const categoryId = req.body.categoryId;
    if (!validator.isNumeric(categoryId, {no_symbols: true})) {
        errors+= "invalid category id; ";
    }
    const productName = validator.escape(req.body.productName);
    if (productName === "") {
        errors+= "invalid productName; ";
    }
    const productDescription = validator.escape(req.body.productDescription);
    if (productDescription === "") {
        errors+= "invalid productDescription; ";
    }
    const productStock = req.body.productStock;
    if (!validator.isNumeric(productStock, {no_symbols: true})) {
        errors+= "invalid productStock; ";
    }
    const productPrice = req.body.productPrice;
    if (!validator.isCurrency(productPrice, {allow_negatives: false})) {
        errors+= "invalid productPrice; ";
    }

    // If errors send details in response
    if (errors != "") {
        // return http response with  errors if validation failed
        res.json({ "error": errors });
        return false;
    }

    // If no errors
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            // set parameters
            .input('id', sql.Int, productId)   
            .input('categoryId', sql.Int, categoryId)    
            .input('productName', sql.NVarChar, productName)
            .input('productDescription', sql.NVarChar, productDescription)
            .input('productStock', sql.Int,  productStock)
            .input('productPrice', sql.Decimal, productPrice)
            // run query
            .query(SQL_UPDATE);      
    
        // If successful, return updated product via HTTP    
        res.json(result.recordset[0]);

        } catch (err) {
        res.status(500)
        res.send(err.message)
        }
   
});

// DELETE single task.
router.delete('/:id', passport.authenticate('jwt', { session: false}),
async (req, res) => {

    // Validate
    const productId = req.params.id;

    // If validation fails return an error message
    if (!validator.isNumeric(productId, { no_symbols: true })) {
        res.json({ "error": "invalid id parameter" });
        return false;
    }
    
    // If no errors try delete
    try {
        // Get a DB connection and execute SQL
        const pool = await dbConnPoolPromise
        const result = await pool.request()
            .input('id', sql.Int, productId)
            .query(SQL_DELETE);      
    

        const rowsAffected = Number(result.rowsAffected);

        let response = {"deletedId": null}

        if (rowsAffected > 0)
        {
            response = {"deletedId": productId}
        }

        res.json(response);

        } catch (err) {
            res.status(500)
            res.send(err.message)
        }
});

module.exports = router;
