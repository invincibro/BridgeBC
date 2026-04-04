// VolunteerProfilePage loads one volunteer record by URL id.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getVolunteerById } from '../services/api.js'

function VolunteerProfilePage() {
  const { id } = useParams()
  const [volunteer, setVolunteer] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    getVolunteerById(id)
      .then(setVolunteer)
      .catch(() => {
        setVolunteer(null)
        setError('Volunteer profile not found.')
      })
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
        eyebrow="Volunteer profile"
        title={volunteer.name}
        description={`${volunteer.location} • ${volunteer.status}`}
      />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="Overview">
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
              <p className="mt-2">{volunteer.availability || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Languages</p>
              <p className="mt-2">{volunteer.languages.join(', ')}</p>
            </div>
          </div>
        </Card>

        <Card title="Past roles" subtitle="Previous experience that helps with continuity and handoff.">
          <div className="space-y-4">
            {volunteer.pastRoles.map((role) => (
              <div key={role.title} className="rounded-2xl border border-slate-100 bg-sand p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-pine">{role.title}</p>
                  <Badge tone="info">{role.year}</Badge>
                </div>
                <p className="mt-2 text-sm">
                  {role.nonprofit} • {role.length}
                </p>
                <p className="mt-2 text-sm">{role.handoffStrength}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}

export default VolunteerProfilePage
