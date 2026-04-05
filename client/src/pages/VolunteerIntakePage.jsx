import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import FormField from '../components/FormField.jsx'
import { SelectInput, TextInput, TogglePillGroup } from '../components/FormControls.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { toggleListValue } from '../lib/forms.js'
import { createVolunteer, getVolunteers } from '../services/api.js'

const languageOptions = ['English', 'French', 'Cantonese', 'Mandarin', 'Punjabi', 'Hindi', 'Tagalog']

const skillOptions = [
  'Translation/interpretation',
  'Accounting/bookkeeping',
  'Administrative support',
  'Public speaking',
  'Photography',
  'Driving/transportation',
  'Tutoring/mentorship',
  'Legal knowledge',
  'Childcare support',
  'Social media',
  'Data entry',
  'Cooking/food prep',
  'Elder care',
  'Outreach/community engagement',
  'Mental health support',
]

const interestOptions = [
  'Disability services',
  'Indigenous communities',
  'Arts & culture',
  'Anti-poverty',
  'Mental health',
  'Newcomer support',
  'Women & gender equity',
  'Environment',
  'Housing & homelessness',
  'Animal welfare',
  'Education & literacy',
  'Senior services',
]

const availabilityOptions = [
  { label: 'Weekday mornings', key: 'weekday_morning' },
  { label: 'Weekday afternoons', key: 'weekday_afternoon' },
  { label: 'Weekday evenings', key: 'weekday_evening' },
  { label: 'Weekend mornings', key: 'weekend_morning' },
  { label: 'Weekend afternoons', key: 'weekend_afternoon' },
  { label: 'Weekend evenings', key: 'weekend_evening' },
]

const experienceOptions = ['None', 'Some (1-2 orgs)', 'Experienced (3+ orgs)']
const backgroundStatusOptions = ['Not yet', 'In progress', 'Completed']

const initialForm = {
  first_name: '',
  last_name: '',
  age: '',
  neighbourhood: '',
  languages_spoken: ['English'],
  skills: [],
  interests: [],
  hours_available_per_month: 4,
  experience_level: 'Some (1-2 orgs)',
  has_vehicle: false,
  background_check_status: 'Not yet',

  weekday_morning: false,
  weekday_afternoon: false,
  weekday_evening: false,
  weekend_morning: false,
  weekend_afternoon: false,
  weekend_evening: false,
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
        [field]:
          field === 'hours_available_per_month' || field === 'age'
            ? Number(value)
            : value,
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
        title="Volunteer intake"
      />

      <section className="mx-auto w-full max-w-4xl">
        <Card title="Volunteer profile">
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

            <FormField label="Age" htmlFor="age">
              <TextInput
                id="age"
                type="number"
                value={form.age}
                onChange={updateField('age')}
                placeholder="19"
              />
            </FormField>

            <FormField label="Neighbourhood" htmlFor="neighbourhood" required>
              <TextInput
                id="neighbourhood"
                value={form.neighbourhood}
                onChange={updateField('neighbourhood')}
                placeholder="Kitsilano"
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
              <FormField label="Languages spoken">
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
              <FormField label="Skills">
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
              <FormField label="Cause areas of interest">
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
              <FormField label="Availability preference">
                <div className="grid gap-3 sm:grid-cols-2">
                  {availabilityOptions.map(({ label, key }) => {
                    const checked = form[key]

                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                          checked
                            ? 'border-pine bg-sky'
                            : 'border-slate-200 bg-white hover:border-moss'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setForm((current) => ({
                              ...current,
                              [key]: !current[key],
                            }))
                          }
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    )
                  })}
                </div>
              </FormField>
            </div>

            <FormField label="Prior volunteer experience">
              <SelectInput
                value={form.experience_level}
                onChange={updateField('experience_level')}
                options={experienceOptions}
              />
            </FormField>

            <FormField label="Background check status">
              <SelectInput
                value={form.background_check_status}
                onChange={updateField('background_check_status')}
                options={backgroundStatusOptions}
              />
            </FormField>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 rounded-2xl border border-[#eadfcf] bg-[#fff7ef] px-4 py-4 shadow-soft transition duration-200">
                <input
                  type="checkbox"
                  checked={form.has_vehicle}
                  onChange={updateField('has_vehicle')}
                  className="mt-1 h-4 w-4"
                />
                <div>
                  <p className="font-medium text-pine">Has vehicle</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Transport availability for roles outside transit corridors.
                  </p>
                </div>
              </label>
            </div>

            {error && <p className="md:col-span-2 text-sm text-orange-700">{error}</p>}

            {createdVolunteer && (
              <div className="md:col-span-2 rounded-2xl border border-[#b8dfbc] bg-[#eef7ea] p-4 text-sm text-[#2e6840] shadow-soft">
                Saved{' '}
                <span className="font-semibold">
                  {createdVolunteer.name ||
                    `${createdVolunteer.first_name || ''} ${
                      createdVolunteer.last_name || ''
                    }`.trim()}
                </span>
                . This person is now available for matching.
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="button-primary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving volunteer...' : 'Save volunteer profile'}
              </button>
            </div>

          </form>
        </Card>
      </section>
    </>
  )
}

export default VolunteerIntakePage
