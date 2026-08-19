"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg, EventContentArg } from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    type: "group" | "request";
    sessionId?: string;
    requestId?: string;
    isRegistered?: boolean;
    description?: string;
    meetingUrl?: string;
    startsAt?: string;
    endsAt?: string;
    status?: string;
  };
}

type ModalMode = "view-session" | "view-request" | "request-form";

const inputClass =
  "dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<ModalMode>("request-form");
  const [userId, setUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    topic: "",
    preferred_at: "",
  });
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const fetchEvents = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: sessions }, { data: requests }] = await Promise.all([
      supabase
        .from("sessions")
        .select("*, session_registrations(user_id)")
        .eq("status", "scheduled"),
      supabase.from("session_requests").select("*").eq("user_id", user.id),
    ]);

    const sessionEvents: CalendarEvent[] = (sessions ?? []).map((s: any) => ({
      id: `session-${s.id}`,
      title: s.title,
      start: s.starts_at,
      end: s.ends_at,
      extendedProps: {
        calendar: "Primary",
        type: "group",
        sessionId: s.id,
        description: s.description,
        meetingUrl: s.meeting_url,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        isRegistered: (s.session_registrations ?? []).some(
          (r: { user_id: string }) => r.user_id === user.id,
        ),
      },
    }));

    const requestEvents: CalendarEvent[] = (requests ?? [])
      .filter((r: any) => r.preferred_at)
      .map((r: any) => ({
        id: `request-${r.id}`,
        title: `1-on-1: ${r.topic}`,
        start: r.preferred_at,
        extendedProps: {
          calendar:
            r.status === "approved"
              ? "Success"
              : r.status === "rejected"
                ? "Danger"
                : "Warning",
          type: "request",
          requestId: r.id,
          description: r.topic,
          meetingUrl: r.meeting_url,
          status: r.status,
        },
      }));

    setEvents([...sessionEvents, ...requestEvents]);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event as unknown as CalendarEvent;
    setSelectedEvent(event);
    setModalMode(
      event.extendedProps.type === "group" ? "view-session" : "view-request",
    );
    openModal();
  };

  const openRequestForm = () => {
    setSelectedEvent(null);
    setRequestForm({ topic: "", preferred_at: "" });
    setModalMode("request-form");
    openModal();
  };

  const handleRsvp = async () => {
    if (!selectedEvent?.extendedProps.sessionId || !userId) return;
    setActionLoading(true);
    const supabase = createClient();
    const sessionId = selectedEvent.extendedProps.sessionId;

    if (selectedEvent.extendedProps.isRegistered) {
      await supabase
        .from("session_registrations")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("session_registrations")
        .insert({ session_id: sessionId, user_id: userId });
    }

    await fetchEvents();
    setActionLoading(false);
    closeModal();
  };

  const handleSubmitRequest = async () => {
    if (!userId || !requestForm.topic.trim()) return;
    setActionLoading(true);
    const supabase = createClient();
    await supabase.from("session_requests").insert({
      user_id: userId,
      topic: requestForm.topic,
      preferred_at: requestForm.preferred_at || null,
    });
    await fetchEvents();
    setActionLoading(false);
    setRequestForm({ topic: "", preferred_at: "" });
    closeModal();
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status?: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status ?? "pending"] ?? map.pending}`}
      >
        {status ?? "pending"}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next requestSessionButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={false}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            requestSessionButton: {
              text: "Request Session +",
              click: openRequestForm,
            },
          }}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-10"
      >
        <div className="flex flex-col gap-5">
          {/* View group session */}
          {modalMode === "view-session" && selectedEvent && (
            <>
              <div>
                <h5 className="text-theme-xl mb-1 font-semibold text-gray-800 dark:text-white/90">
                  {selectedEvent.title}
                </h5>
                {selectedEvent.extendedProps.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedEvent.extendedProps.description}
                  </p>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Starts:</span>{" "}
                  {formatDateTime(selectedEvent.extendedProps.startsAt)}
                </p>
                <p>
                  <span className="font-medium">Ends:</span>{" "}
                  {formatDateTime(selectedEvent.extendedProps.endsAt)}
                </p>
                {selectedEvent.extendedProps.isRegistered &&
                  selectedEvent.extendedProps.meetingUrl && (
                    <p>
                      <span className="font-medium">Link:</span>{" "}
                      <a
                        href={selectedEvent.extendedProps.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-500 underline"
                      >
                        Join session
                      </a>
                    </p>
                  )}
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={handleRsvp}
                  disabled={actionLoading}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                    selectedEvent.extendedProps.isRegistered
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-brand-500 hover:bg-brand-600"
                  }`}
                >
                  {actionLoading
                    ? "..."
                    : selectedEvent.extendedProps.isRegistered
                      ? "Cancel Registration"
                      : "Register"}
                </button>
              </div>
            </>
          )}

          {/* View 1-on-1 request */}
          {modalMode === "view-request" && selectedEvent && (
            <>
              <div>
                <h5 className="text-theme-xl mb-1 font-semibold text-gray-800 dark:text-white/90">
                  Session Request
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedEvent.extendedProps.description}
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  {statusBadge(selectedEvent.extendedProps.status)}
                </p>
                {selectedEvent.extendedProps.startsAt && (
                  <p>
                    <span className="font-medium">Preferred time:</span>{" "}
                    {formatDateTime(selectedEvent.extendedProps.startsAt)}
                  </p>
                )}
                {selectedEvent.extendedProps.status === "approved" &&
                  selectedEvent.extendedProps.meetingUrl && (
                    <p>
                      <span className="font-medium">Meeting link:</span>{" "}
                      <a
                        href={selectedEvent.extendedProps.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-500 underline"
                      >
                        Join session
                      </a>
                    </p>
                  )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  Close
                </button>
              </div>
            </>
          )}

          {/* Request 1-on-1 form */}
          {modalMode === "request-form" && (
            <>
              <div>
                <h5 className="text-theme-xl mb-1 font-semibold text-gray-800 dark:text-white/90">
                  Request a 1-on-1 Session
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe what you'd like to cover and your preferred time. The
                  mentor will review and confirm.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Topic / What do you need help with?
                  </label>
                  <input
                    type="text"
                    value={requestForm.topic}
                    onChange={(e) =>
                      setRequestForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    placeholder="e.g. CSS Grid layout, debugging my project..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Preferred date & time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={requestForm.preferred_at}
                    onChange={(e) =>
                      setRequestForm((f) => ({
                        ...f,
                        preferred_at: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={actionLoading || !requestForm.topic.trim()}
                  className="bg-brand-500 hover:bg-brand-600 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {actionLoading ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color fc-event-main flex ${colorClass} rounded-sm p-1`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
