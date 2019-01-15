

// require mongoose module for mongoose connection
var mongoose = require('mongoose');
var notification = mongoose.model('notifications');



exports.findOne = (query, projection) => {
    return new Promise((resolve,reject) =>{
        notification.findOne(query, projection, (error, data) => {
             if (!error) {
                 if (data !== null) {
                     data = JSON.parse(JSON.stringify(data));
                     resolve( { status: 1, message: "success", data: data });
                 } else {
                     resolve({ status: 0, message: "notification not found" });
                 }
             } else {
                 resolve({ status: 0, message: error.message });
             }
         });
     })           
 };
 exports.count = (query) => {
    return new Promise((resolve,reject)=> {
        notification.count(query, (error, data) => {
            if (!error) {
                if (data[0] !== null) {
                    resolve({ status: 1, message: "success", data: data });
                } else {
                    resolve( { status: 0, message: "Match not found" });
                }
            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};

exports.aggregate = (aggregate_query) => {
    return new Promise((resolve,reject)=> {
        notification.aggregate(aggregate_query, (error, data) => {
            if (!error) {
                data = JSON.parse(JSON.stringify(data));
               resolve( { status: 1, message: "success", data: data });

            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};
exports.find_with_update = (query, update_data) =>{
    return new Promise((resolve,reject)=> {
        notification.findOneAndUpdate(query, {$set: update_data},{returnNewDocument: true}, (error, data) => {

            if (!error) {
                if (data) {
                    resolve({ status: 1, message: "success",data: data });
                } else {
                    resolve({ status: 0, message: "notification data could not update" });
                }
            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};

exports.update_many = (query, update_data) =>{
    return new Promise((resolve,reject)=> {
        notification.updateMany(query, update_data, (error, data) => {           
             
            if (!error) {
                if (data.nModified > 0) {
                    resolve({ status: 1, message: "success" });
                } else {
                    resolve({ status: 0, message: "notification data could not update" });
                }
            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};
exports.find_population = (query,projection, populate_query,sort) => {
    return new Promise((resolve,reject) => {      
        notification.find(query,projection).populate(populate_query).sort(sort).exec(function (error, data) {
            if (!error) {
                if (data !== null) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve( {status: 1, message: 'success', data: data});
                } else {
                    resolve( {status: 2, message: 'notification not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

