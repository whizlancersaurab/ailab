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
import { addEvent, allEvents, updateEvent, deleteEvent } from "../../../service/api";
import { MdDeleteForever } from "react-icons/md";
import { all_routes } from "../../../router/all_routes";
import Select from 'react-select'

const handleModalPopUp = (id: string) => {
  const modalEl = document.getElementById(id);
  const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.toggle();
};


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


const Calendar = () => {

  const routes = all_routes

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [weekendsVisible] = useState(true);
  const [formData, setFormData] = useState<AddEventForm>({
    title: "",
    start: "",
    end: "",
    className: "",
  });

  const [errors, setErrors] = useState<Partial<AddEventForm>>({});
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [editData, setEditData] = useState<AddEventForm>({
    title: "",
    start: "",
    end: "",
    className: "",
  });

  const colorOptions = [
    { value: "bg-success", label: "Green" },
    { value: "bg-danger", label: "Red" },
    { value: "bg-primary", label: "Violet" },
    { value: "bg-warning", label: "Yellow" },
    { value: "bg-info", label: "Blue" },
  ];


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

  const validate = (formData: AddEventForm): boolean => {
    const newErr: Partial<AddEventForm> = {};
    if (!formData.title.trim()) newErr.title = "Event title required!";
    if (!formData.start) newErr.start = "Start date required!";
    if (!formData.end) newErr.end = "End date required!";
    if (!formData.className) newErr.className = "Select a color!";
    if (formData.start && formData.end) {
      if (new Date(formData.end) < new Date(formData.start)) {
        newErr.end = "End date should be after start date!";
      }
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate(formData)) return;

    try {
      const { data } = await addEvent(formData);

      if (data.success) {
        toast.success(data.message);

        setFormData({
          title: "",
          start: "",
          end: "",
          className: "",
        });
        setErrors({})

        fetchEvents();
        handleModalPopUp("add_event");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };



  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    setSelectedEvent(info.event);
    setEditData({
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr ?? info.event.startStr,
      className: info.event.classNames[0],
    });

    handleModalPopUp("edit_event");
  };

  const handleCancelSubmit = () => {
    setFormData({
      title: "",
      start: "",
      end: "",
      className: "",
    })
    setErrors({})
  }

  const handleCancelEdit = () => {
    setSelectedEvent(null)
    setEditData({
      title: "",
      start: "",
      end: "",
      className: "",
    })
    setErrors({})
  }

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate(editData)) return;

    try {
      const { data } = await updateEvent(editData, selectedEvent.id);

      if (data.success) {
        toast.success("Event Updated!");
        handleCancelEdit()
        fetchEvents()

        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById("edit_event")
        );
        modal.hide();
      }
    } catch (err: any) {
      console.log(err)
      toast.error(err.response.data.message);
    }
  };


  const handleDelete = async () => {
    try {
      const { data } = await deleteEvent(selectedEvent.id);

      if (data.success) {
        toast.success("Event Deleted!");
        fetchEvents();
        handleCancelEdit()
        const modal = (window as any).bootstrap.Modal.getInstance(
          document.getElementById("edit_event")
        );
        modal.hide();
      }
    } catch (err: any) {
      console.log(err)
      toast.error(err.response.data.message);
    }
  };

  return (
    <>
      <div className="page-wrapper">

        <div className="content">
          <>
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
                  <Link
                    to="#"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_event"
                  >
                    Create Event
                  </Link>
                </div>
              </div>
            </div>
            {/* /Page Header */}
          </>

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
                    editable={true}
                    selectable={true}
                    dayMaxEvents={true}
                    weekends={weekendsVisible}
                    events={events}

                    eventClick={handleEventClick}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD EVENT MODAL */}
      <div className="modal fade" id="add_event">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h4 className="modal-title">Add Event</h4>
                <button onClick={handleCancelSubmit} className="btn-close" data-bs-dismiss="modal"></button>
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
                  {errors.title && <small className="text-danger">{errors.title}</small>}
                </div>

                {/* Start Date */}
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <DatePicker
                    className="form-control"
                    format="DD MMM YYYY"
                    value={formData.start ? dayjs(formData.start) : null}
                    onChange={(d: Dayjs | null) =>
                      setFormData({ ...formData, start: d ? d.toISOString() : "" })
                    }
                  />
                  {errors.start && <small className="text-danger">{errors.start}</small>}
                </div>

                {/* End Date */}
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <DatePicker
                    className="form-control"
                    format="DD MMM YYYY"
                    value={formData.end ? dayjs(formData.end) : null}
                    onChange={(d: Dayjs | null) =>
                      setFormData({ ...formData, end: d ? d.toISOString() : "" })
                    }
                  />
                  {errors.end && <small className="text-danger">{errors.end}</small>}
                </div>

                {/* Color */}
                <div className="mb-3">
                  <label className="form-label">Color</label>
                  <Select
                    options={colorOptions}
                    value={colorOptions.find((e: any) => e.value === editData.className)}
                    onChange={(e: any) =>
                      setFormData({ ...formData, className: e.value })
                    }
                  />
                  {errors.className && <small className="text-danger">{errors.className}</small>}
                </div>

              </div>

              <div className="modal-footer d-flex align-items-center justify-content-end">
                <button type="button" onClick={handleCancelSubmit} data-bs-dismiss='modal' className="btn btn-danger me-2">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Event</button>
              </div>
            </form>

          </div>
        </div>
      </div>

      {/* EDIT EVENT MODAL */}
      <div className="modal fade" id="edit_event">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h4 className="modal-title">Edit Event</h4>
                <button type="button"
                  className="btn text-danger"
                  onClick={handleDelete} ><MdDeleteForever size={25} /></button>
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
                    value={colorOptions.find((e: any) => e.value === editData.className)}
                    onChange={(e: any) =>
                      setEditData({ ...editData, className: e.value })
                    }
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button
                  onClick={() => handleCancelEdit()}
                  className="btn btn-danger me-auto"
                  data-bs-dismiss="modal"

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
    </>
  );
};

export default Calendar;
