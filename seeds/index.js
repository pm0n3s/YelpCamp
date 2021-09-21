const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors, adjecttive, timeOfYear, experienceLevel, images } = require('./seedHelpers')
const Campground = require('../models/campground');
const Review = require('../models/review')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => { console.log('Connected to mongo') })
    .catch(err => { console.log(err) });

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('database connected'))

const sample = array => array[Math.floor(Math.random() * array.length)]
let count = 0

const seedDB = async () => {
    await Campground.deleteMany({})
    await Review.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const d = sample(descriptors)
        const p = sample(places)
        const camp = new Campground({
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude.toFixed(5),
                    cities[random1000].latitude.toFixed(5)]
            },
            title: `${d.descriptor} ${p.place}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: `${sample(adjecttive)} campground that's open ${sample(timeOfYear)}! Good for ${sample(experienceLevel)}.`,
            author: '61419996e375ae056b9150b4',
            price
        })
        if (i % 2 !== 0 && i <= images.length) {
            camp.images.push(images[count])
            count++
        }
        camp.images.push(d.image)
        camp.images.push(p.image)
        await camp.save()
    }
}

seedDB().then(() => mongoose.connection.close())