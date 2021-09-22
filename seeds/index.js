require('dotenv').config()
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors, adjecttive, timeOfYear, experienceLevel, images } = require('./seedHelpers')
const Campground = require('../models/campground');
const Review = require('../models/review')
const { cloudinary } = require('../cloudinary/index')
const { filenames } = require('../seeds/seedHelpers')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const patId = '614a2b3887ae143c8dc0e83e' || '61419996e375ae056b9150b4'

mongoose.connect(dbUrl)
    .then(() => { console.log('Connected to mongo') })
    .catch(err => { console.log(err) });

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => console.log('database connected'))

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    const campgrounds = await Campground.find({})
    if (campgrounds) {
        for (let camp of campgrounds) {
            if (camp.images) {
                for (let img of camp.images) {
                    if (!filenames[img.filename]) {
                        await cloudinary.uploader.destroy(img.filename)
                    }
                }
            }
        }
    }
    await Campground.deleteMany({})
    await Review.deleteMany({})
    for (let i = 0; i < 30; i++) {
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
            camp.images.push(sample(images))
        }
        camp.images.push(d.image)
        camp.images.push(p.image)
        await camp.save()
    }
}

seedDB().then(() => mongoose.connection.close())