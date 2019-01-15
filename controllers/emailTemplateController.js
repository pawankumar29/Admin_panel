const email_template = require('../models/email_template');

//add template pages get
exports.get_add_template = (req, res, next) => {
    try {
        res.render('emailTemplate/addTemplate', { active: 'templatepage', title: 'Add Template' });
    } catch (err) {
        console.log(err);
        res.render('error', { error: err });
    }
}
//get list of template pages
exports.get_templates = (req, res, next) => {
  
    new Promise((resolve, reject) => {
        // make global variable options for paginate method parameter
       var options = {
            perPage:global.pagination_limit,
            delta: global.delta,
            page: 1
        };
        var condition = {};
        var sortCondition = {};

        if (req.query.search_by) {
            if (req.query.search_by.charAt(0) == '+') {
                req.query.search_by = req.query.search_by.slice(1);
            }
            req.query.search_by = req.query.search_by.trim();
            var search_by = new RegExp('.*' + req.query.search_by + '.*', 'i');
            condition.$or = [{ name: search_by }, { subject: search_by }];
        }

        /** ***sorting conditions*****/
        if (req.query.sort_field && req.query.sort_type) {
            if (req.query.sort_field == 'name') {
                sortCondition.name = parseInt(req.query.sort_type);
            }
            if (req.query.sort_field == 'subject') {
                sortCondition.subject = parseInt(req.query.sort_type);
            }
        }

        if (req.query.page) {
            options.page = req.query.page; 
        } 
        else if (req.query.page_no) {
            options.page = req.query.page_no; 
        }
        /** ***skip check*****/
        var skipRecords = options.page - 1;
        // find email_template by name or find all
        email_template.find_with_pagination(condition, sortCondition, options.perPage * skipRecords, options.perPage, options).then((templateData) => {
            if (templateData.status == 1) {
                if (req.query.page | req.query.search) { 
                    res.render('emailTemplate/search', { 
                        response: templateData.data }); 
                }
                else {
                    res.render('emailTemplate/templateList', { response: templateData.data, title: 'Manage E-mail Templates', message: req.flash(), active: 'templatepage' }); 
                }
            } else {
                req.flash('error', templateData.message);
                res.redirect('/emailTemplate');
            }
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        req.flash('error', err.message);
        res.render("error", { error: err });
    });


}


//post template pages 
exports.post_add_template = (req, res, next) => {
    new Promise((resolve, reject) => {
        req.body.name = req.body.name.trim();
        req.body.subject = req.body.subject.trim();
        // add template

        email_template.save(req.body).then((data) => {
            if (data.status == 1) {        
                                req.flash('success', 'template is added');
                                res.redirect('/emailTemplate');
                   
            } else {
                reject({ status: 0, message: data.message });
            }
        }).catch((err) => {
            reject(err);
        })

    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/emailTemplate');
    });
}


//edit get template pages
exports.get_edit_template = (req, res, next) => {
    new Promise((resolve, reject) => {
        let templateDataStore;
        email_template.findOne({ _id: req.query.id }).then((templateData) => {            
            templateDataStore = templateData;
            if (templateData.status == 1) {          
                res.render('emailTemplate/editTemplate', { template: templateDataStore.data, title: 'Edit E-mail Template', active: 'templatepage', page: req.query.page });
            } else {
                req.flash('error', templateData.message);
                res.redirect('/emailTemplate');
            }
        }).catch((err) => {
            reject(err);
        })
    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/emailTemplate');
    });
}

/**edit post template pages */
exports.post_edit_template = (req, res, next) => {
    req.body.name = req.body.name.trim();
    req.body.subject = req.body.subject.trim();
    email_template.update({ _id: req.query.id }, req.body).then((templateData) => {
        if (templateData.status == 1) {
            req.flash('success', 'Template is updated.');
          /*   res.redirect('/emailTemplate/?page_no=' + req.query.page); */
            res.redirect('/emailTemplate');
        } else {
            req.flash('error', templateData.message);
            /* res.redirect('/emailTemplate/?page_no=' + req.query.page); */
            res.redirect('/emailTemplate');
        }

    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/emailTemplate/?page_no=' + req.query.page);
    });

}

