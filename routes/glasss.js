const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const flash=require("connect-flash");
const Glass=require('../models/glass');
const glasss=require('../controllers/glasss');
const {isLoggedIn,isAuthor,validateGlass}=require('../middleware');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload=multer({storage})


router.get('/',catchAsync(glasss.index));

router.get('/new',isLoggedIn,glasss.renderNewForm);

router.post('/',isLoggedIn,upload.array('image'),validateGlass,catchAsync(glasss.createGlass));

router.get('/:id',catchAsync(glasss.showGlass));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(glasss.renderEditForm));

router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateGlass,catchAsync(glasss.updateGlass));

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(glasss.deleteGlass));

module.exports=router;

