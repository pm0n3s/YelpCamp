const { campgroundSchema } = require('../schemas.js')
const ExpressError = require('../utilities/ExpressError')

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

module.exports = validateCampground