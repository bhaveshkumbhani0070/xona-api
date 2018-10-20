const express = require('express');
const bodyParser = require('body-parser');
// initialize our express app
const routes = require('./routes/routes.js');
const app = express();
let port = process.env.PORT || 9000;

// Set up mongoose connection
const mongoose = require('mongoose');
let mongoDB = process.env.MONGODB_URI ;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', routes);

app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});