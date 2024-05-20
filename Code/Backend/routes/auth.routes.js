const express = require("express");
const auth = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("../database/config");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const security = require('../database/security');
var cookieParser = require('cookie-parser');
const users = require("./template.routes");

auth.use(cors());
auth.use(cookieParser())
require('dotenv').config()
const corsOptions = {
    origin: true,
    credentials: true,
}
auth.use(cors());
// auth.use(csrfProtection);
// auth.use(security.verifyCSRF);

auth.get('/csrf', (req, res) => {
    res.send({ csrfToken: req.csrfToken(), error: false, });
});

auth.post('/login', (req, res) => {
    db.sequelize
      .query('CALL sp_users_login(:username, :password)', {
        type: db.sequelize.QueryTypes.SELECT,
        replacements: {
          username: req.body.username,
          password: req.body.password,
        },
      })
      .then((data) => {
        const data_ret = db.MultiQueryResult(data);
        const userDetails = data_ret.result0[0];
  
        if (userDetails.hasOwnProperty('_ret')) {
          // Credentials are wrong
          res.send({error: true, message: 'Wrong credentials'});
        } else {
          // Credentials are correct
          const token = jwt.sign({ data }, process.env.PUBLICVAPIDKEY, {
            expiresIn: '8h',
          });
          res.send({error: false, token, userDetails});
        }
      })
      .catch((err) => {
        res.send('No data found');
      });
});

auth.post('/add', (req, res) => {
  db.sequelize
    .query('CALL sp_users_add(:id_no, :name, :position, :address, :username, :password)', {
      replacements: {
        id_no: parseInt(req.body.id_no),
        name: req.body.name,
        position: req.body.position,
        address: req.body.address,
        username: req.body.username,
        password: req.body.password,
      },
    })
    .then(data => {
      ret = data[0]["_ret"];
      if (ret === "no_employee_from_ismis") {
        res.send({error: true, message: ret});
      } 
      else if (ret === "employee_duplicate") {
          res.send({error: true, message: ret});
      }
      else if (ret === "name_does_not_match") {
        res.send({error: true, message: ret});
      }
      else if (ret === "name_and_id_does_not_match") {
        res.send({error: true, message: ret});
      }
      else {
        res.send({error: false, message: ret});
      }
  }).catch(err => {
      res.send({ error: true, message: `Error 767: ${err}` });
  });
});

auth.post('/validatelogin', (req, res) => {
    db.sequelize.query('CALL sp_users_login2(:username, :password)', {
        replacements: {
            username: req.body.username,
            password: req.body.password
        }
    }).then((data) => {
        res.json({ error: false, returnd: 'validated' });
    }).catch(err => {
        res.send({ error: true, message: `Error 767: ${err}` });
    });
});

auth.post('/authCheck', (req, res) => {
    jwt.verify(req.body.session, process.env.PUBLICVAPIDKEY, (err, decoded) => {
        if (err) {
            res.send({ sessionValidate: false, error: true, errormsg: `${err.name}: ${err.message}: ${err.expiredAt}` });
        } else {
            res.send({ sessionValidate: true, error: false, });
            db.sequelize.query('CALL sp_users_login2(:username, :password)', {
                replacements: {
                    username: decoded.data.username,
                    password: decoded.data.password
                }
            }).then(data => {
                if (data.length > 0) {
                    res.send({ sessionValidate: true, error: false, });
                } else {
                    res.set('Content-Type', 'text/plain')
                    res.send({ error: true, message: "Error Code 505: Forbidden Access. Please re-save" });
                }
            }).catch(err => {
                res.send({ error: true, message: `Error 504: ${err}` });
            });
        }
    });
});


module.exports = auth;