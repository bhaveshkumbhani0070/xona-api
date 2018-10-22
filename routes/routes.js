const express = require('express');
const router = express.Router();

// Require the controllers WHICH WE DID NOT CREATE YET!!
const user_controller = require('../controllers/user.controller');


// a simple test url to check that all of our files are communicating correctly.
router.get('/',function(req,res){
     res.send("Welcome to Xona");
})

router.post('/signup', user_controller.signup);
router.get('/send_all_package',user_controller.send_all_package);
router.post('/verifyotp',user_controller.verifyOTP);
router.post('/login',user_controller.login);
router.get('/:id', user_controller.user_details);
router.put('/:id/update', user_controller.user_update)
router.delete('/:id/delete', user_controller.user_delete);

module.exports = router;