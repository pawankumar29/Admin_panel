
"use strict";
const mongoose = require("mongoose");
const user = mongoose.model("users");


exports.findOne = (query, projection) => {
    return new Promise((resolve, reject) => {
        user.findOne(query, projection, (error, data) => {
            if (!error) {
                if (data !== null) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 0, message: "User not found"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    })
    
};
exports.findOne_population = (query, populate_data) => {
    return new Promise((resolve, reject) => {
        user.findOne(query).populate(populate_data).exec((error, data) => {
            if (!error) {
                if (data.length !== 0) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 2, message: "Users not found"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
        
    })
    
};

exports.aggregate = (aggregate_query) => {
    return new Promise((resolve, reject) => {
        user.aggregate(aggregate_query, (error, data) => {
            if (!error) {
                data = JSON.parse(JSON.stringify(data));
                resolve({status: 1, message: "success", data: data});
                
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.find = (query, projection) => {
    return new Promise((resolve, reject) => {
        user.find(query, projection, (error, data) => {
            if (!error) {
                if (data) {
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 0, message: "Users not found"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};


exports.find_pagination = (query, projection, skip, limit) => {
    return new Promise((resolve, reject) => {
        user.find(query, projection).skip(skip).limit(limit).exec((error, data) => {
            if (!error) {
                if (data) {
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 0, message: "Users not found"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.find_pagination_sort = (query, projection, skip, limit, sort) => {
    return new Promise((resolve, reject) => {
        user.find(query, projection).skip(skip).limit(limit).sort(sort).exec((error, data) => {
            if (!error) {
                if (data) {
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 0, message: "Users not found"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};
exports.save = (user_data) => {
    return new Promise((resolve, reject) => {
        var new_user = new user(user_data);
        new_user.save((error, data) => {
            if (!error) {
                data = JSON.parse(JSON.stringify(data));
                resolve({status: 1, message: "success", data: data});
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.update = (query, update_data) => {
    return new Promise((resolve, reject) => {
        user.update(query, update_data, {multi: true}, (error, data) => {
            console.log(data);
            if (!error) {
                if (data) {
                    resolve({status: 1, message: "success"});
                } else {
                    resolve({status: 0, message: "Users data could not update"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.findOneAndUpdate = (query, update_data) => {
    return new Promise((resolve, reject) => {
        user.findOneAndUpdate(query, update_data, {new : true}, (error, data) => {
            if (!error) {
                if (data !== null) {
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 0, message: "Users data could not update"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

//remove record
exports.remove = (query) => {
    return new Promise((resolve, reject) => {
        user.remove(query, (error, data) => {
            if (!error) {
                resolve({status: 1, message: "success"});
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.count = (query) => {
    return new Promise((resolve, reject) => {
        user.count(query, (error, data) => {
            if (!error) {
                if (data[0] !== null) {
                    resolve({status: 1, message: "success", data: data});
                } else {
                    resolve({status: 0, message: "Match not found"});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.find_count = (query) => {
    return new Promise((resolve, reject) => { 
        // query.is_deleted = 0;
        user.find(query).count().exec((error, data) => {
            if (!error) {
                resolve({status: 1, message: 'success', data: data});
            } else {
                resolve({status: 0, message: error.message});
            }
        }).catch(err => reject(err));
    });
};

exports.find_with_pagination_projection = (query, projection, population, sort_condition, skip, limit, options) => {
    return new Promise((resolve, reject) => {
        user.find(query, projection).sort(sort_condition)
                .populate(population)
                .skip(skip).limit(limit).paginate(options, (error, data) => {
            if (!error) {
                if (data.length !== 0) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: 'success', data: data});
                } else {
                    resolve({status: 2, message: 'Users not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    });
};

exports.find_with_projection = (query, projection) => {
    return new Promise((resolve, reject) => {
        query.is_deleted = 0;
        query.type = 2;
        user.find(query, projection, (error, data) => {
            if (!error) {
                if (data.length !== 0) {
                    data = JSON.parse(JSON.stringify(data));
                    resolve({status: 1, message: 'success', data: data});
                } else {
                    resolve({status: 2, message: 'Users not found'});
                }
            } else {
                resolve({status: 0, message: error.message});
            }
        });
    }).catch(err => { // catch errors
        return Promise.resolve({status: 0, message: err.message});
    });
};


