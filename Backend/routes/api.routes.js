const express = require('express');
const api = express.Router();
const db = require('../database/config');
const jwt = require('jsonwebtoken');

api.post('/userlogin', (req, res) => {
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
        const userDetails = [data_ret.result0[0]]; // Wrap the user details in an array
  
        if (userDetails[0].hasOwnProperty('_ret')) {
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
        res.send({ error: true, message: 'No data found' });
      });
});

api.post('/verify-token', (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    res.json({ error: true, message: 'Invalid token' });
    return;
  }

  const token = authorizationHeader.substring(7);

  jwt.verify(token, process.env.PUBLICVAPIDKEY, (err, decoded) => {
    if (err) {
      res.json({ error: true, message: 'Invalid token' });
    } else {
      const userDetails = decoded.data;
      // Perform additional validation or database checks if required
      res.json({ error: false, userDetails });
    }
  });
});

api.post('/add', (req, res) => {
  db.sequelize
    .query('CALL sp_users_add(:id_no, :name, :address, :username, :password)', {
      replacements: {
        id_no: parseInt(req.body.id_no),
        name: req.body.name,
        //position: req.body.position,
        address: req.body.address,
        username: req.body.username,
        password: req.body.password,
      },
    })
    .then(data => {
      ret = data[0]["_ret"];
      if (ret === "no_employee_from_ismis") {
        res.send({error: true, message: 'Oops! Employee does not exist!'});
      } 
      else if (ret === "employee_duplicate") {
          res.send({error: true, message: 'Account already existed!'});
      }
      else if (ret === "name_does_not_match") {
        res.send({error: true, message: 'Name doesnt match! Please check your name'});
      }
      else if (ret === "name_and_id_does_not_match") {
        res.send({error: true, message: 'Name and ID No. doesnt match! Please check again.'});
      }
      else {
        res.send({error: false, message: 'Employee added succesfully!'});
      }
  }).catch(err => {
      res.send({ error: true, message: `Error 767: ${err}` });
  });
});

api.post("/adminlogin", (req, res) => {
  db.sequelize
    .query("CALL sp_admin_login(:username, :password)", {
      type: db.sequelize.QueryTypes.SELECT,
      replacements: {
        username: req.body.username,
        password: req.body.password,
      },
    })
    .then((data) => {
      const data_ret = db.MultiQueryResult(data);
      const userDetails = [data_ret.result0[0]]; // Wrap the user details in an array

      if (userDetails[0].hasOwnProperty("_ret")) {
        // Credentials are wrong
        res.send({ error: true, message: "Wrong credentials" });
      } else {
        // Credentials are correct
        const token = jwt.sign({ data }, process.env.PUBLICVAPIDKEY, {
          expiresIn: "8h",
        });
        res.send({ error: false, token, userDetails });
      }
    })
    .catch((err) => {
      res.send({ error: true, message: "No data found" });
    });
});

api.get("/get_profile", (req, res) => {
  db.sequelize
    .query("CALL sp_profile_get()", {
      type: db.sequelize.QueryTypes.SELECT,
    })
    .then((data) => {
      const data_ret = db.MultiQueryResult(data).result0;
      if (data_ret) {
        res.send(data_ret);
      } else {
        res.send(`no_data`);
      }
    })
    .catch((err) => {
      res.send(`Error: ${err}`);
    });
});

module.exports = api;
