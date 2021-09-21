const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema
const opts = { toJSON: { virtuals: true } }

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_400,h_400')
})
ImageSchema.virtual('mapboxPopup').get(function () {
    return this.url.replace('/upload', '/upload/w_170,h_170')
})


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    description: String,
    price: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<div class='card'>
            <img class="card-img-top img-fluid" src="${this.images.length ? this.images[0].mapboxPopup : ''}">
            <div class="card-body p-1">
            <h6 class="card-title mb-0">${this.title}</h6>
            <p class="card-text text-muted mb-0"">${this.location}</p>
            <a href="/campgrounds/${this._id}" class="btn-sm btn-primary">View</a>
            </div>
            </div>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)