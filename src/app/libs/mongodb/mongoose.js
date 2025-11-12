import mongoose from "mongoose";

let initialzed = false;

const connect = async () =>{
    mongoose.set('strictQuery', true);

    if(initialzed){
        console.log("MongoDB already connected");
        return
    }
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: 'next-estate',
            useNewUrlParser: true,
            useUnifedTopology: true
        })
        initialzed= true;
        console.log("mongodb connected")
    } catch (error) {
        console.log("mongodb connection error", error)
    }
}

export default connect