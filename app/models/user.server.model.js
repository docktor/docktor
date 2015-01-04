'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your first name']
    },
    lastName: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your last name']
    },
    displayName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: '',
        validate: [validateLocalStrategyProperty, 'Please fill in your email'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    username: {
        type: String,
        unique: 'testing error message',
        required: 'Please fill in a username',
        trim: true
    },
    password: {
        type: String,
        default: '',
        validate: [validateLocalStrategyPassword, 'Password should be longer']
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    allowGrant: {
        type: Boolean,
        default: false
    },
    groups: [{
        type: Schema.ObjectId,
        ref: 'Group'
    }],
    favorites: [{
        type: Schema.ObjectId,
        ref: 'Group'
    }]
});

/**
 * Hash password before save it.
 */
UserSchema.methods.preparePassword = function () {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
};

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function (err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

/**
 *
 * @param idGroup an ObjectId
 * @returns {Aggregate|Promise}
 */
UserSchema.statics.getUsersOfOneGroup = function (idGroup) {
    var _this = this;
    /*
     Example of result :

     {"_id" : 0,
     "users" : [
     {
     "id" : ObjectId("54861a208d058b859f1d83c8"),
     "username" : "user",
     "email" : "user@user.fr",
     "displayName" : "user user"
     }]
     }
     */
    return _this.aggregate([
        {'$match': {'groups': {'$in': [idGroup]}}},
        {
            '$group': {
                '_id': 0,
                'users': {
                    '$addToSet': {
                        'id': '$_id',
                        'username': '$username',
                        'email': '$email',
                        'displayName': '$displayName'
                    }
                }
            }
        }
    ]);
};

mongoose.model('User', UserSchema);
module.exports = mongoose.model('User', UserSchema);
