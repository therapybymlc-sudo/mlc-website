import { apiGet, apiPost, apiPatch, apiDelete } from "../api";

export const schedulingApi = {
  listAvailabilitySlots() {
    return apiGet("availability-slots/");
  },
  createAvailabilitySlot(payload) {
    return apiPost("availability-slots/", payload);
  },
  updateAvailabilitySlot(id, payload) {
    return apiPatch(`availability-slots/${id}/`, payload);
  },
  deleteAvailabilitySlot(id) {
    return apiDelete(`availability-slots/${id}/`);
  },
  blockAvailabilitySlot(id) {
    return apiPost(`availability-slots/${id}/block/`, {});
  },
  unblockAvailabilitySlot(id) {
    return apiPost(`availability-slots/${id}/unblock/`, {});
  },
  generateAvailabilitySlotsBulk(payload) {
    return apiPost(`availability-slots/generate_bulk/`, payload);
  },
  listTherapistBookingRequests() {
    return apiGet("therapist-booking-requests/");
  },
  confirmBookingRequest(id) {
    return apiPost(`therapist-booking-requests/${id}/confirm/`, {});
  },
  declineBookingRequest(id, therapist_response_note) {
    return apiPost(`therapist-booking-requests/${id}/decline/`, {
      therapist_response_note,
    });
  },
  listTherapistAppointments() {
    return apiGet("appointments/");
  },
  cancelTherapistAppointment(id, cancellation_reason) {
    return apiPost(`appointments/${id}/cancel/`, { cancellation_reason });
  },
  listClientAppointments() {
    return apiGet("client-appointments/");
  },
  cancelClientAppointment(id, cancellation_reason) {
    return apiPost(`client-appointments/${id}/cancel/`, { cancellation_reason });
  },
  listTherapistsPublic() {
    return apiGet("therapists/public/");
  },
  listPublicSlots(therapistId) {
    return apiGet(`availability-slots/public/?therapist=${therapistId}`);
  },
  createBookingRequest(payload) {
    return apiPost("booking-requests/", payload);
  },
  listClientBookingRequests() {
    return apiGet("booking-requests/");
  },
  listNotifications() {
    return apiGet("notifications/");
  },
  markNotificationRead(id) {
    return apiPost(`notifications/${id}/mark_read/`, {});
  },
  terminateRelationship() {
    return apiPost(`clients/terminate_relationship/`, {});
  },
  getTherapistProfile(id) {
    return apiGet(`therapists/${id}/`);
  },
  updateTherapistProfile(id, payload) {
    return apiPatch(`therapists/${id}/`, payload);
  },
};
