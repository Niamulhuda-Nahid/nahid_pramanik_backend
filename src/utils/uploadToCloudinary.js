const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                use_filename: true,
                unique_filename: true,
                overwrite: false,
            },
            (error, result) => {
                if(error){
                    return reject(error);
                }

                resolve({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = uploadToCloudinary;