import { FormEvent, useEffect, useState } from 'react'

type OrganizationOption = {
  id: string
  org_name: string
}

type TaskDetails = {
  org_id: string
  skills_needed: string[]
  languages_needed: string[]
  availability_preference: string
  volunteers_currently_needed: number
  volunteer_urgency: 'Low' | 'Medium' | 'High' | 'Critical'
  background_check_required: boolean
}

const SKILL_OPTIONS = [
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

const LANGUAGE_OPTIONS = [
  'English',
  'French',
  'Mandarin',
  'Punjabi',
  'Hindi',
  'Tagalog',
]

const URGENCY_OPTIONS: TaskDetails['volunteer_urgency'][] = ['Low', 'Medium', 'High', 'Critical']
const emptyTask: TaskDetails = {
  org_id: '',
  skills_needed: [],
  languages_needed: ['English'],
  availability_preference: '',
  volunteers_currently_needed: 1,
  volunteer_urgency: 'Medium',
  background_check_required: false,
}

function CreateTask() {
  const [form, setForm] = useState<TaskDetails>(emptyTask)
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [languageInput, setLanguageInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const response = await fetch('/api/organizations')

        if (!response.ok) {
          throw new Error('Failed to load organizations')
        }

        const data: OrganizationOption[] = await response.json()
        setOrganizations(data)
        setForm((current) => ({
          ...current,
          org_id: current.org_id || data[0]?.id || '',
        }))
      } catch {
        setErrorMessage('Could not load organizations.')
      } finally {
        setIsLoadingOrganizations(false)
      }
    }

    loadOrganizations()
  }, [])

  function updateField<K extends keyof TaskDetails>(field: K, value: TaskDetails[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function toggleSkill(skill: string) {
    updateField(
      'skills_needed',
      form.skills_needed.includes(skill)
        ? form.skills_needed.filter((item) => item !== skill)
        : [...form.skills_needed, skill],
    )
  }

  function addLanguage(language?: string) {
    const nextLanguage = (language || languageInput).trim()

    if (!nextLanguage || form.languages_needed.includes(nextLanguage)) {
      return
    }

    updateField('languages_needed', [...form.languages_needed, nextLanguage])
    setLanguageInput('')
  }

  function removeLanguage(language: string) {
    updateField(
      'languages_needed',
      form.languages_needed.filter((item) => item !== language),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_id: form.org_id,
          skills_needed: form.skills_needed,
          languages_needed: form.languages_needed,
          availability_preference: form.availability_preference,
          volunteers_currently_needed: form.volunteers_currently_needed,
          volunteer_urgency: form.volunteer_urgency,
          background_check_required: form.background_check_required,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      setSuccessMessage('Task created successfully.')
    } catch {
      setErrorMessage('Could not save task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="panel mx-auto w-full max-w-4xl p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-pine">Create Task</h2>
        <p className="mt-2 text-sm text-slate-600">Fill in the structured task fields below so nonprofits can post clear volunteer needs quickly.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Languages needed
            </label>
            <div className="flex gap-2">
              <input
                value={languageInput}
                onChange={(event) => setLanguageInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addLanguage()
                  }
                }}
                placeholder="Add a language"
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
              />
              <button
                type="button"
                onClick={() => addLanguage()}
                className="rounded-full border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => addLanguage(option)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700"
                >
                  + {option}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.languages_needed.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => removeLanguage(language)}
                  className="rounded-full bg-sky px-3 py-1 text-sm text-slate-800"
                >
                  {language} x
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Skills needed</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    form.skills_needed.includes(skill)
                      ? 'border-pine bg-pine text-white'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills_needed.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="rounded-full bg-sky px-3 py-1 text-sm text-slate-800"
                >
                  {skill} x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="availability_preference" className="mb-2 block text-sm font-medium text-slate-700">
              Availability preference
            </label>
            <input
              id="availability_preference"
              value={form.availability_preference}
              onChange={(event) => updateField('availability_preference', event.target.value)}
              placeholder="Weekdays preferred"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            />
          </div>

          <div>
            <label htmlFor="volunteers_currently_needed" className="mb-2 block text-sm font-medium text-slate-700">
              Number of volunteers needed
            </label>
            <input
              id="volunteers_currently_needed"
              type="number"
              min={1}
              value={form.volunteers_currently_needed}
              onChange={(event) =>
                updateField('volunteers_currently_needed', Number(event.target.value))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            />
          </div>

          <div>
            <label htmlFor="volunteer_urgency" className="mb-2 block text-sm font-medium text-slate-700">
              Volunteer urgency
            </label>
            <select
              id="volunteer_urgency"
              value={form.volunteer_urgency}
              onChange={(event) =>
                updateField(
                  'volunteer_urgency',
                  event.target.value as TaskDetails['volunteer_urgency'],
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            >
              {URGENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-sand px-4 py-4">
              <input
                type="checkbox"
                checked={form.background_check_required}
                onChange={(event) => updateField('background_check_required', event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Background check required</span>
            </label>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-orange-700">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !form.org_id}
            className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Create task'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default CreateTask
