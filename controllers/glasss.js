const Glass = require('../models/glass');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    try {
        const glasss = await Glass.find({ isVerified: true });
        res.render('glasss/index', { glasss });
    } catch (err) {
        res.status(500).send(err.message);
    }
}

module.exports.renderNewForm = (req, res) => {

    res.render('glasss/new');
};
module.exports.createGlass = async (req, res, next) => {
    try {
        // Check if the glass object and location are present in the request body
        if (!req.body.glass || !req.body.glass.location) {
            throw new Error('Location data is missing');
        }

        // Perform geocoding based on the location provided in the form
        const geoData = await maptilerClient.geocoding.forward(req.body.glass.location, { limit: 1 });
        console.log('Geocoding data:', geoData);

        // Create a new Glass instance with the data from the request body
        const glass = new Glass(req.body.glass);
        glass.geometry = geoData.features[0].geometry;

        // Map over the uploaded files and add them to the glass object
        glass.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        glass.author = req.user._id;

        // Save the new glass product to the database
        await glass.save();
        console.log('Glass saved:', glass);

        // Provide feedback to the user and redirect to the new glass product's page
        req.flash('success', 'Successfully added a new product!');
        res.redirect(`/glasss/${glass._id}`);
    } catch (error) {
        // Log the error details for debugging
        console.error('Error details:', error);

        // Provide an error message to the user and redirect to the form page
        req.flash('error', 'Oops, something went wrong! Please check the product details and try again.');
        res.redirect('/glasss/new');
    }
};
//pending request route
module.exports.getPendingProducts = async (req, res) => {
    try {
        const pendingProducts = await Glass.find({ isVerified: false });
        res.render('glasss/pending', { pendingProducts });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
// verify product admin only
module.exports.verifyProduct = async (req, res) => {
    try {
        const glass = await Glass.findById(req.params.id);
        glass.isVerified = true;
        await glass.save();
        res.redirect('/glasss/pending');
    } catch (err) {
        res.status(500).send(err.message);
    }
};
// Delete a product admin only
module.exports.deleteProduct = async (req, res) => {
    try {
        await Glass.findByIdAndDelete(req.params.id);
        res.redirect('/glasss/pending');
    } catch (err) {
        res.status(500).send(err.message);
    }
};
module.exports.showGlass = async (req, res) => {
    const glass = await Glass.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author',  //author of each review
        }
    }).populate('author');

    if (!glass) {
        req.flash('error', "Product doesn't exist");
        return res.redirect('/glasss');
    }
    res.render("glasss/show", { glass });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const glass = await Glass.findById(id);
    if (!glass) {
        req.flash('error', "Product doesn't exist");
        return res.redirect('/glasss');
    }

    res.render("glasss/edit", { glass });
};

// module.exports.updateGlass = async (req, res) => {
//     const { id } = req.params;
//     const glass = await Glass.findByIdAndUpdate(id, { ...req.body.glass });
//     const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
//     glass.geometry = geoData.features[0].geometry;
//     const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
//     glass.images.push(...imgs);
//     await glass.save();
//     if (req.body.deleteImages) {
//         for (let filename of req.body.deleteImages) {
//             await cloudinary.uploader.destroy(filename);
//         }
//         await glass.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
//     }
//     req.flash('success', 'Successfully updated!');
//     res.redirect(`/glasss/${glass._id}`);
// }
module.exports.updateGlass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body.glass || !req.body.glass.location) {
            throw new Error('Location data is missing');
        }

        const glass = await Glass.findByIdAndUpdate(id, { ...req.body.glass }, { new: true });

        const geoData = await maptilerClient.geocoding.forward(req.body.glass.location, { limit: 1 });
        console.log('Geocoding response:', geoData);

        if (!geoData.features || geoData.features.length === 0) {
            throw new Error('Geocoding failed: No features found');
        }

        glass.geometry = geoData.features[0].geometry;

        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        glass.images.push(...imgs);

        await glass.save();

        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await glass.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        }

        req.flash('success', 'Successfully updated!');
        res.redirect(`/glasss/${glass._id}`);

    } catch (error) {
        console.error('Error details:', error);
        req.flash('error', 'Oops, something went wrong or you have entered some incorrect information :/');
        res.redirect(`/glasss/${req.params.id}/edit`);
    }
};


module.exports.deleteGlass = async (req, res) => {
    const { id } = req.params;
    await Glass.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted product!');
    res.redirect('/glasss');
}
