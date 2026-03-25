/* eslint-disable */
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Link, useParams } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import Select from "react-select";

import { allEventsForSchoolDas } from "../../../service/api";
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

const EventsForSchoolDas = () => {
    const routes = all_routes;
    const { schoolId } = useParams()
   
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [weekendsVisible] = useState(true);
    const [editData, setEditData] = useState<AddEventForm>({
        title: "",
        start: "",
        end: "",
        className: "",
    });


    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch all events
    const fetchEvents = async (schoolId: number) => {
        try {
            const { data } = await allEventsForSchoolDas(schoolId);
    
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
        if (schoolId) {
            fetchEvents(Number(schoolId));
        }
    }, []);


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
        if (showEditModal) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
    }, [showEditModal]);

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
                                    <Link to={routes.superadmindashboard}>Dashboard</Link>
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
                        {/* <div className="mb-2">
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddModal(true)}
                            >
                                Create Event
                            </button>
                        </div> */}
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


            {/* EDIT EVENT MODAL */}
            {showEditModal && selectedEvent && (
                <>
                    <div className="modal fade show d-block">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <h1 className="fw-semibold fs-4 text-center my-2 text-danger">Event Data</h1>
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
                                                // options={colorOptions}
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
                                      <div className="text-left">
                                          <button
                                            type="button"
                                            className="btn btn-danger me-auto"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Close
                                        </button>
                                      </div>
                                        {/* <button type="submit" className="btn btn-primary">
                                            Update Event
                                        </button> */}
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

export default EventsForSchoolDas;
