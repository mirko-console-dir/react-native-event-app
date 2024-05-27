import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        const logDirPath = path.join(path.resolve(), 'logs');
        
        if (!fs.existsSync(logDirPath)) {
            fs.mkdirSync(logDirPath);
        }

        fs.appendFileSync(path.join(logDirPath, logFileName), logItem);
    } catch (err) {
        console.error(err);
    }
};

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
};

export { logEvents, logger };
