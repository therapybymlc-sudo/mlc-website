import BookingRequestsClient from './BookingRequestsClient';

export const metadata = {
  title: 'Booking requests',
  description: 'Review, confirm, decline, or cancel client session requests.',
};

export default function TherapistBookingRequestsPage() {
  return <BookingRequestsClient />;
}
