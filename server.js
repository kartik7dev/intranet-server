require('dotenv').config();
const express = require('express')
const app  = express()
const path = require('path')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents')
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3500


//Connect MONGO DB
connectDB()

// custom middleware logger
app.use(logger)

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// build-in middleware to handle urlencoded data 
// in other words, form data : 
// 'content-type : application/x-www-form-urlencoded'
app.use(express.urlencoded({extended : false}))

// built-in middleware for json
app.use(express.json())

//middleware for cookies
app.use(cookieParser());

// serve static files
app.use(express.static(path.join(__dirname,'/public')))
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/reviewdocs', express.static(path.join(__dirname, 'public/reviewdocs')));
// routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))
app.use('/dashboard', require('./routes/dashboard'))
app.use('/categories', require('./routes/category'))
app.use('/projects', require('./routes/project'))
app.use('/project-reviews', require('./routes/project-review'))

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

