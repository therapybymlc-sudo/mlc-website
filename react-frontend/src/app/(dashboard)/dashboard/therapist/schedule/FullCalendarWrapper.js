'use client'

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Box } from "@chakra-ui/react";

export default function FullCalendarWrapper({ events, onSelect, onEventClick, businessHours, eventContent }) {
  return (
    <Box className="calendar-container" sx={{
        '.fc-toolbar-title': { fontSize: '1.2rem', fontWeight: 'bold' },
        '.fc-button': { borderRadius: 'full' }
    }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        height="700px"
        allDaySlot={false}
        nowIndicator={true}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        selectable={true}
        selectMirror={true}
        businessHours={businessHours || true}
        select={onSelect}
        eventClick={onEventClick}
        eventContent={eventContent}
      />
    </Box>
  );
}
