const express = require('express');
const apiRouter=express.Router();
var jwt = require("jsonwebtoken");
const config=require(__dirname+"/config.json");

const bodyParser = require('body-parser');
// initialize our express app
const routes = require('./routes/routes.js');
const index=require('./routes/index.js');

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
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


apiRouter.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.json({ "code": 200, "status": "Error", "message": "Failed to authenticate token" });
            } else {
                console.log('decoded',decoded);
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.json({ "code": 200, "status": "Error", "message": "No token provided" });
    }
});


app.use('/api',apiRouter);
app.use('/api', routes);
app.use('/', index);


app.use("/js", express.static(__dirname + '/views/js'));
app.use("/css", express.static(__dirname + '/views/css'));
app.use("/img", express.static(__dirname + '/views/img'));
app.use("/lib", express.static(__dirname + '/views/lib'));
app.use("/contactform", express.static(__dirname + '/views/contactform'));


app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});