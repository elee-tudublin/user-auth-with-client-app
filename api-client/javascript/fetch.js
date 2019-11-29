// JavaScript Fetch, see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// The set HTTP headers. These will be used by Fetch when making requests to the api
const HTTP_REQ_HEADERS = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
  });



// Requests will use the GET method and permit cross origin requests
const GET_INIT = { method: 'GET', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors', cache: 'default' };

// Requests will use the GET method and permit cross origin requests
const DELETE_INIT = { method: 'DELETE', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors' };

// Proct API URL
const BASE_URL = `http://localhost:8080/`;


// Asynchronous Function getDataAsync from a url and return
async function getDataAsync(url) {
    // Try catch 
    try {
      // Call fetch and await the respose
      // Initally returns a promise
      const response = await fetch(url, GET_INIT);
  
      // As Resonse is dependant on fetch, await must also be used here
      const json = await response.json();
  
      // Output result to console (for testing purposes) 
      console.log(json);
  
      // Call function( passing he json result) to display data in HTML page
      //displayData(json);
      return json;
  
      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  
  }


 // Asynchronous Function to POST or PUT data to a url
async function postOrPutDataAsync(url, reqBody, reqMethod) {

    // create request object
    const request = {
        method: reqMethod,
        headers: HTTP_REQ_HEADERS,
        credentials: 'include', // important
        mode: 'cors',
        body: reqBody
        };

    // Try catch 
    try {
      // Call fetch and await the respose
      // Initally returns a promise
      const response = await fetch(url, request);
  
      // As Resonse is dependant on fetch, await must also be used here
      const json = await response.json();
  
      // Output result to console (for testing purposes) 
      console.log(json);
  
      // Call function( passing he json result) to display data in HTML page
      //displayData(json);
      return json;
  
      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  
  }

  // Delete
  async function deleteDataAsync(url) {

    // Try catch 
    try {
        // Call fetch and await the respose
        // Initally returns a promise
        const response = await fetch(url, DELETE_INIT);
    
        // As Resonse is dependant on fetch, await must also be used here
        const json = await response.json();
    
        // Output result to console (for testing purposes) 
        console.log(json);
    
        // Call function( passing he json result) to display data in HTML page
        //displayData(json);
        return json;
    
        // catch and log any errors
      } catch (err) {
        console.log(err);
        return err;
      }
  }