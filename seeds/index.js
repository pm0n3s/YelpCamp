const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors, adjecttive, timeOfYear, experienceLevel, images } = require('./seedHelpers')
const Campground = require('../models/campground');
const Review = require('../models/review')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const patId = '614a2b3887ae143c8dc0e83e' || '61419996e375ae056b9150b4'

mongoose.connect('mongodb+srv://user-1:CLWDWHte4mZVO1yj@cluster0.kypk5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
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
    for (let i = 0; i < 50; i++) {
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
            author: '614a2b3887ae143c8dc0e83e',
            price
        })
        if (i % 2 !== 0) {
            Math.floor(Math.random() * images.length - 1)
            camp.images.push(images[count])
            count++
        }
        camp.images.push(d.image)
        camp.images.push(p.image)
        await camp.save()
    }
}

seedDB().then(() => mongoose.connection.close())