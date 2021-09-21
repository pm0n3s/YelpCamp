const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utilities/catchAsync')
const validateReview = require('../middleware/validateReview')
const isLoggedIn = require('../middleware/auth')
const isReviewAuthor = require('../middleware/isReviewAuthor')
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router