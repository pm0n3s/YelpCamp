const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index')
const { filenames } = require('../seeds/seedHelpers')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createCampground = async (req, res) => {
    const geoResponse = await geocodingClient.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground)
    newCamp.geometry = geoResponse.body.features[0].geometry
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCamp.author = req.user._id
    await newCamp.save()
    console.log(newCamp)
    req.flash('success', "You've successfully created a new campground!")
    res.redirect(`/campgrounds/${newCamp._id}`)
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author')
    if (!camp) {
        req.flash('error', "Oops! That campground doesn't seem to exist anymore")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    if (!camp) {
        req.flash('error', "Oops! That campground doesn't seem to exist anymore")
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp })
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.images.push(...imgs)
    await camp.save()
    if (req.body.deleteImages) {
        for (let file of req.body.deleteImages) {
            if (!filenames[file]) {
                await cloudinary.uploader.destroy(file)
            }
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully delete campground')
    res.redirect('/campgrounds')
}