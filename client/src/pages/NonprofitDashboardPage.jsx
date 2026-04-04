// NonprofitDashboardPage gives nonprofits a simple overview of tasks and alerts.
import { useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getContinuityNotes, getTasks } from '../services/api.js'

function NonprofitDashboardPage() {
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])

  useEffect(() => {
    getTasks().then(setTasks).catch(() => setTasks([]))
    getContinuityNotes().then(setNotes).catch(() => setNotes([]))
  }, [])

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === 'Open'),
    [tasks],
  )

  const highUrgencyCount = openTasks.filter(
    (task) => task.urgency === 'High' || task.urgency === 'Critical',
  ).length
  const continuityAlerts = notes.filter((note) => note.alertLevel !== 'Low')

  return (
    <>
      <SectionHeader
        eyebrow="Nonprofit dashboard"
        title="Track needs, urgency, and continuity risks in one place."
        description="This view is designed for nonprofit staff who need to post tasks, review open requests, and spot weak handoffs quickly."
      />

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Post need">
          <p className="text-4xl font-semibold text-pine">{tasks.length}</p>
          <p className="mt-2 text-sm">Volunteer tasks currently stored in the mock API.</p>
        </Card>
        <Card title="Urgency">
          <p className="text-4xl font-semibold text-ember">{highUrgencyCount}</p>
          <p className="mt-2 text-sm">Open tasks marked high urgency and needing attention first.</p>
        </Card>
        <Card title="Continuity alerts">
          <p className="text-4xl font-semibold text-pine">{continuityAlerts.length}</p>
          <p className="mt-2 text-sm">Active handoff items where context could be lost without follow-up.</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Open tasks" subtitle="A simple list of current needs from the API.">
          <div className="space-y-4">
            {openTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-pine">{task.task_title}</p>
                    <p className="text-sm text-slate-500">
                      {task.organization?.org_name} • {task.availability_needed}
                    </p>
                  </div>
                  <Badge tone={task.urgency === 'High' || task.urgency === 'Critical' ? 'danger' : 'warning'}>
                    {task.urgency}
                  </Badge>
                </div>
                <p className="mt-3 text-sm">{task.task_description}</p>
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
