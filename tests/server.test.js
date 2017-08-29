const expect = require('expect');
const request = require('supertest');
const { ObjectID} = require('mongodb');

const { app } = require('../server')
const { TaskList } = require('../models/taskList');
const { User } = require('../models/user')
const { tasks, users, populateTodos, populateUsers } = require('./seed/seed')

beforeEach(populateTodos)
beforeEach(populateUsers);

describe('POST /taskslist', () => {
    it('Should add a task to the list', (done) => {
        var task = 'Testing post method'
        
        request(app)
            .post('/taskslist')
            .send({ task })
            .expect(200)
            .expect((res) => {
                expect(res.body.task).toBe(task)
            })
            .end((err, res) => {
                if(err) {
                    return done(err)
                }

                TaskList.find().then((tasks) => {
                    expect(tasks.length).toBe(3);
                    expect(tasks[2].task).toBe(task);
                    done()
                }).catch((e) => done(e))
            })
    })

    it('Should not create a task', (done) => {
        request(app)
            .post('/taskslist')
            .send({})
            .expect(400)
            .end((err,res) => {
                if(err) {
                    return done(err)
                }

                TaskList.find().then((tasks) => {
                    expect(tasks.length).toBe(2)
                    done()
                }).catch(e => done(e))
            })
    })
});

describe('GET /tasksList', () => {
    it('Should return all lists of tasks', (done) => {
        request(app)
            .get('/taskslist')
            .expect(200)
            .expect((res) => {
                expect(res.body.tasks.length).toBe(2)
            }) 
            .end(done)
    })


})

describe('DELETE /taskslist/:id', () => {
    it('Should delete given task', (done) => {
        var id = tasks[0]._id.toHexString()

        request(app)
            .delete(`/taskslist/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.task._id).toBe(tasks[0]._id.toHexString())
            })
            .end((err,res) => {
                if(err) { return done(err) }

                TaskList.findById(tasks[0]._id).then((task) => {
                    expect(task).toNotExist();
                    done()
                }).catch((e) =>  done(e))
            })
    })

    it('Should return a 404 for nonexistent ID', (done) => {
        var id = new ObjectID()

        request(app)
            .delete(`/taskslist/${id}`)
            .expect(404)
            .end(done)
    });

    it('Should return a 404 for non ObjectIDs', (done) => {
        request(app)
            .delete(`/taskslist/123`)
            .expect(404)
            .end(done);
    })
})

describe('PATCH /taskslist/:id', () => {
    it('Should switch completed property of task', (done) => {
        var id = tasks[1]._id.toHexString();
        var completed = true;

        request(app)
            .patch(`/taskslist/${id}`)
            .send({ completed })
            .expect(200)
            .expect((res) => {
                expect(res.body.task.completed).toBe(false)
            })
            .end(done)
    })

    it('Should return a 404 for nonexistent ID', (done) => {
        var id = new ObjectID()

        request(app)
            .patch(`/taskslist/${id}`)
            .expect(404)
            .end(done);
    })

    it('Should return a 404 for non objectIDs', (done) => {
        request(app)
            .patch(`/taskslist/123`)
            .expect(404)
            .end(done);
    })
})

describe('GET /users/me', () => {
    it('Should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it("Should return 401 if not authorized", done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done)
    });

})

describe('POST /users', () => {
    it('Should create a user', (done) => {
        var email = 'example@example.com'
        var password = '123mnb';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist()
                expect(res.body._id).toExist()
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if(err) {
                    return done()
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist()
                    expect(user.password).toNotBe(password);
                    done();
                })
            })
    })

    it("Should return validation errors if request invalid", done => {
        request(app)
            .post('/users')
            .send({
                email: '123',
                password: '1234'
            })
            .expect(400)
            .end(done)
    });

    it("Should not create user if email is in use", done => {
        request(app)
            .post('/users')
            .send({
                email: users[0].email,
                password: '123'
            })
            .expect(400)
            .end(done)
    });
})