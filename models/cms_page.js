// require mongoose module for mongoose connection
var mongoose = require('mongoose');
var cms_page = mongoose.model('cms_page');


exports.find_with_pagination = (query, sort_condition, skip, limit, options) => {
    return new Promise((resolve,reject) => {
        cms_page.find(query).sort(sort_condition)
                .skip(skip).limit(limit).paginate(options,(error, data) => {
            if (!error) {
                if (data.length !== 0) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: 'success', data: data});
                } else {
                    resolve({status: 2, message: 'Faq not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};


exports.findOne = (query) => {
    return new Promise((resolve,reject) =>{
        cms_page.findOne(query, (error, data) => {
             if (!error) {
                 if (data !== null) {
                     data = JSON.parse(JSON.stringify(data));
                     resolve( { status: 1, message: "success", data: data });
                 } else {
                     resolve({ status: 0, message: "faq not found" });
                 }
             } else {
                 resolve({ status: 0, message: error.message });
             }
         });
     })
           
 };



 exports.update = (query, update_data) => {
    return new Promise((resolve,reject) =>{
        cms_page.update(query, update_data, {multi: true}, function (error, data) {
            if (!error) {
                if (data.nModified > 0) {
                    resolve({status: 1, message: 'success'});
                } else {
                    resolve({status: 2, message: 'cms_page data could not update'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};


 exports.save = (booking_data) => {
    return new Promise((resolve,reject) =>{
        var new_cms_page = new cms_page(booking_data);
        new_cms_page.save(function (error, data) {
            if (!error) {
                resolve( {status: 1, message: 'success', data: data});
            } else {
                if (error.errors) {
                    console.log('error.errors');
                    console.log(error.errors);
                    resolve({status: 2, message: 'Invalid values'});
                } else {
                    resolve({status: 0, message: error.message});
                }
            }
        });
    });
};

//remove record
exports.remove = (query) => {
    return new Promise((resolve,reject)=> {
        cms_page.remove(query, (error, data) => {
            if (!error) {
                resolve({ status: 1, message: "success" });
            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};

