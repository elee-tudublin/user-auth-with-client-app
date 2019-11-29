const router = require('express').Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// config package used to manage configuration options
const config = require('config');

const keys = config.get('keys');

// Input validation package
// https://www.npmjs.com/package/validator
const validator = require('validator');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed

const SQL_INSERT = "INSERT INTO dbo.AppUser (FirstName, LastName, Email, Password, Role) VALUES (@firstName, @lastName, @email, @password, 'User'); SELECT * from dbo.AppUser WHERE UserId = SCOPE_IDENTITY();";

// authentication will take approximately 13 seconds
// https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
const hashCost = 10;


// POST login.
// Send username and password via request body from a login form, etc.

router.post('/auth', (req, res) => {
  // use passport to athenticate - uses local middleware
  // session false as this API is stateless
  passport.authenticate(
    'local',
    { session: false }, (error, user, info) => {
      // authentication fails - return error
      if (error || !user) {
        res.status(400).json({
          message: info ? info.message : 'Login failed',
          user: user
        });
      }

      // Define the JWT contents - be careful: including email here but is that a good idea?
      const payload = {
        username: user.Email,
        // process.env.JWT_EXPIRATION_MS, 10
        // Set expiry to 30 minutes
        expires: Date.now() + (1000 * 60 * 30),
      };

      //assigns payload to req.user
      req.login(payload, { session: false }, (error) => {
        if (error) {
          res.status(400).send({ error });
        }
        // generate a signed json web token and return it in the response
        const token = jwt.sign(JSON.stringify(payload), keys.secret);

        // add the jwt to the cookie and send
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        res.status(200).send({ "user": user.Email, token });
      });
    },
  )(req, res);
});


//logout
router.get('/logout', async (req, res) => {

  // Get a DB connection and execute SQL
  try {


    // add the jwt to the cookie and send
    res.clearCookie('jwt', {path: '/'});
    return res.status(200).send({"message": "Logged out"});

    // Catch and send errors  
  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
});



// POST - Insert a new user.
// This async function sends a HTTP post request
router.post('/', async (req, res) => {
  // Validate - this string, inially empty, will store any errors
  let errors = "";

  // Make sure that first name is text
  const firstName = req.body.firstName;
  if (!validator.isAlpha(firstName, ['en-GB', 'en-US'])) {
    errors += "invalid frst name; ";
  }
  // Make sure that last name is text
  const lastName = req.body.lastName;
  if (!validator.isAlpha(lastName, ['en-GB', 'en-US'])) {
    errors += "invalid last name; ";
  }
  // validate email
  const email = req.body.email;
  if (!validator.isEmail(email)) {
    errors += "invalid email; ";
  }
  // validate password
  let password = req.body.password;
  // use a regukar expression to check for allowed chars in password
  if (!validator.matches(password, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")) {
    errors += "invalid password; ";
  }


  // If errors send details in response
  if (errors != "") {
    // return http response with  errors if validation failed
    res.json({ "error": errors });
    return false;
  }

  // If no errors, insert
  try {

    const passwordHash = await bcrypt.hash(password, hashCost);

    // Get a DB connection and execute SQL
    const pool = await dbConnPoolPromise
    const result = await pool.request()
      // set named parameter(s) in query
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, passwordHash)
      // Execute Query
      .query(SQL_INSERT);

    // If successful, return inserted product via HTTP   
    res.json(result.recordset[0]);

  } catch (err) {
    res.status(500)
    res.send(err.message)
  }

});

module.exports = router;
