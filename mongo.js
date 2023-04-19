const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    return
}



if (process.argv.length > 5 || process.argv.length === 4) {
    console.log('Usage: node mongo.js yourPassword name phoneNumber')
    return
}

const password = process.argv[2]

const url = `mongodb+srv://AhmedGaber:${password}@cluster0.emlcklk.mongodb.net/notesApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
})

const Phonebook = mongoose.model('Phonebook', noteSchema)

if (process.argv.length === 3) {
    Phonebook.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(entry => {
            console.log(`${entry.name} ${entry.phoneNumber}`)
        })
        mongoose.connection.close()
    })
}
else {
    const entry = new Phonebook({
        name: process.argv[3],
        phoneNumber: process.argv[4]
    })
    entry.save().then((result) => {
        console.log(`added ${result.name} number ${result.phoneNumber} to phonebook`)
        mongoose.connection.close()
    })
}

