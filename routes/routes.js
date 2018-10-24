const express = require('express');
const router = express.Router();


// Require the controllers WHICH WE DID NOT CREATE YET!!
const user_controller = require('../controllers/user.controller');


// a simple test url to check that all of our files are communicating correctly.
router.get('/',function(req,res){
     res.send("Welcome to Xona");
})

// Users

router.post('/send_otp',user_controller.send_Otp);
router.post('/send_all_package',user_controller.send_all_package);
router.post('/verifyotp',user_controller.verifyOTP);
router.put('/update_user', user_controller.update_user);
router.post('/user_approve',user_controller.user_approve);

router.get('/:id', user_controller.user_details);
router.delete('/:id/delete', user_controller.user_delete);

// Reports

router.get('/today_report/:id',user_controller.get_today_report);

module.exports = router;