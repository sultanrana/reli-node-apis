import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const BASE_IMAGE_URL = "http://localhost:6262";
const ROUTE_IMAGE_PATH = "src/uploads/images"; //FOR DEV

const BASE_DOC_URL = "http://localhost:3000";
const ROUTE_DOC_PATH = "src/uploads/docs"; //FOR DEV

export const devConfig = {
    port: process.env.PORT,
    db_username: process.env.DATABASE_USERNAME,
    db_password: process.env.DATABASE_PASSWORD,
    db_name: process.env.DATABASE_NAME,
    db_host: process.env.DATABASE_HOST,
    secret: process.env.SECRET_KEY,

    imagesPath: {
        userImage: `${ROUTE_IMAGE_PATH}/userImage`,
        couponImage: `${ROUTE_IMAGE_PATH}/couponImage`
    },
    getImagesPath: {
        userImage: `${BASE_IMAGE_URL}/userImage`,
        couponImage: `${BASE_IMAGE_URL}/couponImage`,
    },
    docsPath: {
        csvFiles: `${ROUTE_DOC_PATH}/csvFiles`,
    },
    getDocsPath: {
        csvFiles: `${BASE_DOC_URL}/csvFiles`,
    },
    email: {
        SERVICE: 'Gmail',
        USER: 'farhatbaig77@gmail.com',
        PASSOWRD: 'asusfjdtbvcccpsc',
        FROM: 'farhatbaig77@gmail.com',
    },

}