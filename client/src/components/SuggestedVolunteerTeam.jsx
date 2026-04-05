import Badge from './Badge.jsx'
import Card from './Card.jsx'
import { getTeamFitLabel } from '../lib/teamMatching.js'

function getVolunteerName(volunteer) {
  return volunteer?.name || [volunteer?.first_name, volunteer?.last_name].filter(Boolean).join(' ')
}

function getInitials(volunteer) {
  const name = getVolunteerName(volunteer)
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function SuggestedVolunteerTeam({ teamRecommendation, anchorVolunteer }) {
  if (!teamRecommendation) {
    return null
  }

  const { bestTeamMembers, teamFitScore, teamReasons } = teamRecommendation

  return (
    <Card
      title="Suggested Volunteer Team"
      subtitle="A small group whose combined strengths could better support this organization."
      className="bg-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex -space-x-3">
              {bestTeamMembers.map((member) => (
                <div
                  key={member.volunteer_id || member.id}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#dfeeee] text-sm font-semibold text-pine shadow-sm"
                >
                  {getInitials(member)}
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-600">
              {bestTeamMembers.map((member, index) => (
                <p key={member.volunteer_id || member.id}>
                  {index === 0 && (member.volunteer_id || member.id) === (anchorVolunteer.volunteer_id || anchorVolunteer.id)
                    ? `${getVolunteerName(member)} (you)`
                    : getVolunteerName(member)}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] bg-[#fbf8f2] px-5 py-4 text-right shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
            {getTeamFitLabel(teamFitScore)}
          </p>
          <p className="mt-2 text-3xl font-semibold text-pine">{teamFitScore.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">Team fit score</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {bestTeamMembers.map((member, index) => (
          <Badge
            key={`team-member-${member.volunteer_id || member.id}`}
            tone={index === 0 ? 'success' : 'info'}
          >
            {index === 0 ? `${getVolunteerName(member)} (anchor)` : getVolunteerName(member)}
          </Badge>
        ))}
      </div>

      <ul className="mt-6 space-y-2">
        {teamReasons.map((reason) => (
          <li key={reason} className="flex gap-3 text-sm text-slate-700">
            <span aria-hidden="true" className="mt-1 text-pine">
              ✦
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default SuggestedVolunteerTeam
