const mongoose =require('mongoose');
const Glass=require('../models/glass');


mongoose.connect('mongodb://localhost:27017/glass-works',{
    useNewUrlParser: true,
   // useCreateIndex: true,
    useUnifiedTopology: true, 
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Dtabase connected");
});

const seedDB= async()=>{
    await Glass.deleteMany({});
    const c=new Glass({title:'Jar',
    images:[
        {
            url:'https://res.cloudinary.com/dyoy8ekvy/image/upload/v1655225763/Glassworks/jo2tvjzxckrh4ghtzc2y.jpg',
            filename:'Glassworks/vvmnywtsriyq11e2yrwv',
        }
    ],
    geometry:{
        type:'Point',
        coordinates:[-113.331,47.020]
    },
    description:"A unique glass jar",author:"62a323fcd41b788664e33449"});
    const d=new Glass({title:'Glass Vase',description:"A unique glass vase",
    geometry:{
        type:'Point',
        coordinates:[-113.331,47.020]
    },
    images:[
        {
            url:'https://res.cloudinary.com/dyoy8ekvy/image/upload/v1655225763/Glassworks/jo2tvjzxckrh4ghtzc2y.jpg',
            filename:'Glassworks/vvmnywtsriyq11e2yrwv',
        },
    ],
    author:"62a323fcd41b788664e33449"});
    await d.save();
    await c.save();
}
seedDB();
