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
              Right now, BridgeBC supports organization setup, volunteer onboarding, and a
              volunteer dashboard with recommendation scores that explain why a match makes
              sense.
            </p>

            <div >
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

 
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <Card title="1. Set up the organization">
          <p>Capture nonprofit identity, location, sector, and the support context in one friendly flow.</p>
        </Card>
        <Card title="2. Invite volunteer profiles">
          <p>Let people share what they can offer, how much time they have, and where they want to help.</p>
        </Card>
        <Card title="3. Review meaningful matches">
          <p>See recommendations and scores in a way that highlights fit, community need, and readiness.</p>
        </Card>
        <Card title="4. Build stronger teams">
          <p>Spot similar volunteers and suggested volunteer teams that can better support one organization together.</p>
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
                Create an organization and shape the support context that volunteers will match against.
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

      
    </>
  )
}

export default LandingPage
