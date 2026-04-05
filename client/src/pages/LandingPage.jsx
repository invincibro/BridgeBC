// LandingPage introduces the product and lets users explore open roles.
import { useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getRoles } from '../services/api.js'

function LandingPage() {
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(() => setError('Unable to load roles right now.'))
  }, [])

  const filteredRoles = useMemo(() => {
    const query = search.toLowerCase()

    return roles.filter((task) => {
      const fields = [
        task.task_title,
        task.organization?.org_name || '',
        task.organization?.city || '',
        task.availability_preference,
        task.task_category,
      ]
      return fields.some((field) => field.toLowerCase().includes(query))
    })
  }, [roles, search])

  return (
    <>
      <section className="hero-grid panel overflow-hidden">
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.35fr_0.9fr] lg:px-10 lg:py-14">
          <div>
            <Badge tone="info">Volunteer continuity MVP</Badge>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Make it easier for nonprofits to find help and keep momentum when volunteers change.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-700">
              BridgeBC matches volunteers to community roles and captures handoff notes so
              programs keep moving, even when someone steps away.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card title="Problem">
                <p>Volunteer turnover leaves nonprofits scrambling to preserve context and coverage.</p>
              </Card>
              <Card title="Value">
                <p>Short-term and ongoing roles are easier to fill with clearer fit signals and handoff support.</p>
              </Card>
              <Card title="Outcome">
                <p>Nonprofits can post needs, review matches, and keep continuity notes in one workflow.</p>
              </Card>
            </div>
          </div>

          <Card
            title="Search roles"
            subtitle="Browse current opportunities from the mock API."
            className="self-start"
          >
            <label className="text-sm font-medium text-slate-600" htmlFor="role-search">
              Search by title, nonprofit, commitment, or location
            </label>
            <input
              id="role-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try outreach, remote, or weekly"
              className="warm-input mt-3"
            />

            <div className="mt-5 space-y-3">
              {error && <p className="text-sm text-orange-700">{error}</p>}
              {!error &&
                filteredRoles.slice(0, 4).map((role) => (
                  <div key={role.id} className="rounded-2xl border border-white/80 bg-[#fff7ef] p-4 shadow-soft">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-pine">{role.task_title || role.title}</p>
                        <p className="text-sm text-slate-600">
                          {role.organization?.org_name || role.nonprofit} • {role.organization?.city || role.location}
                        </p>
                      </div>
                      <Badge
                        tone={
                          role.volunteer_urgency === 'High' || role.volunteer_urgency === 'Critical'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {role.volunteer_urgency || 'Medium'} urgency
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm">
                      {role.task_category} • {role.availability_preference}
                    </p>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Short-term support">
          <p>Surface immediate volunteer needs without losing track of what happens after a placement.</p>
        </Card>
        <Card title="Ongoing roles">
          <p>Highlight recurring commitments where trust, handoff, and language fit matter most.</p>
        </Card>
        <Card title="Continuity-first">
          <p>Pair role matching with notes, next steps, and key contacts to reduce program disruption.</p>
        </Card>
      </section>

      <section className="panel px-6 py-8 lg:px-10">
        <SectionHeader
          eyebrow="Why this matters"
          title="A demo-ready MVP focused on continuity, not just matching."
          description="The first version of BridgeBC shows how roles, volunteer fit, and handoff notes can work together in a simple workflow."
        />
      </section>
    </>
  )
}

export default LandingPage
