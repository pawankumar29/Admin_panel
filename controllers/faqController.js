const cms_page = require('../models/cms_page');

//get faqs listing
exports.get_faqs = (req, res, next) => {
    new Promise((resolve, reject) => {
        // make global variable options for paginate method parameter
        var options = {
            perPage:  global.pagination_limit,
            delta: global.delta,
            page: 1
        };
        var condition = { type: 2 };
        var sortCondition = { };
        if (req.query.search_by) {
            req.query.search_by = req.query.search_by.trim();
            //condition.heading = new RegExp("^" + req.query.search_by, "i");
            condition.heading = new RegExp(req.query.search_by, 'i');
        }
        if(req.query.status && req.query.status != "all") {
            condition.status = parseInt(req.query.status)
        }
        if (!req.query.sort_field) {
            sortCondition.created_at = -1;
        }

       
        /** ***pagination check*****/
        if (req.query.page) {
            options.page = req.query.page;
        }

        /** ***skip check*****/
        var skipRecords = options.page - 1;
        // query to fetch list of faqs
        cms_page.find_with_pagination(condition, sortCondition, options.perPage * skipRecords, options.perPage, options).then((result) => {
            if (result.status == 1) {
                if (req.query.page | req.query.search) {
                    res.render('Faqs/search', { response: result.data });
                } else {
                    res.render('Faqs/faqs_list', { title: 'Manage FAQ', response: result.data, active: 'Faqspage', message: req.flash() });
                }
            } else {
                reject({ success: 0, message: result.data.message });
            }
        })

    }).catch((err) => {
        res.render('error', { error: err });
    })
}


//get faq edit page
exports.get_edit_faq = (req, res, next) => {
    new Promise((resolve, reject) => {
        // get page id from url parameters
        var faqsId = req.params.id;
        // fetch and send data to edit
        cms_page.findOne({ '_id': faqsId }).then((faqsData) => {
     
            if (faqsData.status == 1) {
                var flash_message = req.flash();
                res.render('Faqs/edit_faqs', { title: 'Edit FAQ', active: 'Faqspage', faqsId: faqsId, message: flash_message, faqsData: faqsData.data });
            }
            else {
                req.flash("error", faqsData.message)
                res.redirect("/faqs")

            }
        }).catch((err) => {
            reject(err);
        })
    }).catch((err) => {
        res.render('error', { error: err });
    })
}

//post edit faq
exports.post_edit_faq = (req, res, next) => {
    new Promise((resolve, reject) => {
        req.body.description = req.body.faq_description.trim();
        req.body.heading = req.body.heading.trim();

        // query to update faqs data
        req.body.modified_date = new Date();
        cms_page.update({ '_id': req.params.id }, req.body).then((faqsData) => {
            // show validation errors if form data is not valid
            if (faqsData.status == 1) {
                req.flash('success', 'FAQ updated successfully');
                res.redirect('/faqs');
            } else {
                req.flash("error", faqsData.message)
                res.redirect("/faqs")
            }
        });
    }).catch((err) => {
        res.render('error', { error: err });
    })
}

//get add faqs
exports.get_add_faq = (req, res, next) => {
    try {
        // render view add faqs view page
        res.render('Faqs/add_faqs', { title: 'Add FAQ', active: 'Faqspage', message: req.flash() });
    } catch (err) {
        res.render('error', { error: err });
    }

}


//post add faqs
exports.post_add_faq = (req, res, next) => {

    new Promise((resolve, reject) => {
        req.body.description = req.body.faq_description.trim();
        req.body.heading = req.body.heading.trim();

        req.body.type = 2;
        cms_page.save(req.body).then((faqData) => {
            if (faqData.status == 1) {
                req.flash('success', 'FAQ added successfully');
                res.redirect('/faqs');
            }
            else {
                req.flash('error', faqData.message);
                res.redirect('/faqs');
            }
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        res.render('error', { error: err });
    })
}


//delete faqs
exports.delete_faq = (req, res, next) => {

    new Promise((resolve, reject) => {

        var id = req.params.id;
        // delete faq by id
        cms_page.remove({ _id: id }).then((data) => {
            if (data.status == 1) {
                req.flash('success', 'FAQ deleted successfully');
            } else {
                req.flash('error', 'Some error has occurred while deleting FAQ');
            }
            res.redirect('/faqs');
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        res.render('error', { error: err });
    })
}

//change faq status
exports.post_change_status = (req, res, next) => {
    new Promise((resolve, reject) => {
        let msg;
        var id = req.body.id;
        var status = req.body.status;
        if (req.body.status == 0 || req.body.status == 1) {
             cms_page.update({_id: id}, {status: status}).then((data) => {
                if (data.status) {
                    if (req.body.status == 1) {
                        msg = 'FAQ has been activated successfully';
                    } else {
                        msg = 'FAQ has been inactivated successfully';
                    }
                    req.flash('success', msg);
                    res.send({'status': status});
                } else {
                    req.flash('error', 'FAQ status not updated');
                    res.send({'status': 'error'});
                }
            }).catch((err)=>{
                reject(err);
            });
        } else {
            res.send({status: 'not_valid_input', message: 'This status is not valid'});
        }
    }).catch((err) => {
        res.render('error', { error: err });
    })
}

