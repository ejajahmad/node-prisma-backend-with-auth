import AWS from "aws-sdk";

const { S3_ACCESS_KEY_ID, S3_ACCESS_KEY_SECRET } = process.env;

AWS.config.update({
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_ACCESS_KEY_SECRET,
    region: "ap-south-1",
});

const s3Instance = new AWS.S3();

export class S3Instance {
    static uploadFile = async (path, file) => {
        const params = {
            Bucket: "collegevidyaabroad",
            Key: `${path}/${Date.now()}-${file.name}`,
            Body: Buffer.from(file.data, "binary"),
            ContentType: `${file.mimetype}`,
        };

        try {
            const { Key } = await s3Instance.upload(params).promise();
            return Key;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    static uploadLocalFile = async (
        path,
        filename,
        file
    ) => {
        const params = {
            Bucket: "collegevidyaabroad",
            Key: `${path}/${filename}`,
            Body: file,
            ContentType: file.mimetype,
        };

        try {
            const { Key } = await s3Instance.upload(params).promise();
            return Key;
        } catch (err) {
            throw err;
        }
    };
}


