const User = require('../models/user.model');

//Simple version, without validation or sanitation
exports.signup = function (req, res) {
    // res.send('Greetings from the Test controller!');

    let user = new User(
        {
            name: req.body.name,
        }
    );

    user.save(function (err) {
        if (err) {
            console.log('Error',err);
            return;
        }
        res.send('Product Created successfully')
    })
};

exports.user_details=function(req,res){
    User.findById(req.params.id, function (err, product) {
        if (err){
            console.log('Error',err);
        }
        res.send(product);
    })
}

exports.user_update=function(req,res){
    User.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, product) {
        if (err){
            console.log('Error for update profile',err);
        }
        res.send('Product udpated.');
    });
}

exports.user_delete=function(req,res){
    User.findByIdAndRemove(req.params.id, function (err) {
        if (err){
            console.log('Error',err);
        }
        res.send('Deleted successfully!');
    })
}