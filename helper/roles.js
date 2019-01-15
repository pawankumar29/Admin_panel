var mongoose = require("mongoose");
var role_model = mongoose.model("roles");
let roles = {};
role_model.find({status: 1, is_deleted: 0}, function (err, data) {
    if (err) {
        console.log("error in loading the roles");
        console.log(err);
    } else {
        data.forEach(obj => {
            roles[obj.name] = obj._id;
        });
    }

});
module.exports = roles;

