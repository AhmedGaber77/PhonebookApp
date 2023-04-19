const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Persons = require('./models/phonebook')
require('dotenv').config()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))


morgan.token('body', (req) => {
    if (Object.keys(req.body).length) return JSON.stringify(req.body)
    else return '-'
})

app.use(
    morgan(':method :url :status :res[content-length] :response-time ms :body')
)


// GET routes
app.get('/api/persons', (req, res, next) => {
    Persons.find({})
        .then(result => {
            if (result)
                return res.json(result)
            else {
                return res.send(500)
            }
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Persons.findById(req.params.id)
        .then(result => {
            if (result)
                res.json(result)
            else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/api/persons/search_name/:name', (req, res, next) => {
    Persons.findOne({ name: req.params.name })
        .then(result => {
            if (result) {
                return res.json(result)
            }
            else {
                return res.status(404).json({ error: 'person not found' })
            }
        }).catch(error => next(error))
})

app.get('/api/info', (req, res, next) => {
    Persons.count({})
        .then(count => {
            const now = new Date()
            res.send(`<p>Phonebook has info for ${count} people</p>
    <p>${now}</P>`)
        })
        .catch(error => next(error))

})

// Post Routes
app.post('/api/persons', (req, res, next) => {
    if (!req.body || !req.body.name || !req.body.phoneNumber) {
        return res.status(400).json({
            error: 'the name or number is missing',
        })
    }
    const entry = new Persons({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber
    })
    entry.save().then((result) => {
        console.log(`added ${result.name} number ${result.phoneNumber} to phonebook`)
        return res.status(201).json(result)
    })
        .catch(error => next(error))

})

// DELETE Routes
app.delete('/api/persons/:id', (req, res, next) => {
    Persons.findByIdAndDelete(req.params.id)
        .then(deletedDoc => {
            console.log(deletedDoc)
            res.json(deletedDoc)
        })
        .catch(error => {
            next(error)
        })
})


app.patch('/api/persons/:id', (req, res, next) => {
    Persons.findOneAndUpdate({ _id: req.params.id },
        {
            phoneNumber: req.body.phoneNumber,
            name: req.body.name
        },
        { new: true, runValidators: true })
        .then(updatedPerson => {
            if (updatedPerson) {
                console.log('here:', updatedPerson)
                return res.status(200).json(updatedPerson)
            }
            else {
                return res.status(404).json({ error: 'can\'t update person' })
            }

        }).catch(error => next(error))
})


// Handle unknown end points
const unknownEndPoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndPoint)

// handle errors
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformed id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)




const PORT = process.env.PORT || 3004
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})
