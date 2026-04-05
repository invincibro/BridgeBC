import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getVolunteerById, getVolunteers } from '../services/api.js'
import { useRef } from 'react'



function AlertProfilePage() {
  const { id } = useParams()
  const [volunteer, setVolunteer] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState('')
  const [volunteerOptions, setVolunteerOptions] = useState([])
  const audioRef = useRef(new Audio('/alert.mp3'))
  const [muted, setMuted] = useState(true)
  const navigate = useNavigate()


  useEffect(() => {
    setError('')
    getVolunteers()
      .then((volunteers) => {
        setVolunteerOptions(volunteers)

        if (!volunteers.length) {
          setVolunteer(null)
          setRecommendedOrganizations([])
          setError('No volunteer records are available yet.')
          return
        }

        const selectedVolunteerId = id || volunteers[0].volunteer_id || volunteers[0].id
        const volunteerExists = volunteers.some(
          (item) => (item.volunteer_id || item.id) === selectedVolunteerId,
        )

        if (!volunteerExists) {
          const fallbackId = volunteers[0].volunteer_id || volunteers[0].id
          navigate(`/volunteers/${fallbackId}/alert`, { replace: true })
          return
        }

        return Promise.all([
          getVolunteerById(selectedVolunteerId),

        ]).then(([volunteerRecord]) => {
          setVolunteer(volunteerRecord)
        })
      })
      .catch(() => {
        setVolunteer(null)
        setError('Volunteer profile not found.')
      })
  }, [id, navigate])



  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')
    // Connection opened
    ws.onopen = () => {
      console.log('WebSocket connected')
      ws.send(JSON.stringify({ type: 'register', clientId: id }))
    }

    // Message received from server
    ws.onmessage = (event) => {

      try {
        const data = JSON.parse(event.data)
        console.log('Alert received:', data)
        setAlerts((prev) => [...prev, data])
        if (!muted) {
          const audio = audioRef.current
          audio.currentTime = 0
          audio.play().catch((err) => {console.error(err) })
        }
      } catch (err) {
        console.error('Failed to parse message', err)
      }
    }

    // Connection closed
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)
    }

    // Error occurred
    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    // Cleanup on unmount
    return () => {
      ws.close()
    }
  }, [id])

  if (error) {
    return <p className="rounded-2xl bg-orange-50 p-6 text-orange-700">{error}</p>
  }

  if (!volunteer) {
    return <p className="rounded-2xl bg-white/80 p-6">Loading volunteer profile...</p>
  }

  return (
    <>
      <SectionHeader
        eyebrow="Volunteer Alerts"
        title={`${volunteer.first_name} ${volunteer.last_name}`}
        description={`${volunteer.neighbourhood || 'Location not provided'} • ${volunteer.background_check_status}`}
      />

      <Card title="Choose volunteer" subtitle="Switch between seeded volunteers to review their recommendation dashboard.">
        <label htmlFor="volunteer-select" className="mb-2 block text-sm font-medium text-slate-700">
          Volunteer record
        </label>
        <select
          id="volunteer-select"
          value={volunteer.volunteer_id || volunteer.id}
          onChange={(event) => navigate(`/volunteers/${event.target.value}/alert`)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
        >
          {volunteerOptions.map((option) => {
            const optionId = option.volunteer_id || option.id
            return (
              <option key={optionId} value={optionId}>
                {option.name} ({optionId})
              </option>
            )
          })}
        </select>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="Volunteer profile" subtitle="Details that influence alerts and recommendations.">

          <div className="space-y-5 text-sm">
            <div>
              <p className="font-medium text-slate-500">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {volunteer.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-500">Age</p>
              <p className="mt-2">{volunteer.age || 'Not provided'}</p>
            </div>

            <div>
              <p className="font-medium text-slate-500">Interests</p>
              <p className="mt-2">{(volunteer.cause_areas_of_interest || []).join(', ')}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Availability</p>
              <p className="mt-2">{(volunteer.availability || []).join(', ') || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Languages</p>
              <p className="mt-2">{volunteer.languages_spoken.join(', ')}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Hours available</p>
              <p className="mt-2">{volunteer.hours_available_per_month} per month</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Vehicle</p>
              <p className="mt-2">{volunteer.has_vehicle ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>

        <Card title="Alert log" subtitle="Recent alerts related to this volunteer.">
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {muted ? "🔇" : "🔔"}
          </button>
          {alerts.length === 0 && (
            <p className="text-sm text-slate-500">No alerts recorded for this volunteer yet.</p>
          )}

          {alerts.map((alert, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-sand p-4 mb-3" onClick={() => { navigate(`/organizations/${alert.org_id}`) }}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-pine">{alert.title}</p>
                <span className="text-xs text-slate-400">{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{alert.message}</p>

            </div>
          ))}
        </Card>
      </section>
    </>
  )
}

export default AlertProfilePage