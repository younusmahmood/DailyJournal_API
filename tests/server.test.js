const expect = require('expect');
const request = require('supertest');
const { ObjectID} = require('mongodb');

const { app } = require('../server')
const { TaskList } = require('../models/taskList');

const tasks = [
  {
    _id: new ObjectID(),
    task: "Test task 1"
  },
  {
    _id: new ObjectID(),
    task: "Test task 2",
    completed: false
  }
];

beforeEach((done) =>{
    TaskList.remove({})
      .then(() => {
        return TaskList.insertMany(tasks);
      })
      .then(() => done());
})

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
                expect(res.body.task.completed).toBe(true)
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