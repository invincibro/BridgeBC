// VolunteerProfilePage loads one volunteer record by URL id.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import {
  getRecommendedOrganizationsForVolunteer,
  getVolunteerById,
  getVolunteers,
} from '../services/api.js'

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    return value
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function VolunteerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [volunteerOptions, setVolunteerOptions] = useState([])
  const [volunteer, setVolunteer] = useState(null)
  const [recommendedOrganizations, setRecommendedOrganizations] = useState([])
  const [error, setError] = useState('')

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
          navigate(`/volunteers/${fallbackId}`, { replace: true })
          return
        }

        return Promise.all([
          getVolunteerById(selectedVolunteerId),
          getRecommendedOrganizationsForVolunteer(selectedVolunteerId).catch(() => []),
        ]).then(([volunteerRecord, recommendations]) => {
          setVolunteer(volunteerRecord)
          setRecommendedOrganizations(recommendations)
        })
      })
      .catch(() => {
        setVolunteer(null)
        setRecommendedOrganizations([])
        setError('Volunteer profile not found.')
      })
  }, [id, navigate])

  if (error) {
    return <p className="rounded-2xl bg-orange-50 p-6 text-orange-700">{error}</p>
  }

  if (!volunteer) {
    return <p className="rounded-2xl bg-white/80 p-6">Loading volunteer profile...</p>
  }

  return (
    <>
      <SectionHeader
        eyebrow="Volunteer Dashboard"
        title={volunteer.name}
        description={`${volunteer.neighbourhood || volunteer.location || 'Location not provided'} • ${volunteer.background_check_status || volunteer.status}`}
      />

      <Card title="Choose volunteer" subtitle="Switch between seeded volunteers to review their recommendation dashboard.">
        <label htmlFor="volunteer-select" className="mb-2 block text-sm font-medium text-slate-700">
          Volunteer record
        </label>
        <select
          id="volunteer-select"
          value={volunteer.volunteer_id || volunteer.id}
          onChange={(event) => navigate(`/volunteers/${event.target.value}`)}
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

      <section className="grid gap-6 md:grid-cols-4">
        <Card title="Recommended orgs">
          <p className="text-4xl font-semibold text-pine">{recommendedOrganizations.length}</p>
          <p className="mt-2 text-sm">Organizations currently ranked for this volunteer.</p>
        </Card>
        <Card title="Languages">
          <p className="text-4xl font-semibold text-pine">{volunteer.languages_spoken.length}</p>
          <p className="mt-2 text-sm">Languages available for matching.</p>
        </Card>
        <Card title="Skills">
          <p className="text-4xl font-semibold text-pine">{volunteer.skills.length}</p>
          <p className="mt-2 text-sm">Skills currently listed on the volunteer record.</p>
        </Card>
        <Card title="Hours / month">
          <p className="text-4xl font-semibold text-pine">{volunteer.hours_available_per_month || 0}</p>
          <p className="mt-2 text-sm">Estimated time they can contribute each month.</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card title="Volunteer overview" subtitle="Profile details that influence matching and readiness.">
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
              <p className="mt-2">
                {normalizeList(volunteer.availability_options || volunteer.availability).join(', ') ||
                  'Not provided'}
              </p>
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
              <p className="font-medium text-slate-500">Prior volunteer experience</p>
              <p className="mt-2">{volunteer.prior_volunteer_experience}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Vehicle</p>
              <p className="mt-2">{volunteer.has_vehicle ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>

        <Card title="Recommended organizations" subtitle="Organization cards ranked from the volunteer recommendation API.">
          <div className="space-y-4">
            {recommendedOrganizations.length === 0 && (
              <p className="text-sm text-slate-500">
                No recommendation cards available yet for this volunteer.
              </p>
            )}

            {recommendedOrganizations.slice(0, 6).map((organization) => (
              <div key={organization.id} className="rounded-2xl border border-slate-100 bg-sand p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-pine">
                      {organization.account_name || organization.legal_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {organization.city || 'Remote'} • {organization.sector || 'General'}
                    </p>
                  </div>
                  <Badge tone="success">{organization.score} score</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-slate-500">Urgency</p>
                    <p>{organization.volunteer_urgency || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Volunteers needed</p>
                    <p>{organization.volunteers_currently_needed || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Availability</p>
                    <p>{organization.availability_preference || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Background check</p>
                    <p>{organization.background_check_required ? 'Required' : 'Not required'}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {normalizeList(organization.skills_needed).map((skill) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                  {normalizeList(organization.languages_needed).map((language) => (
                    <Badge key={language}  tone="info">{language}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}

export default VolunteerProfilePage
