// ContinuityNotesPage highlights handoff notes, next steps, and contact details.
import { useEffect, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { getContinuityNotes } from '../services/api.js'

function ContinuityNotesPage() {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    getContinuityNotes().then(setNotes).catch(() => setNotes([]))
  }, [])

  return (
    <>
      <SectionHeader
        eyebrow="Continuity notes"
        title="Capture handoff notes before context disappears."
        description="These mock records show the kind of information BridgeBC can preserve between outgoing and incoming volunteers."
      />

      <section className="grid gap-6">
        {notes.map((note) => (
          <Card
            key={note.id}
            title={note.roleTitle}
            subtitle={`${note.nonprofit} • Outgoing: ${note.outgoingVolunteer}`}
          >
            <div className="flex flex-wrap gap-2">
              <Badge tone={note.alertLevel === 'High' ? 'danger' : note.alertLevel === 'Medium' ? 'warning' : 'success'}>
                {note.alertLevel} alert
              </Badge>
              <Badge tone="info">Incoming: {note.incomingVolunteer}</Badge>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Handoff notes
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {note.handoffNotes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Next steps
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {note.nextSteps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Key contacts
                </p>
                <ul className="mt-3 space-y-3 text-sm text-slate-600">
                  {note.keyContacts.map((contact) => (
                    <li key={contact.email}>
                      <p className="font-semibold text-pine">{contact.name}</p>
                      <p>{contact.role}</p>
                      <p>{contact.email}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </>
  )
}

export default ContinuityNotesPage
