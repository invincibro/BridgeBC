// LandingPage introduces the product and lets users explore open roles.
import { Link } from 'react-router-dom'
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
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.3fr_0.92fr] lg:px-10 lg:py-14">
          <div>
            <Badge tone="info">Warm, continuity-first volunteer support</Badge>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Help nonprofits find the right volunteers and keep care moving forward.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-[#54636b]">
              BridgeBC turns nonprofit needs into clearer volunteer opportunities, makes it
              easier to see who is a good fit, and keeps support steady when people hand work
              off to someone new.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/organizations/new" className="button-primary">
                Start with organization setup
              </Link>
              <Link to="/volunteers/dashboard" className="button-secondary">
                View volunteer dashboard
              </Link>
            </div>

            <p className="mt-5 max-w-2xl text-sm text-[#6f7b81]">
              Right now, BridgeBC supports organization setup, current volunteer need intake,
              volunteer onboarding, and a volunteer dashboard with recommendation scores that
              explain why a match makes sense.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Card title="For nonprofits">
                <p>
                  Set up your organization once, then describe the volunteer support you need
                  right now in a clear, structured way.
                </p>
              </Card>
              <Card title="For volunteers">
                <p>
                  Build a profile around languages, skills, interests, and availability so
                  opportunities can feel personal and realistic.
                </p>
              </Card>
              <Card title="For continuity">
                <p>
                  Recommendation scores stay visible, but BridgeBC explains them in plain
                  language so matching feels supportive, not cold.
                </p>
              </Card>
            </div>
          </div>

          <Card
            title="Explore current community needs"
            subtitle="Search the opportunities already available in the app."
            className="self-start"
          >
            <label className="text-sm font-medium text-[#54636b]" htmlFor="role-search">
              Search by title, nonprofit, location, or commitment
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
                  <div
                    key={role.id}
                    className="rounded-[1.4rem] border border-white/80 bg-[#fff7ef] p-4 shadow-soft"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-pine">{role.task_title || role.title}</p>
                        <p className="text-sm text-[#6B7280]">
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
                    <p className="mt-3 text-sm text-[#54636b]">
                      {role.task_category} • {role.availability_preference}
                    </p>
                  </div>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/tasks/new" className="button-secondary">
                Add a current volunteer need
              </Link>
              <Link to="/volunteers/new" className="button-secondary">
                Create a volunteer profile
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <Card title="1. Set up the organization">
          <p>Capture nonprofit identity, location, sector, and the support context in one friendly flow.</p>
        </Card>
        <Card title="2. Add today’s volunteer need">
          <p>Show urgency, skills, languages, and time slots so support feels specific and actionable.</p>
        </Card>
        <Card title="3. Invite volunteer profiles">
          <p>Let people share what they can offer, how much time they have, and where they want to help.</p>
        </Card>
        <Card title="4. Review meaningful matches">
          <p>See recommendations and scores in a way that highlights fit, community need, and readiness.</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card
          title="What BridgeBC can show in a demo right now"
          subtitle="A practical flow you can already walk through from the homepage."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-moss">
                Nonprofit journey
              </p>
              <p className="mt-3 text-base text-[#54636b]">
                Create an organization, describe the current volunteer need, and make the role
                easier for people to step into.
              </p>
            </div>
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-moss">
                Volunteer journey
              </p>
              <p className="mt-3 text-base text-[#54636b]">
                Build a volunteer profile, then open a dashboard that shows scored organization
                recommendations and why they fit.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Quick links" subtitle="Jump straight into the feature you want to demo.">
          <div className="grid gap-3">
            <Link to="/organizations/new" className="surface-card px-5 py-4 transition duration-200 hover:-translate-y-0.5">
              <p className="font-semibold text-[#2F3E46]">Organization setup</p>
              <p className="mt-1 text-sm text-[#6B7280]">Add nonprofit details and support context.</p>
            </Link>
            <Link to="/tasks/new" className="surface-card px-5 py-4 transition duration-200 hover:-translate-y-0.5">
              <p className="font-semibold text-[#2F3E46]">Current volunteer need</p>
              <p className="mt-1 text-sm text-[#6B7280]">Define skills, languages, urgency, and preferred time slots.</p>
            </Link>
            <Link to="/volunteers/new" className="surface-card px-5 py-4 transition duration-200 hover:-translate-y-0.5">
              <p className="font-semibold text-[#2F3E46]">Volunteer intake</p>
              <p className="mt-1 text-sm text-[#6B7280]">Capture strengths, interests, and availability.</p>
            </Link>
            <Link to="/volunteers/dashboard" className="surface-card px-5 py-4 transition duration-200 hover:-translate-y-0.5">
              <p className="font-semibold text-[#2F3E46]">Volunteer dashboard</p>
              <p className="mt-1 text-sm text-[#6B7280]">See recommended organizations and supportive score explanations.</p>
            </Link>
          </div>
        </Card>
      </section>

      <section className="panel px-6 py-8 lg:px-10">
        <SectionHeader
          eyebrow="Why this homepage changed"
          title="The homepage now reflects the product you actually have in your demo."
          description="Instead of describing future ideas in the abstract, it now points people toward the live workflows already in BridgeBC: organization setup, current volunteer need intake, volunteer onboarding, and the volunteer dashboard."
        />
      </section>
    </>
  )
}

export default LandingPage
