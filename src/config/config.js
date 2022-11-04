import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });
//const BASE_IMAGE_URL = "https://appcrates.net:"+process.env.PORT;
//const ROUTE_IMAGE_PATH = "dist/uploads/images" //FOR BUILD

const BASE_IMAGE_URL = "http://localhost:6262";
const ROUTE_IMAGE_PATH = "src/uploads/images"; //FOR DEV

export const devConfig = {
    port: process.env.PORT,
    db_username: process.env.DATABASE_USERNAME,
    db_password: process.env.DATABASE_PASSWORD,
    db_name: process.env.DATABASE_NAME,
    db_host: process.env.DATABASE_HOST,
    secret: process.env.SECRET_KEY,

    imagesPath: {
        userImage: `${ROUTE_IMAGE_PATH}/userImage`,
    },
    getImagesPath: {
        userImage: `${BASE_IMAGE_URL}/userImage`,
    },
    email: {
        SERVICE: 'Gmail',
        USER: 'qa.appcrates@gmail.com',
        PASSOWRD: 'tkfnqrfxigmiulht',
        FROM: 'qa.appcrates@gmail.com',
    },

}