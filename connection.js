var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var env = require('./env');
mongoose.Promise = global.Promise;
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
//mongoose.set('debug', true);


var organisationSchema = new Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted
    status: {
        type: Number,
        default: 1
    }, //1 for active,0 for disable
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// defines email_template schemas
var email_template = new Schema({
    type: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: [true, "name is required"]
    },
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: "organisations"
    },
    attribute: {
        type: [String],
        default: ""
    },
    subject: {
        type: String,
        required: [true, "subject is required"]
    },
    content: {
        type: String,
        required: [true, "content is required"]
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});


var notificationSchema = new Schema({
    reference_id: {
        type: String,
        default: ""
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    type: {
        type: Number,
        default: 0
    }, //
    message: {
        type: String
    },
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted
    data: {
        type: Schema.Types.Mixed
    },
    status: {
        type: Number,
        default: 1
    }, //1 for unread,2 for read
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var userSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    roll_no: {
        type: String,
        default: ""
    },
    father_name: {
        type: String,
        default: ""
    },
    qualification: {
        type: String,
        default: ""
    },
    branch: {
        type: String,
        default: ""
    },
    cv: {
        type: String,
        default: ""
    },
    batch: {
        type: Number,
        default: 0
    },
    is_walkin_user: {
        type: Number,
        default: 0
    },
    job_profile: {
        type: String,
        default: ""
    },
    experience: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        match: /^([^@]+?)@(([a-z0-9]-*)*[a-z0-9]+\.)+([a-z0-9]+)$/i
    },
    status: {
        type: Number,
        default: 0
    }, // 0-inactive,1-active
    password: {
        type: String
    },
    phone_no: {
        type: String,
        default: ""
    },
    profile_pic: {
        type: String,
        default: ""
    },
    latest_token: {
        type: String
    },
    dob: {
        type: Date
    },
    temp_email: {
        type: String
    },
    //    test_status: {type: Number, default: 0}, //user not allowed to login when test begin
    otp_code: {
        type: String,
        default: ""
    },
    otp_expiry: Date, // otp expiry is 30 min
    institute_id: {
        type: Schema.Types.ObjectId,
        ref: 'institutes'
    },
    institute_name: {
        type: String,
        default: ""
    },
    //    type: {type: Number, default: 2, enum: [1, 2]}, // 1-admin,2-appuser
    role: {
        type: Schema.Types.ObjectId,
        ref: "roles"
    },
    permissions: {
        type: [Schema.Types.ObjectId]
    },
    //    push_notification: {type: Number, default: 1},
    device_token: {
        type: String,
        default: ""
    },
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: "organisations"
    },
    is_email_verified: {
        type: Number,
        default: 0
    },
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by user
    last_login: {
        type: Number
    },
    device_type: {
        type: Number
    }, //1- android , 2-IOS,
    device_id: {
        type: String,
        default: ""
    },
    app_version: {
        type: String
    },
    theme: {
        type: Number,
        default: 1
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var roleSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    permissions: {
        type: [Schema.Types.ObjectId]
    },
    status: {
        type: Number,
        default: 1
    }, // 0-inactive,1-active     
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var permissionSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    display_name: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        default: 1
    }, // 0-inactive,1-active     
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var instituteSchema = new Schema({
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: "organisations"
    },
    name: {
        type: String,
        default: ""
    },
    po_name: {
        type: String,
        default: ""
    },
    po_email: {
        type: String,
        default: ""
    },
    no_of_students: {
        type: Number,
        default: 0
    },
    qualification: {
        type: [String],
        default: []
    },
    instruction: {
        type: [String],
        default: []
    },
    is_walkin: {
        type: Number,
        default: 0
    },
    resume: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1
    }, // 0-inactive,1-active     
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});


