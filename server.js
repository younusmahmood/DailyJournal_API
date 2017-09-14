require('./config');

const _ = require('lodash')
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { TaskList } = require('./models/taskList');
var { Journal } = require('./models/journal')
var { User } = require('./models/user')
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors())

app.use((req,res,next) => {
    res.header("Access-Control-Expose-Headers", "x-auth");
    next();
})

app.post('/taskslist/:id',authenticate, (req, res) => {
  var task = new TaskList({
    task: req.body.task,
    time: req.body.time,
    _creator: req.user._id,
    _journal: req.params.id
  });

  task.save().then(doc => {
      res.send(doc);
    }, e => {
      res.status(400).send(e);
    });
})

app.post('/journals', authenticate, (req, res) => {
        var journal = new Journal({
          _creator: req.user._id,
          title: req.body.title
        });

        journal.save().then(doc => {
            res.send(doc)
        }, (e) => {
            res.status(400).send(e)
        })
})

app.get("/journals", authenticate, (req, res) => {
  Journal.find({
    _creator: req.user._id
  }).then(
    journals => {
      res.send({ journals });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get('/taskslist/:id',authenticate, (req, res) => {
    TaskList.find({
        _creator: req.user._id,
        _journal: req.params.id
    }).then((tasks) => {
        res.send({ tasks })
    }, (e) => {
        res.status(400).send(e)
    })
})

app.patch('/taskslist/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ["completed"]);
    if(!ObjectID.isValid(id)) {
        res.status(404).send()
    }

    if(_.isBoolean(body.completed)){
        if(body.completed){
            body.completed = false;
        } else if(!body.completed){
            body.completed = true;
        }
    }
    
    TaskList.findOneAndUpdate({_id: id, _creator: req.user._id}, { $set: body }, { new: true })
      .then(task => {
        if (!task) {
          return res.status(404).send();
        }
        res.send({task});
      })
      .catch(e => res.status(400).send());
});

app.delete('/taskslist/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if(!ObjectID.isValid(id)){
        res.status(404).send();
    }

    TaskList.findOneAndRemove({
       _id: id,
       _creator: req.user._id
    }).then((task) => {
        if(!task) {
            res.status(404).send()
        }

        res.send({ task })

    }).catch((e) => res.status(404).send());

});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body)
    var errorMessage = 'Password must contain at least 6 characters'

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        if(e.code === 11000){
            errorMessage = "Email already exists"
        } 
        console.log(errorMessage)
        res.status(400).send(e)
    })

});

app.get('/users/me',authenticate, (req, res) => {
   res.send(req.user);
})

app.post('/users/login', (req, res) => {
   var body = _.pick(req.body, ["email", "password"]);

   User.findByCredentials(body.email, body.password).then((user) =>{
    return user.generateAuthToken().then((token) => {
        res.header("x-auth", token).send(user);
     })
   }).catch((e) => {
       res.status(400).send("Invalid email or password")
   })
})

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send()
    })
})

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app }