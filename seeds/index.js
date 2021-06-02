//This runs separetely from our node app.
const mongoose = require('mongoose');
const cities = require('./cities');
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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '60b0c05ef62483e72ebd0fcd',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed exercitationem nemo quod minus molestiae, architecto numquam rerum voluptatibus, blanditiis, perspiciatis repellat eum ducimus error. Quos nesciunt recusandae maiores eligendi sunt.',
      price: price,
      geometry: { type: 'Point', coordinates: [-2.991665, 53.407154] },
      images: [
        {
          url: 'https://res.cloudinary.com/fabien14/image/upload/v1622547197/AirCamp/jyqlogolkhpmuzgn1yrl.jpg',
          filename: 'AirCamp/jyqlogolkhpmuzgn1yrl',
        },
        {
          url: 'https://res.cloudinary.com/fabien14/image/upload/v1622547197/AirCamp/ztuqduyh4mkkidubwsxy.jpg',
          filename: 'AirCamp/ztuqduyh4mkkidubwsxy',
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
}); //automatically closes the connection in the terminal after the function call. i.e. after connecting via node seeds/index.js
