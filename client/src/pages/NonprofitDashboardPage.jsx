import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getOrganizations } from '../services/api.js'

const urgencyOptions = ['All', 'Critical', 'High', 'Medium', 'Low']

function NonprofitDashboardPage() {
  const [roles, setRoles] = useState([])
  const [selectedUrgency, setSelectedUrgency] = useState('All')

  useEffect(() => {
    getOrganizations().then(setRoles).catch(() => setRoles([]))
  }, [])

  const filteredRoles = useMemo(() => {
    if (selectedUrgency === 'All') {
      return roles
    }

    return roles.filter((role) => (role.volunteer_urgency || 'Low') === selectedUrgency)
  }, [roles, selectedUrgency])

  const highUrgencyCount = roles.filter(
    (task) => task.volunteer_urgency === 'High' || task.volunteer_urgency === 'Critical',
  ).length
  return (
    <>
      <SectionHeader
        eyebrow="Nonprofit dashboard"
        title="Track needs, urgency, and continuity risks in one place."
        description="This view is designed for nonprofit staff who need to post roles, review open requests, and spot weak handoffs quickly."
      />

      {/* Metrics Cards */}
      <section className="grid gap-6 md:grid-cols-3 mb-8">
        <Card title="Total Roles">
          <p className="text-4xl font-bold text-pine">{roles.length}</p>
          <p className="mt-2 text-sm text-slate-500">
            Mock role templates ready to turn into a future form flow.
          </p>
        </Card>

        <Card title="High Urgency Roles">
          <p className="text-4xl font-bold text-ember">{highUrgencyCount}</p>
          <p className="mt-2 text-sm text-slate-500">
            Open roles marked high urgency and needing attention first.
          </p>
        </Card>

      </section>
      <SectionHeader
        title="Non-profit that needs your help"
      />
      <section>
        <Card>
          <div className="mb-5 flex flex-wrap gap-2">
            {urgencyOptions.map((urgency) => {
              const isActive = urgency === selectedUrgency

              return (
                <button
                  key={urgency}
                  type="button"
                  onClick={() => setSelectedUrgency(urgency)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border-pine bg-pine text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-moss hover:text-pine'
                  }`}
                >
                  {urgency}
                </button>
              )
            })}
          </div>

          <div className="space-y-4">
            {filteredRoles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-pine">{role.account_name || role.legal_name}</p>
                  <p className="text-sm text-slate-500">
                    <strong>Skills:</strong> {role.skills_needed?.join(', ')} •{' '}
                    <strong>Availability:</strong> {role.availability_preference || role.schedule}
                  </p>
                  <p className="text-sm text-slate-500">
                    <strong>Volunteers Needed:</strong> {role.volunteers_currently_needed || 0} •{' '}
                    <strong>Sector:</strong> {role.sector || 'N/A'} •{' '}
                    <strong>Org Size:</strong> {role.org_size || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-500">
                    <strong>Languages:</strong> {role.languages_needed?.join(', ') || 'Any'} •{' '}
                    <strong>Background Check:</strong> {role.background_check_required ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-slate-500">
                    <strong>Availability Times:</strong>
                    {role.weekday_morning && ' Weekday Morning,'}
                    {role.weekday_afternoon && ' Weekday Afternoon,'}
                    {role.weekday_evening && ' Weekday Evening,'}
                    {role.weekend_morning && ' Weekend Morning,'}
                    {role.weekend_afternoon && ' Weekend Afternoon,'}
                    {role.weekend_evening && ' Weekend Evening'}
                  </p>
                </div>
              </div>
            ))}

            {!filteredRoles.length && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No volunteer opportunities are marked {selectedUrgency.toLowerCase()} right now.
              </div>
            )}
          </div>
        </Card>
      </section>
    </>
  )
}

export default NonprofitDashboardPage
