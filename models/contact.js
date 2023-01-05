// require mongoose module for mongoose connection
const mongoose = require('mongoose');
const contact_us = mongoose.model('contact_us');

/*
 * @params {contact_data} -> data to save
 * @return success or failure
 */
exports.save = function (contact_data, callback) {
    process.nextTick(function () {
        // add cms
        var new_contact_req = new contact_us(contact_data);
        new_contact_req.save(function (error, data) {
            if (!error) {
                callback(null, {status: 1, message: 'success', data: data});
            } else {
                if (error.errors) {
                    callback(null, {status: 2, message: error.errors});
                } else {
                    callback(null, {status: 0, message: error.message});
                }
            }
        });
    });
};

exports.count = (query) => {
   
    return new Promise((resolve,reject) => {
        contact_us.count(query).exec((error, data) => {
            if (!error) {
               
                resolve({status: 1, message: 'success', data: data});
            } else {
             
                resolve({status: 0, message: error.message});
            }
        })
    });
};     

exports.find_count = (query) => {
    return new Promise((resolve,reject)=> {
        contact_us.count(query, (error, data) => {
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
exports.find_with_pagination_projection = (query, sort_condition, skip, limit, options,population) => {
    return new Promise((resolve,reject) => {
        contact_us.find(query).sort(sort_condition)
        .populate(population)
                .skip(skip).limit(limit).paginate(options,(error, data) => {
            if (!error) {
                if (data.length !== 0) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: 'success', data: data});
                } else {
                    resolve({status: 2, message: 'Contact not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
}
exports.aggregate = function (aggregate_query) {
 
    return new Promise((resolve,reject) => {
        contact_us.aggregate(aggregate_query, (error, data) => {
          
            if (!error) {
                data = JSON.parse(JSON.stringify(data));
                resolve({status: 1, message: "success", data: data});
            } else {
                resolve({status: 0, message: error.message});
            }
        })
    })
};
exports.findOne_population = (query, populate_query) => {
    return new Promise((resolve,reject) => {      
        contact_us.findOne(query).populate(populate_query).exec(function (error, data) {
            if (!error) {
                if (data !== null) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve( {status: 1, message: 'success', data: data});
                } else {
                    resolve( {status: 2, message: 'Query not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.remove = (query) => {
    return new Promise((resolve,reject)=> {
        contact_us.remove(query, (error, data) => {
            if (!error) {
                resolve({ status: 1, message: "success" });
            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};

exports.update = (query, update_data) =>{
    return new Promise((resolve,reject)=> {
        contact_us.update(query, update_data, { multi: true }, (error, data) => {
            if (!error) {
                if (data.nModified > 0) {
                    resolve({ status: 1, message: "success" });
                } else {
                    resolve({ status: 0, message: "Query data could not update" });
                }
            } else {
                resolve({ status: 0, message: error.message });
            }
        });
    });
};