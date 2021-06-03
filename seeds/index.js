//This runs separetely from our node app.
const mongoose = require('mongoose');
const cities = require('./cities');
const { ukCities } = require('./ukCities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/air-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

console.log(ukCities[0].city);

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random443 = Math.floor(Math.random() * 443); //there are 443 UKcities in the JSON obj
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '60b0c05ef62483e72ebd0fcd',
      location: `${ukCities[random443].city}`, //${cities[random1000].state}
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed exercitationem nemo quod minus molestiae, architecto numquam rerum voluptatibus, blanditiis, perspiciatis repellat eum ducimus error. Quos nesciunt recusandae maiores eligendi sunt.',
      price: price,
      geometry: { type: 'Point', coordinates: [ukCities[random443].lng, ukCities[random443].lat] },
      images: [
        {
          url: 'https://res.cloudinary.com/fabien14/image/upload/v1622715244/AirCamp/shell-campingwithstyle-1bSqus7DHro-unsplash_hywyps.jpg',
          filename: 'shell-campingwithstyle-1bSqus7DHro-unsplash_hywyps',
        },
        {
          url: 'https://res.cloudinary.com/fabien14/image/upload/v1622715244/AirCamp/shell-campingwithstyle-J8tD4HLJLSw-unsplash_z1svqk.jpg',
          filename: 'shell-campingwithstyle-J8tD4HLJLSw-unsplash_z1svqk',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
}); //automatically closes the connection in the terminal after the function call. i.e. after connecting via node seeds/index.js
