import fs from 'fs'

export const isProduction = () => process.env.NODE_ENV === "production";

export const logService = (req, res, next) => {
    const log = `${req.method} req on ${req.path} at ${Date.now()}\n`;

    fs.appendFile('logs.txt', log, (err) => {
        if(err) console.error(err);
        next();
    });
}