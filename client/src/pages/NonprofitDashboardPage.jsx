// NonprofitDashboardPage gives nonprofits a simple overview of needs and alerts.
import { useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getContinuityNotes, getRoles } from '../services/api.js'

function NonprofitDashboardPage() {
  const [roles, setRoles] = useState([])
  const [notes, setNotes] = useState([])

  useEffect(() => {
    getRoles().then(setRoles).catch(() => setRoles([]))
    getContinuityNotes().then(setNotes).catch(() => setNotes([]))
  }, [])

  const openRoles = useMemo(
    () => roles.filter((role) => role.status === 'Open'),
    [roles],
  )

  const highUrgencyCount = openRoles.filter((role) => role.urgency === 'High').length
  const continuityAlerts = notes.filter((note) => note.alertLevel !== 'Low')

  return (
    <>
      <SectionHeader
        eyebrow="Nonprofit dashboard"
        title="Track needs, urgency, and continuity risks in one place."
        description="This view is designed for nonprofit staff who need to post roles, review open requests, and spot weak handoffs quickly."
      />

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Post need">
          <p className="text-4xl font-semibold text-pine">{roles.length}</p>
          <p className="mt-2 text-sm">Mock role templates ready to turn into a future form flow.</p>
        </Card>
        <Card title="Urgency">
          <p className="text-4xl font-semibold text-ember">{highUrgencyCount}</p>
          <p className="mt-2 text-sm">Open roles marked high urgency and needing attention first.</p>
        </Card>
        <Card title="Continuity alerts">
          <p className="text-4xl font-semibold text-pine">{continuityAlerts.length}</p>
          <p className="mt-2 text-sm">Active handoff items where context could be lost without follow-up.</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Open roles" subtitle="A simple list of current needs from the API.">
          <div className="space-y-4">
            {openRoles.map((role) => (
              <div key={role.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-pine">{role.title}</p>
                    <p className="text-sm text-slate-500">
                      {role.nonprofit} • {role.schedule}
                    </p>
                  </div>
                  <Badge tone={role.urgency === 'High' ? 'danger' : 'warning'}>
                    {role.urgency}
                  </Badge>
                </div>
                <p className="mt-3 text-sm">{role.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Continuity alerts" subtitle="Notes that may need staff follow-up.">
          <div className="space-y-4">
            {continuityAlerts.map((note) => (
              <div key={note.id} className="rounded-2xl border border-slate-100 bg-sand p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-pine">{note.roleTitle}</p>
                  <Badge tone={note.alertLevel === 'High' ? 'danger' : 'warning'}>
                    {note.alertLevel}
                  </Badge>
                </div>
                <p className="mt-3 text-sm">{note.nextSteps[0]}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Contact: {note.keyContacts[0].name}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}

export default NonprofitDashboardPage
