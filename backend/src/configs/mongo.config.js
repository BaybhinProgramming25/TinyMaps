const mongoose = require('mongoose');
const dbName = 'usersStore';
const url = `mongodb://mongodb:27017/${dbName}`;

const mongoConnect = async () => {

  try {  
    await mongoose.connect(url);
    console.log('Connected successfully to MongoDB!');
  } catch (error) {
    console.error('Connection failed: ', error);
  }
}

const mongoClose = async () => {

  await mongoose.connection.close();
  console.log('Mongoose connection closed!');

}

module.exports = { mongoConnect, mongoClose }

