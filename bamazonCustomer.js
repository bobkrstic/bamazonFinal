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
	//console.log("Connected as id: " + connection.threadId);
	//console.log("Connection successful");
	start();
})


// this will start the program and present the initial choices to the user
var start = function() {
	console.log("\nWELCOME TO THE CONSUMER SIDE OF BAMAZON\n");

	inquirer.prompt([

	{
		name: "startChoice",
		type: "rawlist",
		message: "What would you like to do today?",
		choices: ["View items for sale", "Buy Something", "Exit"]
	}

	]).then(function(answer){
		switch (answer.startChoice) {
	        case "View items for sale":
	          displayAllProducts();
	          break;

	        case "Buy Something":
	          askTheConsumer();
	          break;

	        case "Exit":
	          exitFunction();
	          break;
	      }
	})
}


// displaying all products for user to choose from
var displayAllProducts = function() {
	//console.log("TEST");
	var query = "SELECT * FROM products";
	connection.query(query,function(err,res){
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
				+ res[i].price);
		}
		console.log("\n-------------------");
		//askTheConsumer(tableData);
		// once you displayed all the products go back to start
		start();
	})
}


// prompt the consumer what they would like to buy and what amount
var askTheConsumer = function() {

		var query = "SELECT * FROM products";
		connection.query(query,function(err,res){
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
					+ res[i].price);
			}

		console.log("\n------------------------------\n");

		// now prompt the user with choices, to choose the particular item and quantity
		inquirer.prompt([

		{
			name: "itemIdNumber",
			type: "input",
			message: "Which item would you like to buy?\nType the item id [1] or [2] etc, and then press [return]",
			validate: function(value){
					if(isNaN(value)==false && value <= tableData.length && value > 0) {
						return true;
					} else {
						return false;
				}
			}
		},
		{
			name: "numberOfItemsToBuy",
			type: "input",
			message: "\nHow many of these items would you like to purchase?",
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
				var chosenItem = tableData[answer.itemIdNumber - 1];
				// get the inventory from the table
				var amountAvailable = chosenItem.stock_quantity;
				// console log this object for testing purposes only
				console.log(JSON.stringify(chosenItem, null, 4));

				// test if there is anough amount available
			 if (chosenItem.stock_quantity > 0 && chosenItem.stock_quantity >= answer.numberOfItemsToBuy) {
							
								console.log("\nOnly: " + amountAvailable + " left in the store.");
								// calculate total amount of money that consumer 
								// should pay, multiplying number of items and price for a given item
								var total = chosenItem.price * answer.numberOfItemsToBuy;
								console.log("Item: " + chosenItem.product_name
								          + " -----  Quantity: " + answer.numberOfItemsToBuy
								          + "\nTotal: $" + total);

								// now call this function and update the inventory
								updateTheInventory(chosenItem.item_id, amountAvailable, answer.numberOfItemsToBuy);
			 } 
			   else {
				console.log("\nSorry, insuficient quantity..." + amountAvailable + " left in the store.");
				console.log("\nPlease edit your order!\n");
				//console.log(tableData);
				askTheConsumer(tableData);
			}
		})
	})
}


// this function will update the inventory/deduct the number of items from the table
var updateTheInventory = function(itemId, itemsAvailable, itemsBought) {
	var newAmountAfterPurchase = itemsAvailable - itemsBought;
	console.log("\nThis is our new inventory: " + newAmountAfterPurchase);

	console.log("\nUpdating our inventory...\n");
  	var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newAmountAfterPurchase
      },
      {
        item_id: itemId
      }
    ],
    function(err, res) {
      console.log(res.affectedRows + " products updated!\n");
      start();
    }
  );
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


		








