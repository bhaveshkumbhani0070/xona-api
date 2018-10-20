const express = require('express');
const bodyParser = require('body-parser');
// initialize our express app
const routes = require('./routes/routes.js');
const app = express();
let port = 9000;

// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://kumbhanibhavesh:alex9099414492@ds029640.mlab.com:29640/xona';
let mongoDB = dev_db_url || process.env.MONGODB_URI ;
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