var quizSchema = new Schema({
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: 'organisations'
    },
    institute_id: {
        type: Schema.Types.ObjectId,
        ref: 'institutes'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    batch_year: {
        type: Number,
        default: 0
    },
    end_time: {
        type: Date
    },
    start_time: {
        type: Date
    },
    duration: {
        type: Number,
        default: 100
    }, // in minutes
    status: {
        type: Number,
        default: 1
    }, // 1 for test enable by admin,2 - test started, 3 - test end 
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var questionCategoriesSchema = new Schema({
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: "organisations"
    },
    default: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        default: ""
    },
    sub_category: [{
        _id: {
            type: Schema.Types.ObjectId,
            default: new mongoose.Types.ObjectId
        },
        name: {
            type: String,
            default: ""
        }
    }],
    status: {
        type: Number,
        default: 1
    }, // 0-inactive,1-active     
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var instituteWiseCategoriesSchema = new Schema({
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: "organisations"
    },
    institute_id: {
        type: Schema.Types.ObjectId,
        ref: 'institutes'
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'question_categories'
    },
    sub_category: [{
        sub_category_id: {
            type: Schema.Types.ObjectId,
            ref: 'question_categories'
        },
        number_of_question: {
            type: Number,
            default: 0
        }
    }],
    number_of_question: {
        type: Number,
        default: 0
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    status: {
        type: Number,
        default: 1
    }, // 0-inactive,1-active     
    is_deleted: {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var questionSchema = new Schema({
    organisation_id: { type: Schema.Types.ObjectId, ref: "organisations" },
    "question": { type: String, default: "" },
    "category_id": { type: Schema.Types.ObjectId, ref: 'question_categories' },
    "sub_category_id": { type: Schema.Types.ObjectId, ref: 'question_categories' },
    "image": { type: String, default: "" },
    "options": [
        { "id": { type: String } },
        { "is_correct": { type: Number, default: 0 } },
        { "option": { type: [String], default: "" } },
    ],
    "answer": { type: [String], default: [] },
    "status": { type: Number, default: 1 }, // 0-inactive,1-active     
    "is_deleted": { type: Number, default: 0 }, //1-deleted by admin
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

var quizResultScehma = new Schema({
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: "organisations"
    },
    //    "quiz_id": {type: Schema.Types.ObjectId, ref: 'quiz'},
    "institute_id": {
        type: Schema.Types.ObjectId,
        ref: 'institutes'
    },
    "user_id": {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    "answers": [{
        question_id: {
            type: Schema.Types.ObjectId,
            ref: 'questions'
        },
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'question_categories'
        },
        sub_category_id: {
            type: Schema.Types.ObjectId,
            ref: 'question_categories'
        },
        answer: {
            type: [Number],
            default: []
        },
        is_correct: {
            type: Number,
            default: 0
        },
        marked: {
            type: Number,
            default: 0
        }
    }],
    "category_marks": [{
        category_id: {
            type: Schema.Types.ObjectId,
            ref: 'question_categories'
        },
        marks: {
            type: Number,
            default: 0
        }
    }],
    "sub_category_marks": [{
        sub_category_id: {
            type: Schema.Types.ObjectId,
            ref: 'question_categories'
        },
        marks: {
            type: Number,
            default: 0
        }
    }],
    'interviews': [{
        name: {
            type: String,
            default: ""
        },
        comment: {
            type: String,
            default: ""
        },
        marks: {
            type: Number,
            default: 0
        }
    }],
    "offer_letter_issued": {
        type: Number,
        default: 0
    },
    "placed_status": {
        type: Number,
        default: 0
    },
    "interview_status": {
        type: Number,
        default: 0
    },
    "total_attempted": {
        type: Number,
        default: 0
    },
    "total_marks": {
        type: Number,
        default: 0
    },
    "status": {
        type: Number,
        default: 1
    }, // 1 - for test started, 2 for test end    
    "is_deleted": {
        type: Number,
        default: 0
    }, //1-deleted by admin
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});


var settingSchema = new Schema({
    'secret': {
        type: String,
        default: ""
    },
    'project_name': {
        type: String,
        default: ""
    },
    'copyright_project_name': {
        type: String,
        default: ""
    },
    'pagination_limit': {
        type: Number,
        default: 15
    },
    'delta': {
        type: Number,
        default: 4
    },
    'app_info_email': {
        type: String,
        default: ""
    },
    'admin_email': {
        type: String,
        default: ""
    },
    'smtp': {
        type: Schema.Types.Mixed
    },
    'push_notification': {
        type: Schema.Types.Mixed
    },
    'dateformat': {
        type: String,
        default: ""
    },
    'qualification': {
        type: [String],
        default: []
    },
    'timeformat': {
        type: String,
        default: ""
    },
    'otp_expire_time': {
        type: Number,
        default: 1
    }, // in hours
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var contactUsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    organisation_id: {
        type: Schema.Types.ObjectId,
        ref: 'organisations'
    },
    subject: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        default: 0
    }, //0-unresolved, 1-resolved
    is_deleted: {
        type: Number,
        default: 0
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
contactUsSchema.plugin(mongooseAggregatePaginate);
var password_reset = new Schema({
    email: String,
    reset_token: String,
    expiry: Date // expiry is 30 min
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var cms_page = new Schema({
    name: {
        type: String
    },
    heading: {
        type: String,
        required: [true, 'Please enter Question']
    },
    description: {
        type: String
    },
    type: {
        type: Number,
        default: 0
    }, // 1- pages, 2-faqs
    status: {
        type: Number,
        default: 1
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

var options = {
    useNewUrlParser: true
};


mongoose.model('organisations', organisationSchema);
mongoose.model('email_template', email_template);
mongoose.model('notifications', notificationSchema);
mongoose.model('users', userSchema);
mongoose.model('roles', roleSchema);
mongoose.model('permissions', permissionSchema);
mongoose.model('institutes', instituteSchema);
mongoose.model('question_categories', questionCategoriesSchema);
mongoose.model('institute_categories', instituteWiseCategoriesSchema);
mongoose.model('permissions', permissionSchema);
mongoose.model('questions', questionSchema);
mongoose.model('quiz_result', quizResultScehma);
mongoose.model("quiz", quizSchema);
mongoose.model("contact_us", contactUsSchema);
mongoose.model("settings", settingSchema);
mongoose.model('password_reset', password_reset);
mongoose.model('cms_page', cms_page);



// mongoose runs only on 27017 port
mongoose.connect('mongodb://127.0.0.1:27017/' + env.database.name, options, function(err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connected to ' + env.database.name);
    }
});