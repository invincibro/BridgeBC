// VolunteerMatchPage demonstrates simple frontend matching on top of backend data.
import { useEffect, useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getTasks, getVolunteers } from '../services/api.js'

function normalizeList(values) {
  return (values || []).map((value) => value.toLowerCase())
}

function overlapRatio(source, target) {
  if (!target?.length) {
    return 1
  }

  const sourceValues = normalizeList(source)
  const targetValues = normalizeList(target)
  const matches = targetValues.filter((targetValue) =>
    sourceValues.some((sourceValue) => sourceValue === targetValue),
  ).length

  return matches / targetValues.length
}

function availabilityOverlap(task, volunteer) {
  const schedule = task.availability_needed?.toLowerCase() || ''
  const availability = volunteer.availability || []

  if (!schedule) {
    return 0.5
  }

  if (!availability.length) {
    return 0
  }

  const exactMatch = availability.some((slot) => slot.toLowerCase() === schedule)
  if (exactMatch) {
    return 1
  }

  const partialMatch = availability.some((slot) => {
    const normalizedSlot = slot.toLowerCase()
    return schedule.includes(normalizedSlot) || normalizedSlot.includes(schedule)
  })

  if (partialMatch) {
    return 0.8
  }

  const flexibleMatch = availability.some((slot) => slot.toLowerCase().includes('flexible'))
  return flexibleMatch ? 0.75 : 0.2
}

function causeInterestScore(task, volunteer) {
  const category = task.task_category?.toLowerCase()
  const interests = normalizeList(volunteer.interests)

  if (!category) {
    return 0.5
  }

  return interests.some((interest) => interest === category) ? 1 : 0
}

function backgroundCheckScore(task, volunteer) {
  if (!task.background_check_required) {
    return 1
  }

  const status = volunteer.background_check_status?.toLowerCase() || ''

  if (status === 'completed') {
    return 1
  }

  if (status === 'pending' || status === 'in progress') {
    return 0.4
  }

  return 0
}

function proximityScore(task, volunteer) {
  const taskLocation = task.organization?.city?.toLowerCase() || ''
  const volunteerLocation = volunteer.neighbourhood?.toLowerCase() || ''

  if (!taskLocation || !volunteerLocation) {
    return 0.4
  }

  if (task.location_type?.toLowerCase() === 'remote') {
    return 1
  }

  if (taskLocation.includes(volunteerLocation) || volunteerLocation.includes(taskLocation)) {
    return 1
  }

  return 0.35
}

function urgencyScore(task) {
  const urgencyMap = {
    low: 0.2,
    medium: 0.5,
    high: 0.8,
    critical: 1,
  }

  return urgencyMap[task.urgency?.toLowerCase()] ?? 0.5
}

function scoreVolunteer(task, volunteer) {
  const availabilityScore = availabilityOverlap(task, volunteer)
  const languageTargets = task.languages_needed || []
  const languageScore = overlapRatio(volunteer.languages_spoken, languageTargets)
  const skillScore = overlapRatio(volunteer.skills, task.skills_needed)
  const causeScore = causeInterestScore(task, volunteer)
  const backgroundScore = backgroundCheckScore(task, volunteer)
  const proximity = proximityScore(task, volunteer)
  const urgency = urgencyScore(task)

  const fitScore = Math.round(
    100 *
      (
        0.3 * availabilityScore +
        0.2 * languageScore +
        0.2 * skillScore +
        0.1 * causeScore +
        0.1 * backgroundScore +
        0.05 * proximity +
        0.05 * urgency
      ),
  )

  return {
    fitScore,
    breakdown: {
      availability: Math.round(availabilityScore * 100),
      language: Math.round(languageScore * 100),
      skills: Math.round(skillScore * 100),
      cause: Math.round(causeScore * 100),
      readiness: Math.round(backgroundScore * 100),
    },
  }
}

function VolunteerMatchPage() {
  const [tasks, setTasks] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState('')

  useEffect(() => {
    getTasks().then((data) => {
      setTasks(data)
      setSelectedTaskId(data[0]?.id || '')
    })
    getVolunteers().then(setVolunteers)
  }, [])

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || tasks[0],
    [tasks, selectedTaskId],
  )

  const matches = useMemo(() => {
    if (!selectedTask) {
      return []
    }

    return [...volunteers]
      .map((volunteer) => ({
        ...volunteer,
        ...scoreVolunteer(selectedTask, volunteer),
      }))
      .sort((first, second) => second.fitScore - first.fitScore)
      .slice(0, 4)
  }, [selectedTask, volunteers])

  return (
    <>
      <SectionHeader
        eyebrow="Volunteer matches"
        title="Recommend people based on fit, language, and schedule alignment."
        description="Weighted fit scoring now uses availability, language, skills, cause interest, readiness, proximity, and urgency from the new task and volunteer MVP fields."
      />

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <Card title="Choose a task" subtitle="Change the selected task to refresh recommendations.">
          <label htmlFor="task-select" className="text-sm font-medium text-slate-600">
            Open volunteer task
          </label>
          <select
            id="task-select"
            value={selectedTask?.id || ''}
            onChange={(event) => setSelectedTaskId(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-moss"
          >
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.task_title} - {task.organization?.org_name}
              </option>
            ))}
          </select>

          {selectedTask && (
            <div className="mt-5 rounded-2xl bg-sand p-4">
              <p className="font-semibold text-pine">{selectedTask.task_title}</p>
              <p className="mt-2 text-sm">{selectedTask.task_description}</p>
              <p className="mt-2 text-sm text-slate-500">
                {selectedTask.volunteers_currently_needed} volunteer
                {selectedTask.volunteers_currently_needed === 1 ? '' : 's'} needed
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTask.skills_needed.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
                {(selectedTask.languages_needed || []).map((language) => (
                  <Badge key={language} tone="info">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card title="Recommended people" subtitle="Top matches scored from the current mock data.">
          <div className="grid gap-4">
            {matches.map((volunteer) => (
              <div key={volunteer.id} className="rounded-3xl border border-slate-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-pine">{volunteer.name}</p>
                    <p className="text-sm text-slate-500">{volunteer.neighbourhood}</p>
                  </div>
                  <Badge tone="success">{volunteer.fitScore}% fit</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="font-medium text-slate-500">Language</p>
                    <p>{volunteer.languages_spoken.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Schedule</p>
                    <p>{volunteer.availability.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500">Check status</p>
                    <p>{volunteer.background_check_status}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  <Badge tone="info">Availability {volunteer.breakdown.availability}%</Badge>
                  <Badge tone="info">Language {volunteer.breakdown.language}%</Badge>
                  <Badge tone="info">Skills {volunteer.breakdown.skills}%</Badge>
                  <Badge tone="info">Cause {volunteer.breakdown.cause}%</Badge>
                  <Badge tone="info">Readiness {volunteer.breakdown.readiness}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  )
}

export default VolunteerMatchPage
