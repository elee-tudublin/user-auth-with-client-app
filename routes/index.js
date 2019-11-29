// Import router package
const router = require('express').Router();

/* Hand get requests for '/'
/* this is the index or home page
*/
router.get('/', function (req, res) {

    // set content type of response body in the headers
    res.setHeader('Content-Type', 'application/json');

    // Send a JSON response - this app will be a web api so no need to send HTML
    //res.end(JSON.stringify({message: 'This is the home page'}));
    res.json({content: 'This is the default route.'});

});

// export
module.exports = router;