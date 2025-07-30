import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';



cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{


    try{
        if(!localFilePath) return null;
        //upload the file on cloudinary
        // const response = await cloudinary.uploader.upload(localFilePath,{
        //     resource_type: "auto"
        // })
        const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "image",
        eager: [
        {
          effect: "gen_replace:prompt=Light blue background"
        }
        ]
        });
        //file has been uploaded successfully
        console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } 
    catch(error)
    {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file on server as the upload operation got failed
        return null;
    }
}


export {uploadOnCloudinary};



// Upload an image
// const uploadResult = await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )
// .catch((error) => {
//     console.log(error);
// });
