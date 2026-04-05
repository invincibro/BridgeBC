// VolunteerProfilePage doubles as the volunteer-facing dashboard.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import {
  getRecommendedOrganizationsForVolunteer,
  getVolunteerById,
  getVolunteers,
} from '../services/api.js'

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function getVolunteerName(volunteer) {
  if (volunteer?.name) {
    return volunteer.name
  }

  return [volunteer?.first_name, volunteer?.last_name].filter(Boolean).join(' ')
}

function getScoreLabel(score) {
  if (score >= 0.85) return 'Strong match'
  if (score >= 0.65) return 'Good fit'
  if (score >= 0.45) return 'Worth a look'
  return 'Early fit'
}

function getUrgencyTone(urgency) {
  if (urgency === 'Critical' || urgency === 'High') return 'warning'
  if (urgency === 'Medium') return 'info'
  return 'default'
}

function getBackgroundCheckTone(required) {
  return required ? 'warning' : 'success'
}

function getMatchReasons(volunteer, organization) {
  const volunteerSkills = normalizeList(volunteer.skills)
  const volunteerLanguages = normalizeList(volunteer.languages_spoken)
  const volunteerInterests = normalizeList(
    volunteer.cause_areas_of_interest || volunteer.interests,
  )
  const volunteerAvailability = normalizeList(
    volunteer.availability_options || volunteer.availability,
  )
  const orgSkills = normalizeList(organization.skills_needed)
  const orgLanguages = normalizeList(organization.languages_needed)
  const orgAvailability = normalizeList(organization.availability_preference)
  const reasons = []

  const sharedLanguage = volunteerLanguages.find((language) => orgLanguages.includes(language))
  if (sharedLanguage) {
    reasons.push(`Your ${sharedLanguage} language skills can help people feel understood.`)
  }

  const sharedSkill = volunteerSkills.find((skill) => orgSkills.includes(skill))
  if (sharedSkill) {
    reasons.push(`Your ${sharedSkill.toLowerCase()} experience lines up with this need.`)
  }

  const sharedInterest = volunteerInterests.find((interest) => interest === organization.sector)
  if (sharedInterest) {
    reasons.push(`This aligns with your interest in ${sharedInterest.toLowerCase()}.`)
  }

  if (
    volunteerAvailability.length > 0 &&
    orgAvailability.length > 0 &&
    volunteerAvailability.some((slot) =>
      orgAvailability.join(' ').toLowerCase().includes(String(slot).toLowerCase()),
    )
  ) {
    reasons.push('Your availability overlaps with the times this organization needs support.')
  }

  if (reasons.length === 0) {
    reasons.push('Your profile suggests you could step in quickly and support this team with care.')
  }

  return reasons.slice(0, 2)
}

function getRoleImpact(organization) {
  const volunteersNeeded = organization.volunteers_currently_needed || 1
  const sector = organization.sector || 'community support'

  if (sector.toLowerCase().includes('senior')) {
    return `${volunteersNeeded} volunteer${volunteersNeeded > 1 ? 's' : ''} could help seniors stay connected this week.`
  }

  if (sector.toLowerCase().includes('youth')) {
    return `${volunteersNeeded} volunteer${volunteersNeeded > 1 ? 's' : ''} could create more steady support for young people.`
  }

  if (sector.toLowerCase().includes('food')) {
    return `${volunteersNeeded} volunteer${volunteersNeeded > 1 ? 's' : ''} could help keep food support moving smoothly.`
  }

  return `${volunteersNeeded} volunteer${volunteersNeeded > 1 ? 's' : ''} could make this organization’s work feel lighter and more consistent.`
}

