const mongoose =require('mongoose');
const Schema=mongoose.Schema;

const ImageSchema=new Schema({
     url:String,
     filename:String
});

ImageSchema.virtual('thumbnail').get(function(){
     return this.url.replace('/upload','/upload/w_200');
});

const opts={ toJSON:{ virtuals:true } };

const GlassSchema= new Schema({
     title: String,
     images:[ImageSchema],
     geometry:{
          type:{
              type: String,
              enum: ['Point'],
              required: true
          },
          coordinates:{
              type:[Number],
              required: true
          }
      },
     price: Number,
     description: String,
     address: String,
     location: String,
     isVerified: {
          type: Boolean,
          default: false
     },
     author:{
          type: Schema.Types.ObjectId,
          ref:'User'
     },
     reviews:[
          {
               type: Schema.Types.ObjectId,
               ref: 'Review'
          }
     ],
    
},opts);

GlassSchema.virtual('properties.popUpMarkup').get(function(){
     return `<strong><a href="/glasss/${this._id}">${this.title}</a><strong>`
})
module.exports=mongoose.model('Glass',GlassSchema);
