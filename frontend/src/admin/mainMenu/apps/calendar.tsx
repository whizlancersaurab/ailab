/* eslint-disable */
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Link } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import Select from "react-select";

import { addEvent, allEvents, updateEvent, deleteEvent } from "../../../service/api";
import { all_routes } from "../../../router/all_routes";

interface AddEventForm {
  title: string;
  start: string;
  end: string;
  className: string;
}

interface EventResponse {
  id: string;
  title: string;
  start: string;
  end: string;
  className: string;
}

const colorOptions = [
  { value: "bg-success", label: "Green" },
  { value: "bg-danger", label: "Red" },
  { value: "bg-primary", label: "Violet" },
  { value: "bg-warning", label: "Yellow" },
  { value: "bg-info", label: "Blue" },
];

const Calendar = () => {
  const routes = all_routes;

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [weekendsVisible] = useState(true);

  const [formData, setFormData] = useState<AddEventForm>({
    title: "",
    start: "",
    end: "",
    className: "",
  });

  const [editData, setEditData] = useState<AddEventForm>({
    title: "",
    start: "",
    end: "",
    className: "",
  });

  const [errors, setErrors] = useState<Partial<AddEventForm>>({});
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const { data } = await allEvents();
      if (data.success) {
        const converted = data.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          className: event.className,
        }));
        setEvents(converted);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Form validation
  const validate = (data: AddEventForm): boolean => {
    const newErr: Partial<AddEventForm> = {};
    if (!data.title.trim()) newErr.title = "Event title required!";
    if (!data.start) newErr.start = "Start date required!";
    if (!data.end) newErr.end = "End date required!";
    if (!data.className) newErr.className = "Select a color!";
    if (data.start && data.end && new Date(data.end) < new Date(data.start)) {
      newErr.end = "End date should be after start date!";
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  // Handle Add Event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(formData)) return;

    try {
      const { data } = await addEvent(formData);
      if (data.success) {
        toast.success(data.message);
        setFormData({ title: "", start: "", end: "", className: "" });
        setErrors({});
        setShowAddModal(false);
        fetchEvents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add event");
    }
  };

  // Handle Edit Event
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!validate(editData)) return;

    try {
      const { data } = await updateEvent(editData, Number(selectedEvent.id));
      if (data.success) {
        toast.success("Event Updated!");
        setSelectedEvent(null);
        setEditData({ title: "", start: "", end: "", className: "" });
        setErrors({});
        setShowEditModal(false);
        fetchEvents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  // Handle Delete Event
  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const { data } = await deleteEvent(Number(selectedEvent.id));
      if (data.success) {
        toast.success("Event Deleted!");
        setSelectedEvent(null);
        setEditData({ title: "", start: "", end: "", className: "" });
        setShowEditModal(false);
        fetchEvents();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  // Handle Event Click
  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr ?? info.event.startStr,
      className: info.event.classNames[0],
    });

    setEditData({
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr ?? info.event.startStr,
      className: info.event.classNames[0],
    });

    setShowEditModal(true);
  };

  // Modal Scroll Lock
  useEffect(() => {
    if (showAddModal || showEditModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal, showEditModal]);

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Calendar</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">Application</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Calendar
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="row">
          <div className="col-12">
            <div className="card bg-white">
              <div className="card-body">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  initialView="dayGridMonth"
                  editable
                  selectable
                  dayMaxEvents
                  weekends={weekendsVisible}
                  events={events}
                  eventClick={handleEventClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      {showAddModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h4 className="modal-title">Add Event</h4>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAddModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {/* Title */}
                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                      {errors.title && (
                        <small className="text-danger">{errors.title}</small>
                      )}
                    </div>

                    {/* Start Date */}
                    <div className="mb-3">
                      <label className="form-label">Start Date</label>
                      <DatePicker
                        className="form-control"
                        format="DD MMM YYYY"
                        value={formData.start ? dayjs(formData.start) : null}
                        onChange={(d: Dayjs | null) =>
                          setFormData({
                            ...formData,
                            start: d ? d.toISOString() : "",
                          })
                        }
                      />
                      {errors.start && (
                        <small className="text-danger">{errors.start}</small>
                      )}
                    </div>

                    {/* End Date */}
                    <div className="mb-3">
                      <label className="form-label">End Date</label>
                      <DatePicker
                        className="form-control"
                        format="DD MMM YYYY"
                        value={formData.end ? dayjs(formData.end) : null}
                        onChange={(d: Dayjs | null) =>
                          setFormData({
                            ...formData,
                            end: d ? d.toISOString() : "",
                          })
                        }
                      />
                      {errors.end && (
                        <small className="text-danger">{errors.end}</small>
                      )}
                    </div>

                    {/* Color */}
                    <div className="mb-3">
                      <label className="form-label">Color</label>
                      <Select
                        options={colorOptions}
                        value={colorOptions.find(
                          (e: any) => e.value === formData.className
                        )}
                        onChange={(e: any) =>
                          setFormData({ ...formData, className: e.value })
                        }
                      />
                      {errors.className && (
                        <small className="text-danger">{errors.className}</small>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-danger me-2"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* EDIT EVENT MODAL */}
      {showEditModal && selectedEvent && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-header">
                    <h4 className="modal-title">Edit Event</h4>
                    <button
                      type="button"
                      className="btn text-danger"
                      onClick={handleDelete}
                    >
                      <MdDeleteForever size={25} />
                    </button>
                  </div>

                  <div className="modal-body">
                    {/* Title */}
                    <div className="mb-3">
                      <label className="form-label">Event Title</label>
                      <input
                        className="form-control"
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                      />
                    </div>

                    {/* Start Date */}
                    <div className="mb-3">
                      <label className="form-label">Start Date</label>
                      <DatePicker
                        className="form-control"
                        format="DD MMM YYYY"
                        value={dayjs(editData.start)}
                        onChange={(d) =>
                          setEditData({
                            ...editData,
                            start: d ? d.toISOString() : "",
                          })
                        }
                      />
                    </div>

                    {/* End Date */}
                    <div className="mb-3">
                      <label className="form-label">End Date</label>
                      <DatePicker
                        className="form-control"
                        format="DD MMM YYYY"
                        value={dayjs(editData.end)}
                        onChange={(d) =>
                          setEditData({
                            ...editData,
                            end: d ? d.toISOString() : "",
                          })
                        }
                      />
                    </div>

                    {/* Color */}
                    <div className="mb-3">
                      <label className="form-label">Color</label>
                      <Select
                        options={colorOptions}
                        value={colorOptions.find(
                          (e: any) => e.value === editData.className
                        )}
                        onChange={(e: any) =>
                          setEditData({ ...editData, className: e.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-danger me-auto"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Calendar;
