const Glass=require('../models/glass');
const {cloudinary}=require('../cloudinary');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken});

module.exports.index=async(req,res)=>{
    const glasss=await Glass.find({});
    res.render('glasss/index',{glasss});
}

module.exports.renderNewForm=(req,res)=>{
   
    res.render('glasss/new');
};

module.exports.createGlass=async(req,res,next)=>{
     const geoData=await geocoder.forwardGeocode({
        query: `${req.body.glass.address} ${req.body.glass.location}`,
        limit:1
     }).send()
     //res.send(geoData.body.features[0].geometry.coordinates);
     const glass= new Glass(req.body.glass);
     glass.geometry=geoData.body.features[0].geometry;
     glass.images=req.files.map(f=>({url:f.path, filename:f.filename}));
     glass.author=req.user._id;
     
     await glass.save();
     req.flash('success','Successfully added a new product!');
     res.redirect(`/glasss/${glass._id}`);
    
 };

 module.exports.showGlass=async(req,res)=>{
    const glass=await Glass.findById(req.params.id).populate({
        path:'reviews',
        populate:{ 
            path:'author',  //author of each review
        }
    }).populate('author');

    if(!glass){
        req.flash('error',"Product doesn't exist");
        return res.redirect('/glasss');
    }
    res.render("glasss/show",{glass});
};

module.exports.renderEditForm=async(req,res)=>{
    const {id}=req.params;
    const glass=await Glass.findById(id);
    if(!glass){
        req.flash('error',"Product doesn't exist");
        return res.redirect('/glasss');
    }
  
    res.render("glasss/edit",{glass});
};

module.exports.updateGlass=async(req,res)=>{
    const {id}=req.params;
    const glass=await Glass.findByIdAndUpdate(id,{...req.body.glass});
    const imgs=req.files.map(f=>({url:f.path, filename:f.filename}));
    glass.images.push(...imgs);
    await glass.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await glass.updateOne( {$pull: {images: {filename: {$in:req.body.deleteImages} } } });
    }
    req.flash('success','Successfully updated!');
    res.redirect(`/glasss/${glass._id}`);
}

module.exports.deleteGlass=async(req,res)=>{
    const {id}=req.params;
    await Glass.findByIdAndDelete(id);
    req.flash('success','Successfully deleted product!');
    res.redirect('/glasss');
}
