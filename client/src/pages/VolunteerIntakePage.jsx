import { useEffect, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import FormField from '../components/FormField.jsx'
import { SelectInput, TextInput, TogglePillGroup } from '../components/FormControls.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { toggleListValue } from '../lib/forms.js'
import { createVolunteer, getVolunteers } from '../services/api.js'

const languageOptions = ['English', 'French', 'Cantonese', 'Mandarin', 'Punjabi', 'Hindi', 'Tagalog']
const skillOptions = [
  'Volunteer coordination',
  'Community outreach',
  'Food safety',
  'Digital literacy',
  'Teaching',
  'Program support',
  'Mentoring',
  'Case notes',
  'Event support',
]
const interestOptions = [
  'Food access',
  'Youth support',
  'Seniors',
  'Education',
  'Digital access',
  'Family support',
  'Community food projects',
]
const availabilityOptions = [
  'Tuesday evenings',
  'Saturday mornings',
  'Wednesday after school',
  'Sunday afternoons',
  'Thursday evenings',
]
const experienceOptions = ['None', 'Some', 'Moderate', 'Extensive']
const backgroundStatusOptions = ['Pending', 'In Progress', 'Completed']

const initialForm = {
  first_name: '',
  last_name: '',
  neighbourhood: '',
  languages_spoken: ['English'],
  skills: [],
  interests: [],
  availability: [],
  hours_available_per_month: 8,
  experience_level: 'None',
  has_vehicle: false,
  background_check_status: 'Pending',
}

function VolunteerIntakePage() {
  const [form, setForm] = useState(initialForm)
  const [volunteers, setVolunteers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdVolunteer, setCreatedVolunteer] = useState(null)

  useEffect(() => {
    getVolunteers().then(setVolunteers).catch(() => setVolunteers([]))
  }, [])

  function updateField(field) {
    return (event) => {
      const value =
        event.target.type === 'checkbox' ? event.target.checked : event.target.value

      setForm((current) => ({
        ...current,
        [field]: field === 'hours_available_per_month' ? Number(value) : value,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const volunteer = await createVolunteer(form)
      setCreatedVolunteer(volunteer)
      setVolunteers((current) => [volunteer, ...current])
      setForm(initialForm)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Volunteer profile"
        title="Collect only the details that actually help matching."
        description="This profile stays focused on skills, languages, availability, interests, and screening so staff can match people quickly."
      />

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card title="Volunteer intake form" subtitle="Short enough for a demo, rich enough for scoring.">
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <FormField label="First name" htmlFor="first_name" required>
              <TextInput
                id="first_name"
                value={form.first_name}
                onChange={updateField('first_name')}
                placeholder="Maya"
              />
            </FormField>
            <FormField label="Last name" htmlFor="last_name" required>
              <TextInput
                id="last_name"
                value={form.last_name}
                onChange={updateField('last_name')}
                placeholder="Chen"
              />
            </FormField>
            <FormField label="Neighbourhood / city" htmlFor="neighbourhood" required>
              <TextInput
                id="neighbourhood"
                value={form.neighbourhood}
                onChange={updateField('neighbourhood')}
                placeholder="Vancouver"
              />
            </FormField>
            <FormField label="Hours available per month" htmlFor="hours_available_per_month">
              <TextInput
                id="hours_available_per_month"
                type="number"
                value={form.hours_available_per_month}
                onChange={updateField('hours_available_per_month')}
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Languages spoken" htmlFor="languages_spoken" required>
                <TogglePillGroup
                  options={languageOptions}
                  selected={form.languages_spoken}
                  onToggle={(option) =>
                    setForm((current) => ({
                      ...current,
                      languages_spoken: toggleListValue(current.languages_spoken, option),
                    }))
                  }
                />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Skills" htmlFor="skills" required>
                <TogglePillGroup
                  options={skillOptions}
                  selected={form.skills}
                  onToggle={(option) =>
                    setForm((current) => ({
                      ...current,
                      skills: toggleListValue(current.skills, option),
                    }))
                  }
                />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Cause areas / interests" htmlFor="interests">
                <TogglePillGroup
                  options={interestOptions}
                  selected={form.interests}
                  onToggle={(option) =>
                    setForm((current) => ({
                      ...current,
                      interests: toggleListValue(current.interests, option),
                    }))
                  }
                />
              </FormField>
            </div>
            <div className="md:col-span-2">
              <FormField label="Availability" htmlFor="availability" required>
                <TogglePillGroup
                  options={availabilityOptions}
                  selected={form.availability}
                  onToggle={(option) =>
                    setForm((current) => ({
                      ...current,
                      availability: toggleListValue(current.availability, option),
                    }))
                  }
                />
              </FormField>
            </div>
            <FormField label="Experience level" htmlFor="experience_level">
              <SelectInput
                id="experience_level"
                value={form.experience_level}
                onChange={updateField('experience_level')}
                options={experienceOptions}
              />
            </FormField>
            <FormField label="Background check status" htmlFor="background_check_status">
              <SelectInput
                id="background_check_status"
                value={form.background_check_status}
                onChange={updateField('background_check_status')}
                options={backgroundStatusOptions}
              />
            </FormField>
            <div className="md:col-span-2">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-sand px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.has_vehicle}
                  onChange={updateField('has_vehicle')}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-pine focus:ring-moss"
                />
                <div>
                  <p className="font-medium text-pine">Has vehicle</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Keep this as a simple transport signal for roles that are less transit-friendly.
                  </p>
                </div>
              </label>
            </div>
            {error && <p className="md:col-span-2 text-sm text-orange-700">{error}</p>}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving volunteer...' : 'Save volunteer profile'}
              </button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Matching fields" subtitle="These fields line up directly with the task form.">
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">languages_spoken</Badge>
              <Badge tone="info">skills</Badge>
              <Badge tone="info">availability</Badge>
              <Badge tone="info">hours_available_per_month</Badge>
              <Badge tone="warning">background_check_status</Badge>
            </div>
          </Card>

          <Card title="Recent volunteers" subtitle="New volunteer profiles appear here immediately.">
            <div className="space-y-4">
              {createdVolunteer && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Saved <span className="font-semibold">{createdVolunteer.name}</span>. This person
                  is now available for matching.
                </div>
              )}

              {volunteers.slice(0, 4).map((volunteer) => (
                <div key={volunteer.id} className="rounded-2xl border border-slate-100 bg-sand p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-pine">{volunteer.name}</p>
                    <Badge tone="info">{volunteer.background_check_status}</Badge>
                  </div>
                  <p className="mt-2 text-sm">
                    {volunteer.neighbourhood} • {volunteer.hours_available_per_month} hrs/month
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{volunteer.skills.join(', ')}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

export default VolunteerIntakePage
