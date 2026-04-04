import { FormEvent, useEffect, useState } from 'react'

type OrganizationOption = {
  id: string
  org_name: string
}

type TaskDetails = {
  org_id: string
  task_title: string
  description: string
  skills_needed: string[]
  languages_needed: string[]
  availability_needed: string
  volunteers_currently_needed: number
  urgency: 'Low' | 'Medium' | 'High'
  location_type: 'Remote' | 'In person' | 'Hybrid'
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

const URGENCY_OPTIONS: TaskDetails['urgency'][] = ['Low', 'Medium', 'High']
const LOCATION_OPTIONS: TaskDetails['location_type'][] = ['Remote', 'In person', 'Hybrid']

const emptyTask: TaskDetails = {
  org_id: '',
  task_title: '',
  description: '',
  skills_needed: [],
  languages_needed: ['English'],
  availability_needed: '',
  volunteers_currently_needed: 1,
  urgency: 'Medium',
  location_type: 'In person',
  background_check_required: false,
}

function guessSkills(input: string) {
  const text = input.toLowerCase()
  const skills = SKILL_OPTIONS.filter((skill) =>
    text.includes(skill.toLowerCase().split('/')[0]),
  )

  if (text.includes('mentor') || text.includes('tutor')) {
    skills.push('Tutoring/mentorship')
  }

  if (text.includes('event')) {
    skills.push('Event coordination')
  }

  if (text.includes('transport') || text.includes('drive')) {
    skills.push('Driving/transportation')
  }

  if (text.includes('community') || text.includes('outreach')) {
    skills.push('Outreach/community engagement')
  }

  if (text.includes('translate') || text.includes('interpret')) {
    skills.push('Translation/interpretation')
  }

  if (text.includes('admin')) {
    skills.push('Administrative support')
  }

  if (text.includes('photo')) {
    skills.push('Photography')
  }

  if (!skills.length) {
    skills.push('Outreach/community engagement')
  }

  return [...new Set(skills)]
}

function guessLanguages(input: string) {
  const text = input.toLowerCase()
  const languages: string[] = []

  if (text.includes('mandarin')) languages.push('Mandarin')
  if (text.includes('punjabi')) languages.push('Punjabi')
  if (text.includes('hindi')) languages.push('Hindi')
  if (text.includes('tagalog')) languages.push('Tagalog')
  if (text.includes('french')) languages.push('French')

  if (!languages.length) {
    languages.push('English')
  }

  return languages
}

function guessAvailability(input: string) {
  const text = input.toLowerCase()

  if (text.includes('weekend')) return 'Weekends'
  if (text.includes('evening')) return 'Weekday evenings'
  if (text.includes('morning')) return 'Weekday mornings'
  if (text.includes('afternoon')) return 'Weekday afternoons'

  return 'Flexible'
}

function guessVolunteerCount(input: string) {
  const text = input.toLowerCase()
  const volunteerMatch = text.match(/(\d+)\s+volunteer/)

  if (volunteerMatch) {
    return Number(volunteerMatch[1])
  }

  if (text.includes('team of')) {
    const teamMatch = text.match(/team of\s+(\d+)/)
    if (teamMatch) {
      return Number(teamMatch[1])
    }
  }

  return 1
}

function guessUrgency(input: string): TaskDetails['urgency'] {
  const text = input.toLowerCase()

  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
    return 'High'
  }

  if (text.includes('soon') || text.includes('needed')) {
    return 'Medium'
  }

  return 'Low'
}

function guessLocationType(input: string): TaskDetails['location_type'] {
  const text = input.toLowerCase()

  if (text.includes('remote') || text.includes('virtual') || text.includes('online')) {
    return 'Remote'
  }

  if (text.includes('hybrid')) {
    return 'Hybrid'
  }

  return 'In person'
}

export function generateTaskDetails(input: string): TaskDetails {
  const cleaned = input.trim()

  if (!cleaned) {
    return emptyTask
  }

  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim() || cleaned

  return {
    org_id: '',
    task_title:
      firstSentence.length > 60 ? `${firstSentence.slice(0, 57).trim()}...` : firstSentence,
    description: cleaned,
    skills_needed: guessSkills(cleaned),
    languages_needed: guessLanguages(cleaned),
    availability_needed: guessAvailability(cleaned),
    volunteers_currently_needed: guessVolunteerCount(cleaned),
    urgency: guessUrgency(cleaned),
    location_type: guessLocationType(cleaned),
    background_check_required: cleaned.toLowerCase().includes('background check'),
  }
}

function CreateTask() {
  const [prompt, setPrompt] = useState('')
  const [form, setForm] = useState<TaskDetails>(emptyTask)
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  const [languageInput, setLanguageInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
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

  function handleGenerate() {
    setIsGenerating(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const generated = generateTaskDetails(prompt)
      setForm((current) => ({
        ...generated,
        org_id: current.org_id,
      }))
    } catch {
      setErrorMessage('Unable to generate task details right now.')
    } finally {
      setIsGenerating(false)
    }
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
          task_title: form.task_title,
          task_description: form.description,
          skills_needed: form.skills_needed,
          languages_needed: form.languages_needed,
          availability_needed: form.availability_needed,
          volunteers_currently_needed: form.volunteers_currently_needed,
          urgency: form.urgency,
          location_type: form.location_type,
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
        <p className="mt-2 text-sm text-slate-600">
          Start with a short description, then review and edit the generated task details.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label htmlFor="task-prompt" className="block text-sm font-medium text-slate-700">
            Describe your need
          </label>
          <textarea
            id="task-prompt"
            rows={5}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: We need a volunteer to help newcomers at our Saturday digital literacy drop-in. They should be comfortable teaching basic smartphone use and speaking Punjabi would help."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? 'Generating...' : 'Generate task details'}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="task_title" className="mb-2 block text-sm font-medium text-slate-700">
              Task title
            </label>
            <input
              id="task_title"
              value={form.task_title}
              onChange={(event) => updateField('task_title', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            />
          </div>

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
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            />
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
            <label htmlFor="availability_needed" className="mb-2 block text-sm font-medium text-slate-700">
              Availability needed
            </label>
            <input
              id="availability_needed"
              value={form.availability_needed}
              onChange={(event) => updateField('availability_needed', event.target.value)}
              placeholder="Saturday mornings"
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
            <label htmlFor="urgency" className="mb-2 block text-sm font-medium text-slate-700">
              Urgency
            </label>
            <select
              id="urgency"
              value={form.urgency}
              onChange={(event) => updateField('urgency', event.target.value as TaskDetails['urgency'])}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            >
              {URGENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location_type" className="mb-2 block text-sm font-medium text-slate-700">
              Location type
            </label>
            <select
              id="location_type"
              value={form.location_type}
              onChange={(event) =>
                updateField('location_type', event.target.value as TaskDetails['location_type'])
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
            >
              {LOCATION_OPTIONS.map((option) => (
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
