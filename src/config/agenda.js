const Agenda = require('agenda');
const config = require('./config');
let configureMongoDBObj = {
  db: {
    address: config.mongoose.url,
    collection: 'agendaJobs',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
const agenda = new Agenda(configureMongoDBObj);
module.exports = agenda;
