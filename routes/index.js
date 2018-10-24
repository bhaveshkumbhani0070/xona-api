const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/user.controller');
router.get('/',function(req,res){
    // res.send("Welcome to Xona");
    res.sendfile('views/index.html');
})
router.post('/signup', user_controller.signup);
router.post('/login',user_controller.login);

module.exports = router;