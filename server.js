import express from 'express';
import mainrouter from './routes/index.js'
import mongoose from 'mongoose';
const app = express()
const port = 3000
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', mainrouter)

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'))

async function connectDB() {
    mongoose.connect('mongodb://localhost:27017/bla_bla_travel') ;
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
connectDB();