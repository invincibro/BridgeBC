import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '../components/Card.jsx'
import FormField from '../components/FormField.jsx'
import { SelectInput, TextInput, TogglePillGroup } from '../components/FormControls.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { toggleListValue } from '../lib/forms.js'
import { createTask, getOrganizations } from '../services/api.js'

const urgencyOptions = ['Low', 'Medium', 'High', 'Critical']
const languageOptions = ['English', 'French', 'Cantonese', 'Mandarin', 'Punjabi', 'Hindi', 'Tagalog']
const skillOptions = [
  'Tutoring/mentorship',
  'Event coordination',
  'Arts facilitation',
  'Childcare support',
  'Driving/transportation',
  'Cooking/food prep',
  'Administrative support',
  'Mental health support',
  'Outreach/community engagement',
  'Translation/interpretation',
  'Data entry',
  'Social media',
  'Photography',
  'Grant writing',
  'First aid/CPR',
  'Elder care',
  'Teaching/training',
]
const timeSlotOptions = [
  { field: 'weekday_morning', label: 'Weekday mornings' },
  { field: 'weekday_afternoon', label: 'Weekday afternoons' },
  { field: 'weekday_evening', label: 'Weekday evenings' },
  { field: 'weekend_morning', label: 'Weekend mornings' },
  { field: 'weekend_afternoon', label: 'Weekend afternoons' },
  { field: 'weekend_evening', label: 'Weekend evenings' },
]

const initialForm = {
  org_id: '',
  volunteers_currently_needed: 1,
  volunteer_urgency: 'Medium',
  skills_needed: [],
  languages_needed: ['English'],
  background_check_required: false,
  weekday_morning: false,
  weekday_afternoon: false,
  weekday_evening: false,
  weekend_morning: false,
  weekend_afternoon: false,
  weekend_evening: false,
}

function deriveAvailabilityPreference(form) {
  const weekdayCount = [
    form.weekday_morning,
    form.weekday_afternoon,
    form.weekday_evening,
  ].filter(Boolean).length
  const weekendCount = [
    form.weekend_morning,
    form.weekend_afternoon,
    form.weekend_evening,
  ].filter(Boolean).length

  if (weekdayCount === 3 && weekendCount === 0) return 'Weekdays preferred'
  if (weekdayCount === 0 && weekendCount > 0) return 'Weekends preferred'
  if (weekdayCount > 0 && weekendCount > 0) return 'Flexible'
  if (form.weekday_morning) return 'Weekday mornings'
  if (form.weekday_afternoon) return 'Weekday afternoons'
  if (form.weekday_evening) return 'Weekday evenings'
  if (form.weekend_morning) return 'Weekend mornings'
  if (form.weekend_afternoon) return 'Weekend afternoons'
  if (form.weekend_evening) return 'Weekend evenings'

  return ''
}

function VolunteerNeedFormPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(initialForm)
  const [organizations, setOrganizations] = useState([])
  const [saving, setSaving] = useState(false)
  const [loadingOrganizations, setLoadingOrganizations] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await getOrganizations()
        const requestedOrgId = searchParams.get('orgId')
        setOrganizations(data)
        setForm((current) => ({
          ...current,
          org_id: requestedOrgId || current.org_id || data[0]?.id || '',
        }))
      } catch {
        setError('Could not load organizations.')
      } finally {
        setLoadingOrganizations(false)
      }
    }

    loadOrganizations()
  }, [searchParams])

  function updateField(field) {
    return (event) => {
      const value =
        event.target.type === 'checkbox' ? event.target.checked : event.target.value

      setForm((current) => ({
        ...current,
        [field]:
          field === 'volunteers_currently_needed'
            ? Number(value)
            : value,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      await createTask({
        ...form,
        availability_preference: deriveAvailabilityPreference(form),
      })
      setSuccessMessage('Current volunteer need saved successfully.')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Current volunteer need"
        title="Current volunteer need"
      />

      <section className="mx-auto w-full max-w-4xl">
        <Card title="Volunteer need">
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <FormField label="Organization" htmlFor="org_id" required>
              <SelectInput
                id="org_id"
                value={form.org_id}
                onChange={updateField('org_id')}
                options={organizations.map((organization) => ({
                  value: String(organization.id),
                  label: organization.org_name,
                }))}
              />
            </FormField>
            <FormField label="Number of volunteers currently needed" htmlFor="volunteers_currently_needed">
              <TextInput
                id="volunteers_currently_needed"
                type="number"
                value={form.volunteers_currently_needed}
                onChange={updateField('volunteers_currently_needed')}
              />
            </FormField>

            <FormField label="Volunteer urgency" htmlFor="volunteer_urgency">
              <SelectInput
                id="volunteer_urgency"
                value={form.volunteer_urgency}
                onChange={updateField('volunteer_urgency')}
                options={urgencyOptions}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Availability preference"
                htmlFor="weekday_morning"
                hint="Choose all time slots that usually work for this organization."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {timeSlotOptions.map((option) => (
                    <label
                      key={option.field}
                      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        form[option.field]
                          ? 'border-pine bg-sky'
                          : 'border-slate-200 bg-white hover:border-moss'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form[option.field]}
                        onChange={updateField(option.field)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-pine focus:ring-moss"
                      />
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Skills needed" htmlFor="skills_needed">
                <TogglePillGroup
                  options={skillOptions}
                  selected={form.skills_needed}
                  onToggle={(option) =>
                    setForm((current) => ({
                      ...current,
                      skills_needed: toggleListValue(current.skills_needed, option),
                    }))
                  }
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Languages needed" htmlFor="languages_needed">
                <TogglePillGroup
                  options={languageOptions}
                  selected={form.languages_needed}
                  onToggle={(option) =>
                    setForm((current) => ({
                      ...current,
                      languages_needed: toggleListValue(current.languages_needed, option),
                    }))
                  }
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-sand px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.background_check_required}
                  onChange={updateField('background_check_required')}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-pine focus:ring-moss"
                />
                <div>
                  <p className="font-medium text-pine">Background check required</p>
                </div>
              </label>
            </div>

            {loadingOrganizations && <p className="md:col-span-2 text-sm text-slate-500">Loading organizations...</p>}
            {error && <p className="md:col-span-2 text-sm text-orange-700">{error}</p>}
            {successMessage && <p className="md:col-span-2 text-sm text-emerald-700">{successMessage}</p>}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving || !form.org_id}
                className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving current need...' : 'Save current volunteer need'}
              </button>
            </div>
          </form>
        </Card>
      </section>
    </>
  )
}

export default VolunteerNeedFormPage
