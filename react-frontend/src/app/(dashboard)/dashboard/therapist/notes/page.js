import NotesClient from "./NotesClient";

export const metadata = {
  title: 'Note Templates | Therapist Dashboard',
  description: 'Manage clinical documentation templates. Create structured forms for individual, couples, and child therapy sessions.',
}

export default function TherapistNotesPage() {
  return <NotesClient />;
}
