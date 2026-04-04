// Express server for the BridgeBC MVP mock API.
const express = require('express')
const cors = require('cors')
const { continuityNotes, roles, volunteers } = require('./data')

const app = express()
const PORT = process.env.PORT || 5001

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', service: 'BridgeBC API' })
})

app.get('/api/roles', (request, response) => {
  response.json(roles)
})

app.get('/api/volunteers', (request, response) => {
  response.json(volunteers)
})

app.get('/api/volunteers/:id', (request, response) => {
  const volunteer = volunteers.find((item) => item.id === request.params.id)

  if (!volunteer) {
    return response.status(404).json({ message: 'Volunteer not found' })
  }

  return response.json(volunteer)
})

app.get('/api/continuity-notes', (request, response) => {
  response.json(continuityNotes)
})

app.listen(PORT, () => {
  console.log(`BridgeBC API listening on http://localhost:${PORT}`)
})
