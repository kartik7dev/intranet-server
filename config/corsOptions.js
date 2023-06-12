const whitelist = ['http://192.168.17.30:3000','http://localhost:3000','http://localhost:3500','http://192.168.17.30:3500'];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials : true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;