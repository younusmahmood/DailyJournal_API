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
    task: "Test task 1",
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
});