function getImpactHighlights(volunteer, recommendations) {
  const volunteerLanguages = normalizeList(volunteer.languages_spoken)
  const volunteerAvailability = normalizeList(
    volunteer.availability_options || volunteer.availability,
  )

  const languageMatches = recommendations.filter((organization) =>
    normalizeList(organization.languages_needed).some((language) =>
      volunteerLanguages.includes(language),
    ),
  )

  const urgencyMatches = recommendations.filter(
    (organization) =>
      organization.volunteer_urgency === 'High' || organization.volunteer_urgency === 'Critical',
  )

  const weekdayMatches = recommendations.filter((organization) =>
    normalizeList(organization.availability_preference).some((slot) =>
      String(slot).toLowerCase().includes('weekday'),
    ),
  )

  return [
    languageMatches.length
      ? `${languageMatches.length} organization${languageMatches.length > 1 ? 's' : ''} need the languages you already speak.`
      : 'Your profile is ready for organizations that need flexible, dependable support.',
    urgencyMatches.length
      ? `${urgencyMatches.length} high-need role${urgencyMatches.length > 1 ? 's are' : ' is'} looking for help soon.`
      : 'There are gentle, lower-pressure opportunities available right now.',
    volunteerAvailability.length && weekdayMatches.length
      ? 'Your availability overlaps with weekday roles that need steady support.'
      : 'A complete profile will unlock even more tailored opportunities.',
  ]
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
          setError('No volunteer profiles are available yet. Add one to start seeing community matches.')
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
    return <p className="rounded-3xl bg-orange-50 p-6 text-orange-700">{error}</p>
  }

  if (!volunteer) {
    return <p className="rounded-3xl bg-white/80 p-6">Loading your volunteer dashboard...</p>
  }

  const volunteerName = getVolunteerName(volunteer)
  const firstName = volunteerName.split(' ')[0] || 'there'
  const languages = normalizeList(volunteer.languages_spoken)
  const skills = normalizeList(volunteer.skills)
  const interests = normalizeList(volunteer.cause_areas_of_interest || volunteer.interests)
  const availability = normalizeList(volunteer.availability_options || volunteer.availability)
  const strongestRecommendation = recommendedOrganizations[0]
  const nextRecommendations = recommendedOrganizations.slice(1, 4)
  const impactHighlights = getImpactHighlights(volunteer, recommendedOrganizations)
  const volunteerDescriptionParts = [
    volunteer.neighbourhood || 'Community location not provided',
    volunteer.background_check_status || 'Background check status pending',
  ].filter(Boolean)

  return (
    <div className="panel overflow-hidden border-white/80 bg-[#fbfaf7]/95 p-4 shadow-panel sm:p-6 lg:p-8">
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.92fr]">
          <div className="rounded-[2.5rem] bg-white px-6 py-7 shadow-sm sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-moss">
                  Volunteer Dashboard
                </p>
                <h1 className="mt-3 text-4xl leading-tight tracking-tight text-pine sm:text-6xl">
                  Welcome back, {firstName} <span className="not-italic">👋</span>
                </h1>
              </div>
              <div className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-slate-600">
                {volunteerDescriptionParts.join(' • ')}
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-xl text-slate-700">
              Your time and skills can make a real difference in your community.
            </p>
            <p className="mt-3 max-w-3xl text-base text-slate-600">
              {strongestRecommendation
                ? `Right now, you’re especially well matched for ${
                    strongestRecommendation.account_name || strongestRecommendation.legal_name
                  } because your profile overlaps with the support they need most.`
                : 'Complete your profile and we’ll surface the organizations where you can step in with confidence and care.'}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#recommended-organizations" className="button-primary">
                See your best matches
              </a>
              <Link to="/volunteers/new" className="button-secondary">
                Update your profile
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.8rem] bg-[#dfeeee] p-5">
                <p className="text-sm font-semibold text-pine">Opportunities for you</p>
                <p className="mt-3 text-4xl font-semibold text-pine">
                  {recommendedOrganizations.length}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Places where your help could matter this week.
                </p>
              </div>
              <div className="rounded-[1.8rem] bg-[#ffe7b0] p-5">
                <p className="text-sm font-semibold text-pine">Time you can give</p>
                <p className="mt-3 text-4xl font-semibold text-pine">
                  {volunteer.hours_available_per_month || 0}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Hours each month you said feel manageable.
                </p>
              </div>
              <div className="rounded-[1.8rem] bg-[#e7daf7] p-5">
                <p className="text-sm font-semibold text-pine">Strengths you bring</p>
                <p className="mt-3 text-4xl font-semibold text-pine">{skills.length || 0}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Skills that can create steady support for others.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white px-6 py-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">
                    Community pulse
                  </p>
                  <h2 className="mt-2 text-2xl text-pine">Why you matter right now</h2>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff4df] text-2xl">
                  🌿
                </div>
              </div>

              <ul className="mt-5 space-y-4">
                {impactHighlights.map((highlight) => (
                  <li key={highlight} className="rounded-2xl bg-[#eef6f1] px-4 py-3">
                    <p className="text-sm text-slate-700">{highlight}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2.5rem] bg-[#dfeeee] px-6 py-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine">
                Your profile lens
              </p>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-500">Languages</p>
                  <p className="mt-1 text-slate-700">
                    {languages.length ? languages.join(', ') : 'Not provided yet'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-500">Availability</p>
                  <p className="mt-1 text-slate-700">
                    {availability.length ? availability.join(', ') : 'Not provided yet'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-500">Cause areas you care about</p>
                  <p className="mt-1 text-slate-700">
                    {interests.length ? interests.join(', ') : 'Not provided yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.92fr]">
          <div className="space-y-6">
            {strongestRecommendation && (
              <article className="rounded-[2.5rem] bg-[#ffe7b0] p-6 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="success">Featured fit</Badge>
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine">
                        Best current match
                      </p>
                    </div>
                    <h2 className="mt-4 text-3xl text-pine">
                      {strongestRecommendation.account_name || strongestRecommendation.legal_name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {strongestRecommendation.city || 'Remote welcome'} •{' '}
                      {strongestRecommendation.sector || 'Community support'}
                    </p>
                    <p className="mt-4 max-w-xl text-base text-slate-700">
                      {getRoleImpact(strongestRecommendation)}
                    </p>
                  </div>

                  <div className="rounded-[1.7rem] bg-white px-5 py-4 text-right shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
                      {getScoreLabel(Number(strongestRecommendation.score || 0))}
                    </p>
                    <p className="mt-2 text-4xl font-semibold text-pine">
                      {Number(strongestRecommendation.score || 0).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Recommendation score</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.8rem] bg-white/70 p-5">
                  <p className="text-sm font-semibold text-pine">Why this fits you</p>
                  <ul className="mt-3 space-y-2">
                    {getMatchReasons(volunteer, strongestRecommendation).map((reason) => (
                      <li key={reason} className="flex gap-3 text-sm text-slate-700">
                        <span aria-hidden="true" className="mt-1 text-pine">
                          ✦
                        </span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1.4rem] bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Urgency
                    </p>
                    <div className="mt-2">
                      <Badge tone={getUrgencyTone(strongestRecommendation.volunteer_urgency)}>
                        {strongestRecommendation.volunteer_urgency || 'Not set'}
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      People needed
                    </p>
                    <p className="mt-2 text-lg font-semibold text-pine">
                      {strongestRecommendation.volunteers_currently_needed || 0}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Timing
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {strongestRecommendation.availability_preference || 'Flexible timing'}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-white/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Screening
                    </p>
                    <div className="mt-2">
                      <Badge
                        tone={getBackgroundCheckTone(
                          strongestRecommendation.background_check_required,
                        )}
                      >
                        {strongestRecommendation.background_check_required
                          ? 'Background check needed'
                          : 'No background check'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </article>
            )}

            <Card
              title="Your strengths and preferences"
              subtitle="These details help us suggest opportunities where you can feel useful, welcomed, and prepared."
              className="bg-white"
            >
              <div className="space-y-6 text-sm">
                <div className="rounded-2xl bg-sand/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
                    At a glance
                  </p>
                  <p className="mt-2 text-base font-medium text-pine">{volunteerName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {volunteerDescriptionParts.join(' • ')}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-500">Skills you’ve shared</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.length ? (
                      skills.map((skill) => <Badge key={skill}>{skill}</Badge>)
                    ) : (
                      <p>Not provided yet</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-slate-500">Languages</p>
                    <p className="mt-2 text-slate-700">
                      {languages.length ? languages.join(', ') : 'Not provided yet'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Availability</p>
                    <p className="mt-2 text-slate-700">
                      {availability.length ? availability.join(', ') : 'Not provided yet'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Cause areas you care about</p>
                    <p className="mt-2 text-slate-700">
                      {interests.length ? interests.join(', ') : 'Not provided yet'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Volunteer experience</p>
                    <p className="mt-2 text-slate-700">
                      {volunteer.prior_volunteer_experience ||
                        volunteer.experience_level ||
                        'Not provided yet'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Age</p>
                    <p className="mt-2 text-slate-700">{volunteer.age || 'Not provided yet'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Transportation</p>
                    <p className="mt-2 text-slate-700">
                      {volunteer.has_vehicle ? 'Has access to a vehicle' : 'No vehicle listed'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">
                    View another volunteer
                  </p>
                  <h2 className="mt-2 text-2xl text-pine">Switch dashboard context</h2>
                </div>
              </div>
              <label htmlFor="volunteer-select" className="sr-only">
                Volunteer profile
              </label>
              <select
                id="volunteer-select"
                value={volunteer.volunteer_id || volunteer.id}
                onChange={(event) => navigate(`/volunteers/${event.target.value}`)}
                className="warm-input mt-5"
              >
                {volunteerOptions.map((option) => {
                  const optionId = option.volunteer_id || option.id
                  const optionName = getVolunteerName(option) || optionId

                  return (
                    <option key={optionId} value={optionId}>
                      {optionName} ({optionId})
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="rounded-[2.5rem] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-moss">
                    More ways to help
                  </p>
                  <h2 className="mt-2 text-2xl text-pine">Other good-fit organizations</h2>
                </div>
                <div className="rounded-full bg-sand px-3 py-2 text-sm font-medium text-slate-500">
                  {Math.max(recommendedOrganizations.length - 1, 0)} more
                </div>
              </div>

              <div id="recommended-organizations" className="mt-5 space-y-4">
                {recommendedOrganizations.length === 0 && (
                  <p className="text-sm text-slate-500">
                    We don’t have recommendation cards for this volunteer yet. Try completing more of
                    the profile to surface stronger matches.
                  </p>
                )}

                {nextRecommendations.map((organization, index) => {
                  const score = Number(organization.score || 0)
                  const reasons = getMatchReasons(volunteer, organization)

                  return (
                    <article
                      key={organization.id}
                      className={`rounded-[1.9rem] p-5 ${
                        index === 0 ? 'bg-[#f4d7e8]' : 'bg-[#dfeeee]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-pine">
                            {organization.account_name || organization.legal_name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {organization.city || 'Remote welcome'} •{' '}
                            {organization.sector || 'Community support'}
                          </p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-2 text-right shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
                            {getScoreLabel(score)}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-pine">
                            {score.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-700">{reasons[0]}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {normalizeList(organization.languages_needed)
                          .slice(0, 2)
                          .map((language) => (
                            <Badge key={language}>{language}</Badge>
                          ))}
                        {normalizeList(organization.skills_needed)
                          .slice(0, 2)
                          .map((skill) => (
                            <Badge key={skill} tone="info">
                              {skill}
                            </Badge>
                          ))}
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default VolunteerProfilePage
