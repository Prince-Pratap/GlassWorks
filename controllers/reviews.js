const Glass=require('../models/glass');
const Review=require('../models/review');

module.exports.createReview=async(req,res)=>{
    const glass= await Glass.findById(req.params.id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    glass.reviews.push(review);
    await review.save();
    await glass.save();
    req.flash('success','Added new review');
    res.redirect(`/glasss/${glass._id}`);
};

module.exports.deleteReview=async(req,res)=>{
    const {id,reviewId}=req.params;
    await Glass.findByIdAndUpdate(id,{$pull: {reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review');
    res.redirect(`/glasss/${id}`);
};