import { useState } from 'react'
import Card from '../components/Card.jsx'
import FormField from '../components/FormField.jsx'
import { SelectInput, TextInput, TogglePillGroup } from '../components/FormControls.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { toggleListValue } from '../lib/forms.js'
import { createOrganization } from '../services/api.js'

const orgSizeOptions = [
  'Micro (1-5 staff)',
  'Small (6-15 staff)',
  'Medium (16-50 staff)',
  'Large (51+ staff)',
]
const provinceOptions = ['BC', 'AB', 'ON', 'QC', 'NS', 'NB', 'PE', 'NL', 'SK', 'MB', 'YT', 'NT', 'NU']
const countryOptions = ['CA', 'US']
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
  { field: 'weekday_morning', label: 'Weekday morning' },
  { field: 'weekday_afternoon', label: 'Weekday afternoon' },
  { field: 'weekday_evening', label: 'Weekday evening' },
  { field: 'weekend_morning', label: 'Weekend morning' },
  { field: 'weekend_afternoon', label: 'Weekend afternoon' },
  { field: 'weekend_evening', label: 'Weekend evening' },
]

const initialForm = {
  BN: '',
  legal_name: '',
  account_name: '',
  address1: '',
  address2: '',
  sector: '',
  city: '',
  province: 'BC',
  postal_code: '',
  country: 'CA',
  org_size: 'Small (6-15 staff)',
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

  if (weekdayCount === 3 && weekendCount === 0) {
    return 'Weekdays preferred'
  }

  if (weekdayCount === 0 && weekendCount > 0) {
    return 'Weekends'
  }

  if (weekdayCount > 0 && weekendCount > 0) {
    return 'Flexible'
  }

  if (form.weekday_morning) return 'Weekday mornings'
  if (form.weekday_afternoon) return 'Weekday afternoons'
  if (form.weekday_evening) return 'Weekday evenings'

  return ''
}

function OrganizationFormPage() {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdOrganization, setCreatedOrganization] = useState(null)

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

    try {
      const organization = await createOrganization({
        ...form,
        availability_preference: deriveAvailabilityPreference(form),
      })
      setCreatedOrganization(organization)
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
        eyebrow="Organization setup"
        title="Create the nonprofit record and current volunteer need in one form."
        description="This page now matches your current organizations table, which stores both nonprofit profile fields and the active volunteer need fields in the same row."
      />

      <section className="mx-auto w-full max-w-4xl">
        <div className="space-y-6">
          <Card title="Organization and need form" subtitle="Because your SQL keeps profile fields and current need fields together, this form saves both at once.">
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <FormField
                label="Business number (BN)"
                htmlFor="BN"
                required
                hint="Use the BN field from your nonprofit table."
              >
                <TextInput
                  id="BN"
                  value={form.BN}
                  onChange={updateField('BN')}
                  placeholder="886937309RR"
                />
              </FormField>
              <FormField label="Organization size" htmlFor="org_size">
                <SelectInput
                  id="org_size"
                  value={form.org_size}
                  onChange={updateField('org_size')}
                  options={orgSizeOptions}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Legal name" htmlFor="legal_name" required>
                  <TextInput
                    id="legal_name"
                    value={form.legal_name}
                    onChange={updateField('legal_name')}
                    placeholder="North Shore Food Link Society"
                  />
                </FormField>
              </div>
              <FormField
                label="Account name"
                htmlFor="account_name"
                hint="Optional public-facing name if it is shorter than the legal name."
              >
                <TextInput
                  id="account_name"
                  value={form.account_name}
                  onChange={updateField('account_name')}
                  placeholder="North Shore Food Link"
                />
              </FormField>
              <FormField label="Sector / category" htmlFor="sector" required>
                <TextInput
                  id="sector"
                  value={form.sector}
                  onChange={updateField('sector')}
                  placeholder="Food access"
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Address line 1" htmlFor="address1" required>
                  <TextInput
                    id="address1"
                    value={form.address1}
                    onChange={updateField('address1')}
                    placeholder="805 West Broadway"
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Address line 2"
                  htmlFor="address2"
                  hint="Optional suite, unit, or floor."
                >
                  <TextInput
                    id="address2"
                    value={form.address2}
                    onChange={updateField('address2')}
                    placeholder="12th Floor"
                  />
                </FormField>
              </div>
              <FormField
                label="City"
                htmlFor="city"
                required
                hint="Use the city field from the organizations table."
              >
                <TextInput
                  id="city"
                  value={form.city}
                  onChange={updateField('city')}
                  placeholder="North Vancouver"
                />
              </FormField>
              <FormField label="Province" htmlFor="province" required>
                <SelectInput
                  id="province"
                  value={form.province}
                  onChange={updateField('province')}
                  options={provinceOptions}
                />
              </FormField>
              <FormField label="Postal code" htmlFor="postal_code" required>
                <TextInput
                  id="postal_code"
                  value={form.postal_code}
                  onChange={updateField('postal_code')}
                  placeholder="V5Z1K1"
                />
              </FormField>
              <FormField label="Country" htmlFor="country" required>
                <SelectInput
                  id="country"
                  value={form.country}
                  onChange={updateField('country')}
                  options={countryOptions}
                />
              </FormField>
              <div className="md:col-span-2 mt-2 border-t border-slate-200 pt-6">
                <h3 className="text-xl font-semibold text-pine">Current volunteer need</h3>
                <p className="mt-1 text-sm text-slate-500">
                  These fields are stored on the same `organizations` row in your current schema.
                </p>
              </div>
              <FormField
                label="Number of volunteers currently needed"
                htmlFor="volunteers_currently_needed"
              >
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
                <FormField
                  label="Preferred volunteer time slots"
                  htmlFor="weekday_morning"
                  hint="These checkbox selections now define the saved availability preference."
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
                  <p className="mt-3 text-sm text-slate-500">
                    Saved as: {deriveAvailabilityPreference(form) || 'No preference selected yet'}
                  </p>
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
                    <p className="mt-1 text-sm text-slate-600">
                      Keep this on the organization row for now because the current SQL stores it there.
                    </p>
                  </div>
                </label>
              </div>
              {error && <p className="md:col-span-2 text-sm text-orange-700">{error}</p>}
              {createdOrganization && (
                <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Saved <span className="font-semibold">{createdOrganization.org_name}</span> with
                  the organization details and current volunteer need.
                </div>
              )}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving organization...' : 'Save organization and current need'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </>
  )
}

export default OrganizationFormPage
