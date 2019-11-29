// JavaScript for the product page
//

// CRUD operations 


// Parse JSON
// Create product rows
// Display in web page
function displayProducts(products) {

    // Use the Array map method to iterate through the array of products (in json format)
    // Each products will be formated as HTML table rowsand added to the array
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    // Finally the output array is inserted as the content into the <tbody id="productRows"> element.
  
    const rows = products.map(product => {
      // returns a template string for each product, values are inserted using ${ }
      // <tr> is a table row and <td> a table division represents a column
  
        let row = `<tr>
                <td>${product.ProductId}</td>
                <td>${product.ProductName}</td>
                <td>${product.ProductDescription}</td>
                <td>${product.ProductStock}</td>
                <td class="price">&euro;${Number(product.ProductPrice).toFixed(2)}</td>`
      
        // If user logged in then show edit and delete buttons
        // To add - check user role        
        if (userLoggedIn() === true) {      
            row+= `<td><button class="btn btn-xs" data-toggle="modal" data-target="#ProductFormDialog" onclick="prepareProductUpdate(${product.ProductId})"><span class="oi oi-pencil"></span></button></td>
                   <td><button class="btn btn-xs" onclick="deleteProduct(${product.ProductId})"><span class="oi oi-trash"></span></button></td>`
        }
        row+= '</tr>';

       return row;       
    });
  
    // Set the innerHTML of the productRows root element = rows
    // Why use join('') ???
    document.getElementById('productRows').innerHTML = rows.join('');
  } // end function
  
  
  // load and display categories in a bootstrap list group
  function displayCategories(categories) {
    //console.log(categories);
    const items = categories.map(category => {
      return `<a href="#" class="list-group-item list-group-item-action" onclick="updateProductsView(${category.CategoryId})">${category.CategoryName}</a>`;
    });
  
    // Add an All categories link at the start
    items.unshift(`<a href="#" class="list-group-item list-group-item-action" onclick="loadProducts()">Show all</a>`);
  
    // Set the innerHTML of the productRows root element = rows
    document.getElementById('categoryList').innerHTML = items.join('');
  } // end function
  
  
  // Get all categories and products then display
  async function loadProducts() {
    try {
      const categories = await getDataAsync(`${BASE_URL}category`);
      displayCategories(categories);
  
      const products = await getDataAsync(`${BASE_URL}product`);
      displayProducts(products);
  
    } // catch and log any errors
    catch (err) {
      console.log(err);
    }
  }
  
  // update products list when category is selected to show only products from that category
  async function updateProductsView(id) {
    try {
      const products = await getDataAsync(`${BASE_URL}product/bycat/${id}`);
      displayProducts(products);
  
    } // catch and log any errors
    catch (err) {
      console.log(err);
    }
  }
  
  // When a product is selected for update/ editing, get it by id and fill out the form
  async function prepareProductUpdate(id) {

    try {
        // Get broduct by id
        const product = await getDataAsync(`${BASE_URL}product/${id}`);
        // Fill out the form
        document.getElementById('productId').value = product.ProductId; // uses a hidden field - see the form
        document.getElementById('categoryId').value = product.CategoryId;
        document.getElementById('productName').value = product.ProductName;
        document.getElementById('productDescription').value = product.ProductDescription;
        document.getElementById('productStock').value = product.ProductStock;
        document.getElementById('productPrice').value = product.ProductPrice;
    } // catch and log any errors
    catch (err) {
    console.log(err);
    }
  }

  // Called when form submit button is clicked
  async function addOrUpdateProduct() {
  
    // url
    let url = `${BASE_URL}product`
  
    // Get form fields
    const pId = Number(document.getElementById('productId').value);
    const catId = document.getElementById('categoryId').value;
    const pName = document.getElementById('productName').value;
    const pDesc = document.getElementById('productDescription').value;
    const pStock = document.getElementById('productStock').value;
    const pPrice = document.getElementById('productPrice').value;

    // build request body
    const reqBody = JSON.stringify({
    categoryId: catId,
    productName: pName,
    productDescription: pDesc,
    productStock: pStock,
    productPrice: pPrice
    });

    // Try catch 
    try {
        let json = "";
        // determine if this is an insert (POST) or update (PUT)
        // update will include product id
        if (pId > 0) {
            url+= `/${pId}`;
            json = await postOrPutDataAsync(url, reqBody, 'PUT');
        }
        else {  
            json = await postOrPutDataAsync(url, reqBody, 'POST');
        }
      // Load products
      loadProducts();
      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  // Delete product by id using an HTTP DELETE request
  async function deleteProduct(id) {
        
    if (confirm("Are you sure?")) {
        // url
        const url = `${BASE_URL}product/${id}`;
        
        // Try catch 
        try {
            const json = await deleteDataAsync(url);
            console.log("response: " + json);

            loadProducts();

        // catch and log any errors
        } catch (err) {
            console.log(err);
            return err;
        }
    }
  }

 // Show product button
 function showAddProductButton() {

  let addProductButton= document.getElementById('AddProductButton');

  if (userLoggedIn() === true) {
    addProductButton.style.display = 'block';
  }
  else {
    addProductButton.style.display = 'none';
  }
 }

// show login or logout
showLoginLink();

// Load products
loadProducts();

showAddProductButton();