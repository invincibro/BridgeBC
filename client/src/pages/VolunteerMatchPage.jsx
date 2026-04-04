// VolunteerMatchPage demonstrates simple frontend matching on top of backend data.
import { useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getRoles, getVolunteers } from '../services/api.js'

function scoreVolunteer(role, volunteer) {
  let score = 55

  const skillMatches = volunteer.skills.filter((skill) =>
    role.skillsNeeded.includes(skill),
  ).length

  if (volunteer.languages.some((language) => role.languagesPreferred.includes(language))) {
    score += 10
  }

  if (
    volunteer.availability.some((slot) =>
      role.schedule.toLowerCase().includes(slot.toLowerCase()),
    )
  ) {
    score += 15
  }

  score += skillMatches * 10

  if (volunteer.status === 'Ready to match') {
    score += 5
  }

  return Math.min(score, 98)
}

function VolunteerMatchPage() {
  const [roles, setRoles] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('')

  useEffect(() => {
    getRoles().then((data) => {
      setRoles(data)
      setSelectedRoleId(data[0]?.id || '')
    })
    getVolunteers().then(setVolunteers)
  }, [])

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || roles[0],
    [roles, selectedRoleId],
  )

  const matches = useMemo(() => {
    if (!selectedRole) {
      return []
    }

    return [...volunteers]
      .map((volunteer) => ({
        ...volunteer,
        fitScore: scoreVolunteer(selectedRole, volunteer),
      }))
      .sort((first, second) => second.fitScore - first.fitScore)
      .slice(0, 4)
  }, [selectedRole, volunteers])

  return (
    <>
      <SectionHeader
        eyebrow="Volunteer matches"
        title="Recommend people based on fit, language, and schedule alignment."
        description="This screen uses simple mock scoring logic so you can later replace it with richer ranking from a database or matching service."
      />

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <Card title="Choose a role" subtitle="Change the selected role to refresh recommendations.">
          <label htmlFor="role-select" className="text-sm font-medium text-slate-600">
            Open volunteer role
          </label>
          <select
            id="role-select"
            value={selectedRole?.id || ''}
            onChange={(event) => setSelectedRoleId(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.title} - {role.nonprofit}
              </option>
            ))}
          </select>

          {selectedRole && (
            <div className="mt-5 rounded-2xl bg-sand p-4">
              <p className="font-semibold text-pine">{selectedRole.title}</p>
              <p className="mt-2 text-sm">{selectedRole.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedRole.skillsNeeded.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card title="Recommended people" subtitle="Top matches scored from the current mock data.">
          <div className="grid gap-4">
            {matches.map((volunteer) => (
              <div key={volunteer.id} className="rounded-3xl border border-slate-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-pine">{volunteer.name}</p>
                    <p className="text-sm text-slate-500">{volunteer.location}</p>
                  </div>
                  <Badge tone="success">{volunteer.fitScore}% fit</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="font-medium text-slate-500">Language</p>
                    <p>{volunteer.languages.join(', ')}</p>
                  </div>
                  <div>
                   <p className="font-medium text-slate-500">Schedule</p>
                    <p>{volunteer.availability || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Check status</p>
                    <p>{volunteer.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}

export default VolunteerMatchPage
