const express = require('express')

require('dotenv').config({ path: './.env.dev' });


const bodyParser = require('body-parser')
const queueRoutes = require('./routes/queueRoutes')
const memberRoutes = require('./routes/memberRoutes')
const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api',queueRoutes)
app.use('/api/members',memberRoutes)


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`started at port ${port}`))