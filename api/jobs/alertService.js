const { WebSocketServer } = require('ws')
const { Pool } = require('pg')
const { scoreJob } = require('../lib/scoreJob.js') // keep your scoring function

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
    console.log('Client connected')

    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg)
            if (data.type === 'register' && data.clientId) {
                ws.clientId = data.clientId
                console.log(`Registered client ID: ${ws.clientId}`)
            }
        } catch (err) {
            console.error('Invalid message', err)
        }
    })

    ws.on('close', (code, reason) => {
        console.log(`Client disconnected (code: ${code})`)
    })
})
let lastCheck = new Date(0)
const THRESHOLD = 0.75
const INTERVAL_MS = 30000 // 30 seconds

const getAllEntries = async () => {
    try {
        const { rows } = await pool.query("SELECT * FROM organizations ORDER BY created_at")
        return rows
    } catch (error) {
        console.error('DB fetch error:', error)
        return []
    }
}

const getVolunteer = async (id) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM volunteers WHERE volunteer_id = $1",
            [id]
        );
        if (rows.length === 0) return undefined

        return rows[0]


    } catch (err) {
        console.error('DB fetch error:', error)
        return undefined
    }
}

setInterval(async () => {
    try {
        const allEntries = await getAllEntries()
        const newEntries = allEntries.filter(e => new Date(e.created_at) > lastCheck)
        lastCheck = new Date()

        for (const client of wss.clients) {
            if (client.readyState === 1 && client.clientId) {
                const volunteer = await getVolunteer(client.clientId)
                if (!volunteer) continue

                for (const entry of newEntries) {
                    const score = scoreJob(volunteer, entry)
                    console.log(`Scored entry ${entry.id} for ${client.clientId}: ${score.toFixed(2)}`)

                    if (score >= THRESHOLD) {
                        client.send(JSON.stringify({ org_id:entry.id, score, title:`${entry.legal_name}`,message: "${entry.legal_name} scored ${score} for you", createdAt:new Date() }))
                        console.log(`Alert sent for entry ${entry.id} to client ${client.clientId}`)
                    }
                }
            }
        }

    } catch (err) {
        console.error('Error in scoring loop:', err)
    }
}, INTERVAL_MS)