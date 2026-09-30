'use client'

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@chakra-ui/react";

export default function FullCalendarWrapper({
  events,
  onSelect,
  onEventClick,
  onEventResize,
  businessHours,
  eventContent,
  initialView = "timeGridWeek",
  dayHeaderFormat,
  height = "720px",
  slotHeight = 2.4,
}) {
  return (
    <Box
      className="calendar-container"
      sx={{
        ".fc": {
          fontFamily: "'Inter', var(--font-inter), sans-serif",
          color: "#263A33",
        },
        /* Toolbar */
        ".fc-header-toolbar": {
          padding: { base: "12px 14px", md: "16px 20px" },
          background: "white",
          borderBottom: "1px solid rgba(86, 117, 109, 0.12)",
          marginBottom: "0 !important",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { base: 2, md: 4 },
        },
        ".fc-toolbar-title": {
          fontFamily: "'Outfit', var(--font-outfit), sans-serif",
          fontSize: { base: "15px", sm: "17px", md: "18px" },
          fontWeight: "600",
          color: "#263A33",
          letterSpacing: "-0.015em",
        },
        /* Navigation (Prev / Next) */
        ".fc-prev-button, .fc-next-button": {
          background: "rgba(250, 248, 245, 0.95) !important",
          border: "1px solid rgba(86, 117, 109, 0.22) !important",
          color: "#263A33 !important",
          borderRadius: "full !important",
          width: "32px !important",
          height: "32px !important",
          padding: "0 !important",
          display: "inline-flex !important",
          alignItems: "center !important",
          justifyContent: "center !important",
          boxShadow: "none !important",
          transition: "0.15s ease",
          "&:hover": {
            background: "white !important",
            borderColor: "#56756D !important",
            color: "#56756D !important",
          },
          "&:focus": {
            boxShadow: "0 0 0 2px rgba(86, 117, 109, 0.2) !important",
          },
        },
        /* Today button */
        ".fc-today-button": {
          background: "white !important",
          border: "1px solid rgba(86, 117, 109, 0.25) !important",
          color: "#263A33 !important",
          fontFamily: "'Inter', sans-serif !important",
          fontSize: "12px !important",
          fontWeight: "600 !important",
          borderRadius: "full !important",
          height: "32px !important",
          padding: "0 14px !important",
          textTransform: "capitalize",
          boxShadow: "none !important",
          transition: "0.15s ease",
          "&:hover": {
            background: "rgba(86, 117, 109, 0.08) !important",
            borderColor: "#56756D !important",
          },
          "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
          },
        },
        /* Segmented View Switcher (Month, Week, Day) */
        ".fc-button-group": {
          background: "rgba(250, 248, 245, 0.95)",
          border: "1px solid rgba(86, 117, 109, 0.15)",
          borderRadius: "full",
          padding: "2.5px",
          gap: "2px",
          display: "inline-flex",
          "& > .fc-button": {
            background: "transparent !important",
            border: "none !important",
            color: "#5A6E65 !important",
            fontSize: "12px !important",
            fontWeight: "500 !important",
            borderRadius: "full !important",
            padding: "4px 12px !important",
            height: "28px !important",
            boxShadow: "none !important",
            textTransform: "capitalize",
            transition: "0.15s ease",
            "&:hover": {
              color: "#263A33 !important",
              background: "rgba(86, 117, 109, 0.08) !important",
            },
          },
          "& > .fc-button-active": {
            background: "#56756D !important",
            color: "white !important",
            fontWeight: "600 !important",
            boxShadow: "0 2px 6px rgba(86, 117, 109, 0.25) !important",
            "&:hover": {
              background: "#4A665E !important",
              color: "white !important",
            },
          },
        },
        /* Table Headers (Days) */
        ".fc-col-header": {
          background: "#FAF8F5",
          borderBottom: "1px solid rgba(86, 117, 109, 0.12)",
        },
        ".fc-col-header-cell": {
          padding: "8px 0 !important",
          borderColor: "rgba(86, 117, 109, 0.08) !important",
        },
        ".fc-col-header-cell-cushion": {
          fontFamily: "'Inter', var(--font-inter), sans-serif",
          color: "#263A33 !important",
          fontSize: "12.5px !important",
          fontWeight: "600 !important",
          textDecoration: "none !important",
          padding: "2px 6px !important",
        },
        ".fc-day-today .fc-col-header-cell-cushion": {
          color: "#56756D !important",
          fontWeight: "700 !important",
        },
        /* Grid Lines & Slot Structure */
        ".fc-timegrid-slot": {
          height: `${slotHeight}rem`,
          borderColor: "rgba(86, 117, 109, 0.07) !important",
        },
        ".fc-timegrid-slot-lane": {
          "&:hover": {
            background: "rgba(86, 117, 109, 0.02)",
          },
        },
        ".fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion": {
          color: "#718096 !important",
          fontSize: "11px !important",
          fontWeight: "500 !important",
          fontFamily: "'Inter', sans-serif !important",
        },
        ".fc-theme-standard td, .fc-theme-standard th": {
          borderColor: "rgba(86, 117, 109, 0.07) !important",
        },
        ".fc-theme-standard .fc-scrollgrid": {
          borderColor: "transparent !important",
        },
        /* Business & Non-business hours */
        ".fc-business-hour": {
          backgroundColor: "rgba(86, 117, 109, 0.03) !important",
        },
        ".fc-non-business": {
          backgroundColor: "rgba(250, 248, 245, 0.6) !important",
        },
        /* Now Indicator */
        ".fc-timegrid-now-indicator-line": {
          borderColor: "#56756D !important",
          borderWidth: "2px !important",
        },
        ".fc-timegrid-now-indicator-arrow": {
          borderColor: "#56756D !important",
        },
        /* Events */
        ".fc-timegrid-event": {
          borderRadius: "10px !important",
          borderLeft: "4px solid #56756D !important",
          borderTop: "1px solid rgba(86, 117, 109, 0.18) !important",
          borderRight: "1px solid rgba(86, 117, 109, 0.18) !important",
          borderBottom: "1px solid rgba(86, 117, 109, 0.18) !important",
          boxShadow: "0 2px 8px rgba(38, 58, 51, 0.06) !important",
          background: "white !important",
          color: "#263A33 !important",
          overflow: "hidden",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 14px rgba(38, 58, 51, 0.12) !important",
          },
        },
        ".fc-event-main": {
          padding: "2px 4px",
          color: "#263A33 !important",
        },
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        height={height}
        allDaySlot={false}
        nowIndicator={true}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        selectable={true}
        selectMirror={true}
        editable={true}
        eventDurationEditable={true}
        eventStartEditable={true}
        eventResizableFromStart={false}
        businessHours={businessHours || true}
        select={onSelect}
        eventClick={onEventClick}
        eventResize={onEventResize}
        eventContent={eventContent}
        dayHeaderFormat={dayHeaderFormat || { weekday: "short", day: "numeric", month: "numeric", omitCommas: true }}
      />
    </Box>
  );
}
