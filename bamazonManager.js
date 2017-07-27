
var mysql = require("mysql");
var inquirer = require("inquirer");

// create connection with the database using node
// we are creating a connection object for that
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	database: "bamazonDB"
})

connection.connect(function(err){
	console.log("Connection successful");
	promptTheManager();
})



var promptTheManager = function(){
	console.log("\nWELCOME TO THE MANAGER'S MAIN MENU:\n")
	inquirer.prompt([

	{
		name: "managerChoice",
		type: "rawlist",
		message: "What would you like to do:",
		choices: ["View all products for sale", "View low inventory items", "Add to inventory", "Add new product", "Exit"]
	}

	]).then(function(answer){
		console.log(answer.managerChoice);

	      switch (answer.managerChoice) {
	        case "View all products for sale":
	          displayAllProducts();
	          break;

	        case "View low inventory items":
	          lowInventoryItems();
	          break;

	        case "Add to inventory":
	          addToInventory();
	          break;

	        case "Add new product":
	          addNewProduct();
	          break;

	         case "Exit":
	         	exitFunction();
	      }
	})
}


var displayAllProducts = function() {
	//console.log("TEST");
	var query = "SELECT * FROM products";
	connection.query(query,function(err,res) {
		// create variable to hold the table data
		// so we don't encounter scoping issues
		var tableData = res;

		if(err) {
			throw err;
		}
		// displaying all items, the entire table
		// for our testing purposes
		// console.log(res);
		console.log("\n-------------------\n");

		// now displaying all items for consumers
		// with only item_id, product_name and price
		console.log("Current available items for sale: ");
		console.log("\n");
		for (var i=0; i<res.length; i++){
			console.log(res[i].item_id + " | "
				+ res[i].product_name + " | "
				+ res[i].price + " | " + res[i].stock_quantity);
		}
		console.log("\n-------------------\n");
		promptTheManager();
	})
}



// display all low quantity items, lower than 5
var lowInventoryItems = function() {

	var query = "SELECT * FROM products";
	connection.query(query,function(err,res) {

		if(err) {
			throw err;
		}

		console.log("\n-------------------\n");

		// now displaying all items for consumers with low inventory
		console.log("Low inventory items: ");
		console.log("\n");

		// loop through the table and display only low items
		for (var i=0; i<res.length; i++) {

			if (res[i].stock_quantity <= 5) {

				console.log(res[i].item_id + " | "
							+ res[i].product_name + " | "
							+ res[i].price + " | " + res[i].stock_quantity);
			}
		}
		console.log("\n-------------------\n");
		promptTheManager();	
	})
}


// prompt the manager "which item would they like to add quantity to" and the amount
// following their input update the table accordingly. 
var addToInventory = function() {

	var query = "SELECT * FROM products";
	connection.query(query,function(err,res) {

		if(err) {
			throw err;
		}

		console.log("\n-------------------\n");

		// display all items
		console.log("PLEASE CHOOSE THE ITEM TO ADD THE QUANTITY\n");
		listProducts(res);
		console.log("\n-------------------\n");	

	// prompt the manager to choose the item and the quantity to add
	inquirer.prompt([

		{
			name: "itemIdNumber",
			type: "input",
			message: "Which item would you like to update?\nType the item id [1] or [2] etc, and then press [return]",
			validate: function(value){
					if(isNaN(value)==false && value <= res.length && value > 0) {
						return true;
					} else {
						return false;
				}
			}
		},
		{
			name: "numberOfItemsToAdd",
			type: "input",
			message: "\nHow many of these items would you like to add to the current inventory?",
			validate: function(value){
					if(isNaN(value)==false) {
						return true;
					} else {
						return false;
				}
			}
		}

	]).then(function(answer) {

			// store chosen object in a variable chosenItem
			var chosenItem = res[answer.itemIdNumber - 1];
			// get the inventory from the table
			var amountAvailable = chosenItem.stock_quantity;
			// console log this object for testing purposes only
			//console.log(JSON.stringify(chosenItem, null, 4));

	
						
			console.log("\n: " + amountAvailable + " left in the store.");

			// now call this function and update the inventory
			updateTheInventory(chosenItem.item_id, amountAvailable, answer.numberOfItemsToAdd);
	})
	//promptTheManager();
})

}


// this function will update the inventory/deduct the number of items from the table
var updateTheInventory = function(itemId, itemsAvailable, itemsToAdd) {
	var newAmountAfterAddition = parseInt(itemsAvailable) + parseInt(itemsToAdd);

	console.log("\nUpdating our inventory...\n");
  	var query = connection.query(
	    "UPDATE products SET ? WHERE ?",
	    [
	      {
	        stock_quantity: newAmountAfterAddition
	      },
	      {
	        item_id: itemId
	      }
	    ],
	    function(err, res) {
	    	//console.log(res);
	      console.log(res.affectedRows + " products updated!\n");
	      console.log("This is our new inventory: " + newAmountAfterAddition);
	      console.log("\n--------------------------------------------------")
	      promptTheManager();
	    }
  	);
}


// adding a new product, ask the manager for product details and update the table
function addNewProduct() {

	// this will prompt the manager for a new product details
	inquirer.prompt([

	{
		name: "productName",
		type: "input",
		message: "Product name:"
	},
	{
		name: "departmentName",
		type: "input",
		message: "Department name:"
	},
	{
		name: "itemPrice",
		type: "input",
		message: "Item price",
		validate: function(value){
			if(isNaN(value)==false) {
					return true;
				} else {
					return false;
			}
		}
	},
	{
		name: "quantityToAdd",
		type: "input",
		message: "Quantity: ",
		validate: function(value){
			if(isNaN(value)==false) {
					return true;
				} else {
					return false;
			}
		}
	}


	]).then(function(answer) {

		console.log("\nInserting a new product...\n");
		  var query = "INSERT INTO products SET ?";
		  connection.query(query,
		    [{
		      product_name: answer.productName,
		      department_name: answer.departmentName,
		      price: parseFloat(answer.itemPrice),
		      stock_quantity: parseFloat(answer.quantityToAdd)
		    }],
		    function(err, res) {
		    	if (err) throw err;
		      console.log(res.affectedRows + " product inserted!\n");
		      promptTheManager();
		    }
		  );
	 })
	  // logs the actual query being run
	  //console.log(query.sql);
}




var listProducts = function(res) {
	for (var i=0; i<res.length; i++){
		console.log(res[i].item_id + " | "
				+ res[i].product_name + " | "
				+ res[i].price + " | " + res[i].stock_quantity);
	}
}




// call this function when the conumer chooses to exit. 
var exitFunction = function() {
	var query = "SELECT * FROM products";
	connection.query(query,function(err,res){
		// create variable to hold the table data
		// so we don't encounter scoping issues
		var tableData = res;

		if(err) {
			throw err;
		}
	})
	connection.end();
}














































