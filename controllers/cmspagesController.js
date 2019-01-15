const cms_page = require('../models/cms_page');

//get add cms pages
exports.get_add_cms_pages = (req, res, next) => {
    try {
        res.render('cms/add_cms', { active: 'cmspage', title: 'Add CMS Page' });
    } catch (err) {
        console.log(err);
        res.render('error', { error: err });
    }
}

//get list of cms pages
exports.get_cms_pages = (req, res, next) => {

    new Promise((resolve, reject) => {
        // make global variable options for paginate method parameter
     var options = {
            perPage: 10,
            delta: 3,
            page: 1
        };
        var condition = { type: 1 };
        var sortCondition = { _id: -1 };
        
        if (req.query.search_by) {
            //condition.heading = new RegExp("^" + req.query.search_by, "i");
            let heading_expr = new RegExp(req.query.search_by, 'i');
           let name_expr = new RegExp(req.query.search_by, 'i');
            req.query.search_by = req.query.search_by.trim();
            condition.$or = [
                { name: name_expr },
                { heading: heading_expr }
            ];
        }
        if (req.query.sort_field && req.query.sort_type) {
            if (req.query.sort_field === 'name') {
                sortCondition = { name: parseInt(req.query.sort_type) };
            }

            if (req.query.sort_field === 'heading') {
                sortCondition = { heading: parseInt(req.query.sort_type) };
            }
        }

        /** ***pagination check*****/
        if (req.query.page) {
            options.page = req.query.page;
        }

        /** ***skip check*****/
        var skipRecords = options.page - 1;
        // find email_pages by name or find all
        cms_page.find_with_pagination(condition, sortCondition, options.perPage * skipRecords, options.perPage, options).then((cmspageData) => {
            
            if (cmspageData.status == 1) {
                if (req.query.page | req.query.search) {
                    res.render('cms/search', { response: cmspageData.data });
                } else {
                    res.render('cms/list_cms', { response: cmspageData.data, title: 'Manage CMS Pages', message: req.flash(), active: 'cmspage' });
                }
            } else {
                req.flash('error', cmspageData.message);
                res.redirect('/pages');
            }
        });

    }).catch((err) => {
            req.flash('error', err.message);
            res.redirect('/pages');
        });

}

//delete cms pages
exports.delete_cms_pages = (req, res, next) => {
    new Promise((resolve, reject) => {
        var id = req.params.id;
        // delete faq by id
        cms_page.remove({ _id: id }).then((data) => {
            if (data.status == 1) {
                req.flash('success', 'CMS page deleted successfully');
            } else {
                req.flash('error', 'Some error has occurred while deleting CMS page');
            }
            res.redirect('/pages');
        }).catch((err) => {
            reject(err);
        })
    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/pages');
    })
}

/**get Edit cms pages */
exports.get_edit_cms_pages = (req, res, next) => {
    new Promise((resolve, reject) => {
        cms_page.findOne({ _id: req.params.id }).then((pageData) => {
          
            if (pageData.status == 1) {
                res.render('cms/editcms', { pages: pageData.data, title: 'Edit Cms-Page', active: 'cmspage' });
            }
            else {
                req.flash('error', pageData.message);
                res.redirect('/pages');
            }
        }).catch((err) => {
            reject(err);
        })


    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/pages');
    })
}

/**post Edited cms pages */
exports.post_edit_cms_pages = (req, res, next) => {
    new Promise((resolve, reject) => {
        var id = req.params.id;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            req.body.description = req.body.cms_description.trim();
            req.body.name = req.body.name.trim();
            req.body.heading = req.body.heading.trim();
            // Yes, it's a valid ObjectId, proceed with `findById` call.
            cms_page.update({ _id: id }, req.body).then((pagedata) => {
                if (pagedata.status == 1) {
                    req.flash('success', 'CMS page is updated');
                    res.redirect('/pages');
                } else {
                    req.flash('error', pagedata.message);
                    res.redirect('/pages');
                }

            }).catch((err) => {
                reject(err);
            })

        } else {
            res.redirect('/pages');
        }
    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/pages');
    });
}

//post cms pages 
exports.post_cms_pages = (req, res, next) => {
    new Promise((resolve, reject) => {
        req.body.created_at = new Date();
        req.body.description = req.body.cms_description.trim();
        req.body.name = req.body.name.trim();
        req.body.heading = req.body.heading.trim();
        req.body.type = 1;
        // add cms

        cms_page.save(req.body).then((data) => {
            if (data.status == 1) {
                req.flash('success', 'CMS Page is added');
                res.redirect('/pages');
            } else {
                req.flash('error', data.message);
                res.redirect('/pages');
            }

        }).catch((err) => {
            reject(err);
        });
    }).catch((err) => {
        req.flash('error', err.message);
        res.redirect('/pages');
    });
}