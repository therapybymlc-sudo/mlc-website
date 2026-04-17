import PublicProfileClient from "./PublicProfileClient";

// 🔍 Generate Metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const res = await fetch(`https://api.mlchealth.in/api/therapists/${id}/`, { next: { revalidate: 3600 } });
    const therapist = await res.json();
    
    return {
      title: `${therapist.name} | ${therapist.title || 'Psychotherapist'} | MLC Health`,
      description: therapist.headline || `Book a therapy session with ${therapist.name}. Specializing in ${therapist.focus_areas?.join(', ') || 'mental wellness'}.`,
      openGraph: {
        title: `${therapist.name} - MLC Health`,
        description: therapist.headline,
        images: [therapist.profile_image_url],
      },
    };
  } catch (err) {
    return { title: 'Therapist Profile | MLC Health' };
  }
}

export default async function TherapistPublicPage({ params }) {
  const { id } = params;
  
  let therapist = null;
  try {
    const res = await fetch(`https://api.mlchealth.in/api/therapists/${id}/`, { next: { revalidate: 3600 } });
    if (res.ok) {
        therapist = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch therapist for SSR", err);
  }

  return <PublicProfileClient therapist={therapist} />;
}
