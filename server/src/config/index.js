import { config } from "dotenv";
// get value fomr .env 
const {parsed} = config()

export const {
    PORT,
    MODE,
    BASE_URL,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    IN_PROD = MODE !== 'prod',
    MONGO_DB: DB,
    URL = `${BASE_URL}${PORT}/`
} = parsed