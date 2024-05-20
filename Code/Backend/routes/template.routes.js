const express = require("express");
const users = express.Router();
const cors = require("cors");
const db = require("../database/config");
const security = require('../database/security');
const path = require('path');
const baseUrl = require('../database/config.json');
const e = require("express");

users.use(cors());
users.use(security.verifyAutheticity);

users.get('/get_all', (req, res) => {
    db.sequelize.query('CALL sp_users_get(:keyword, :page_no, :limit, :sort_column, :sort_type)', {
        type: db.sequelize.QueryTypes.SELECT,
        replacements: {
            keyword: req.body.keyword,
            page_no: req.body.page_no,
            limit: req.body.limit,
            sort_column: req.body.sort_column,
            sort_type: req.body.sort_type
        }
    }).then((data) => {
        res.json({ error: false, data: data });
    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});

users.post('/get_all2', (req, res) => {
    db.sequelize.query('CALL sp_users_get(:keyword, :page_no, :limit, :sort_column, :sort_type)', {
        type: db.sequelize.QueryTypes.SELECT,
        replacements: {
            keyword: req.body.keyword,
            page_no: req.body.page_no,
            limit: req.body.limit,
            sort_column: req.body.sort_column,
            sort_type: req.body.sort_type
        }
    }).then((data) => {
        res.json({ error: false, data: db.MultiQueryResult(data) });
    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});


users.get('/get_per_user', (req, res) => {
    db.sequelize.query('CALL sp_users_get_per_user(:id)', {
        type: db.sequelize.QueryTypes.SELECT,
        replacements: {
            id: req.body.id
        }
    }).then((data) => {
        res.json({ error: false, data: data });
    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});

users.get('/get_per_user_role', (req, res) => {
    db.sequelize.query('CALL sp_users_get_per_role(:user_role_id)', {
        replacements: {
            user_role_id: req.query.user_role_id
        }
    }).then((data) => {
        res.json({ error: false, data: data });
    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});

users.post('/change_password', (req, res) => {
    db.sequelize.query('CALL sp_users_change_password(:id,:new_password)', {
        replacements: {
            id: req.body.user_id,
            new_password: req.body.new_password
        }
    }).then((data) => {
        res.json({ error: false, message: "Changed password successfully." });
    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});

users.delete('/delete', (req, res) => {
    db.sequelize.query('CALL sp_users_delete(:id)', {
        replacements: {
            id: req.query.id
        }
    }).then(data => {
        ret = data[0]["_ret"];
        if (ret === "delete_successful") {
            res.send({ error: false, message: `User successfully deleted.` });
        } else if (ret === "value_not_exist") {
            res.send({ error: true, message: `User not found. Please try again.` });
        } else {
            res.send({ error: true, message: 'Unknown error!' });
        }
    }).catch(err => {
        res.send({ error: true, message: `Error deleting data! ${err}` });
    });
});

users.post('/reset_password', (req, res) => {

    let length = 6,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }

    db.sequelize.query('CALL sp_users_change_password(:id,:new_password)', {
        replacements: {
            id: req.body.user_id,
            new_password: retVal,
        }
    }).then((data) => {

        let text = `Your username & password to https://grandtcondoconnect.com is\nPassword:${retVal}`;
        const respo = db.emailRequest({
            to: data[0]["email"],
            subject: "Your new password",
            text: text,
        });
        res.json({ error: false, message: "Password reset successfully." });

    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});

users.post('/forgot_password', (req, res) => {
    db.sequelize.query('CALL sp_users_forgot_password(:email, :code)', {
        replacements: {
            email: req.body.email,
            code: req.body.code
        }
    }).then(data => {
        let ret = data[0]["_ret"];
        if (ret === "invalid_email") {
            res.send({ error: true, message: `Invalid email '${req.body.email}'!` });
        } else if (ret === "account_inactive") {
            res.send({ error: true, message: `Account is flag inactive!` });
        } else if (ret === "invalid_code") {
            res.send({ error: true, message: `Invalid Code!` });
        } else if (ret === "success_request") {
            let code = data[0]["_code"];
            // send email
            let email_content = `Your GrandTCondoConnect password reset code: ${code}`;
            const respo = db.emailRequest({
                to: req.body.email,
                subject: "Reset Password Code",
                text: email_content,
            });
            res.json({ error: false, message: "Password reset code successfully send.", respo });
        } else if (ret === "success_verify") {
            res.json({ error: false, message: "Code successfully verified." });
        }
        else {
            res.send({ error: true, message: `Unknown Error!` });
        }

    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});


module.exports = users;