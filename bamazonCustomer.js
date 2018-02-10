// This app requires inquirer and mySQL var inquirer = require('inquirer');
var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "bamazon",
});

connection.connect((err) => {
	if (err) {throw err};
	console.log('Connected as ID: ' + connection.threadId);

	displayItems()
	inquirer.prompt([
			{
				type: 'input',
				message: 'Please select the ID of the item you wish to purchase.', // First prompt a question asking for the item whose's id you wish to buy
				name: 'requestID',
			}, {
				type: 'input',
				message: 'How many would you like to buy?', // Second Message is a question that asks for the quantity 
				name: 'requestVol',
			},
		]).then((answer) => {
	// Check to see if there is enough product to meet their request.
		checkQuantity(answer);
		updateItems(answer);
		displayItems();
		});
});

function checkQuantity(answer) {
	// If they have asked for more than the store has, log 'Insufficient quantity!' and prevent the rest of the order
	var query = `SELECT stock_quantity FROM products WHERE id = ${answer.requestID}`
	connection.query(query, (err, res) => {
		if (err) {console.log('cQError\n' + err)};
		if (answer.requestVol > res[0].stock_quantity || res[0].stock_quantity <= 0) {
			console.log('Insufficient Stock! Sorry.')
			connection.end();
			process.exit();
		}
	})
	console.log('Quantity query: ' + query)
}
// Display items in a table
function displayItems() {
	var query = "SELECT * FROM products";
	connection.query(query, (err,res) => {
		if (err) {console.log(err)};
		console.log(JSON.stringify(res));
	})
}

// If the store does have enough of the product, update the new quantity. Then show customer the total cost of purchase.
function updateItems(answer) {

	var query = connection.query(
		"UPDATE products SET `stock_quantity` = `stock_quantity` - ? WHERE ?",
		[
			answer.requestVol,
			{
				id: parseInt(answer.requestID)
			}
		], (err, res) => {
			console.log(res.affectedRows + " items updated!\n")
				
		})
	console.log(query.sql);
}
