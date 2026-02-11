import React, { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import { addTask, allMonthsForOptionByClassId, allTasks, classForOption, deleteTask, getSyllabusByClassIdAndId, speTask, updateTask } from "../../../service/api.ts";
// allClasses
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../handlePopUpmodal";
import { Spinner } from "../../../spinner.tsx";
import type { OptionType, TasksData } from "../../../core/data/interface/index.tsx";
import Select from "react-select";
import dayjs from 'dayjs'

const statusOptions = [
    { value: 'IN_PROGRESS', label: '🔵 In Progress' },
    { value: 'COMPLETED', label: '✅ Completed' },
];


const DailyTask = () => {
    const route = all_routes
    const [tasksList, setTasksList] = useState<TasksData[]>([])
    const [originalTaskList, setOriginalTaskList] = useState<TasksData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [classOptions, setClassOptions] = useState<OptionType[]>([])
    const [monthsOptions, setMonthsOptions] = useState<OptionType[]>([])
    const [className, setClassName] = useState<number | null>(null)
    const [monthName, setMonthName] = useState<number | null>(null)
    const [title, setTitle] = useState<string>("")
    const [activity, setActivity] = useState<string>("")
    const [taskTitle, setTaskTitle] = useState<string>("")
    const [status, setStatus] = useState<'IN_PROGRESS' | 'COMPLETED'>("IN_PROGRESS")
    const [editId, setEditId] = useState<number | null>(null)
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");


    const fetchTasks = async () => {
        setLoading(true)
        await new Promise((res) => setTimeout(res, 500))
        try {
            const { data } = await allTasks()
            if (data.success) {
                setTasksList(data.data)
                setOriginalTaskList(data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchClassForOption = async () => {
        try {

            const { data } = await classForOption()
            if (data.success) {
                setClassOptions(data.data.map((c: any) => ({ value: c.id, label: c.class_name })))
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleSelectClassChange = async (opt: OptionType) => {
        if (!opt) return
        setMonthName(null)
        setActivity("")
        setTitle("")
        setClassName(Number(opt.value))
        // setErrors((prev) => ({ ...prev, category: undefined, subcategory: undefined }));

        const { data } = await allMonthsForOptionByClassId(Number(opt.value))
        if (data.success) {
            setMonthsOptions(data.data.map((m: any) => ({ value: m.id, label: m.month_no })))
        }

    }

    const fetchSyllabusTitleAndActivity = async (class_id: number, id: number) => {
        try {
            const { data } = await getSyllabusByClassIdAndId(class_id, id)
            if (data.success) {
                setTitle(data.data.title)
                setActivity(data.data.activity)
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (className && monthName) {
            fetchSyllabusTitleAndActivity(className, monthName)
        }

    }, [monthName])

    useEffect(() => {
        fetchTasks()
        fetchClassForOption()
    }, [])

    const resetStates = () => {
        setTitle("")
        setActivity("")
        setTaskTitle("")
        setClassName(null)
        setMonthName(null)
        setStatus("IN_PROGRESS")
        setEditId(null)
        setMonthsOptions([])

    }

    const cancelAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        resetStates()
    }

    //add
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payLoad = {
            class_id: className,
            month_id: monthName,
            task_title: taskTitle,
            status: status

        }

        const { data } = await addTask(payLoad)
        if (data.success) {
            toast.success(data.message)
            resetStates()
            fetchTasks()
            handleModalPopUp('add_task')

        }

        try {
        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }

    };

    // edit
    const fetchSpecificTask = async (id: number) => {
        if (!id) return
        try {
            const { data } = await speTask(id)
            if (data.success) {
                setTaskTitle(data.data.task_title)
                setStatus(data.data.status)
                setActivity(data.data.activity)
                setEditId(data.data.id)
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {

        e.preventDefault()
        if (!editId) return
        const payload = {
            task_title: taskTitle,
            status: status
        }

        try {

            const { data } = await updateTask(payload, editId)
            if (data.success) {
                toast.success(data.message)
                resetStates()
                fetchTasks()
                handleModalPopUp('edit_task')
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }

    // delete class
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {

            const { data } = await deleteTask(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchTasks()
                handleModalPopUp('delete-modal')
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    const cancelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeleteId(null)
    }

    const sortedDevices = useMemo(() => {
        const copy = [...tasksList];

        copy.sort((a, b) => {
            return sortType === "asc"
                ? a.id - b.id
                : b.id - a.id;
        });

        return copy;
    }, [tasksList, sortType]);



    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        DT-{text}
                    </Link>
                </>
            ),
        },

        {
            title: "Class",
            dataIndex: "className",
            render: (text: any) => (
                <span>{`Class-${text}`}</span>
            ),
            sorter: (a: any, b: any) => a.className.length - b.className.length,
        },

        {
            title: "Month No",
            dataIndex: "month_no",
            render: (text: number) => (
                <span>{text}</span>
            ),
            sorter: (a: any, b: any) => a.month_no - b.month_no,
        },

        {
            title: "Task Title",
            dataIndex: "taskTitle",
            render: (text: any) => (
                <span>{`${text}`}</span>
            ),
            sorter: (a: any, b: any) => a.taskTitle.length - b.taskTitle.length,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
                <span
                    className={`badge ${status === 'COMPLETED'
                        ? 'bg-success' : 'bg-primary'}`}
                >
                    {status}
                </span>
            ),
            sorter: (a: any, b: any) => a.status.length - b.status.length,
        },
        {
            title: "Added On",
            dataIndex: "created_at",
            render: (text: any) => (
                <span>{dayjs(text).format('DD MMM YYYY')}</span>
            ),

        },
        {
            title: "Action",
            dataIndex: "action",
            render: (_: any, record: any) => (
                <>
                    <div className="d-flex align-items-center">
                        <div className="dropdown">
                            <Link
                                to="#"
                                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="ti ti-dots-vertical fs-14" />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-right p-3">
                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => fetchSpecificTask(record.id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#edit_task"
                                    >
                                        <i className="ti ti-edit-circle me-2" />
                                        Edit
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => setDeleteId(record.id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#delete-modal"
                                    >
                                        <i className="ti ti-trash-x me-2" />
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            ),
        },
    ];

    // filter data

    interface FilterData {
        className: number | null;
    }

    const [filterData, setFilterData] = useState<FilterData>({ className: null });

    const handleFilterSelectChange = (name: keyof FilterData, value: null | number) => {
        setFilterData((prev) => ({ ...prev, [name]: value }));
    };

    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

    const handleApplyClick = (e: React.FormEvent) => {
        e.preventDefault();

        const filtered = originalTaskList.filter((row: any) => {
            if (filterData.className !== null) {
                return Number(row.className) === Number(filterData.className);
            }
            return true;
        });

        setTasksList([...filtered]);
        setFilterData({ className: null });
        if (dropdownMenuRef.current) {
            dropdownMenuRef.current.classList.remove("show");
        }
    };


    const handleResetFilter = (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        setFilterData({ className: null });
        setTasksList(originalTaskList);
        if (dropdownMenuRef.current) {
            dropdownMenuRef.current.classList.remove("show");
        }
    };



    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Daily-Tasks List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Daily-Tasks </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Tasks
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <Link
                                    to="#"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_task"
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Task
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Tasks List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="dropdown mb-3 me-2">
                                    <Link
                                        to="#"
                                        className="btn btn-outline-light bg-white dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        data-bs-auto-close="outside"
                                    >
                                        <i className="ti ti-filter me-2" />
                                        Filter
                                    </Link>
                                    <div className="dropdown-menu drop-width" ref={dropdownMenuRef}>


                                        <form >
                                            <div className="d-flex align-items-center border-bottom p-3">
                                                <h4>Filter</h4>
                                            </div>
                                            <div className="p-3 border-bottom pb-0">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">ClassName</label>
                                                            <Select
                                                                className="select"
                                                                options={classOptions} // [{ value: 1, label: "Class 1" }, ...]
                                                                placeholder="Select class"
                                                                value={classOptions.find(option => Number(option.value) === filterData.className) || null} // <-- make it controlled
                                                                onChange={(option: any) =>
                                                                    handleFilterSelectChange("className", option ? option.value : null)
                                                                }
                                                            />

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 d-flex align-items-center justify-content-end">
                                                <button type="button" onClick={(e) => handleResetFilter(e)} className="btn btn-light me-3">
                                                    Reset
                                                </button>
                                                <button
                                                    // to="#"
                                                    className="btn btn-primary"
                                                    onClick={handleApplyClick}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <div className="dropdown mb-3">
                                    <Link
                                        to="#"
                                        className="btn btn-outline-light bg-white dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                    >
                                        <i className="ti ti-sort-ascending-2 me-2" />
                                        Sort by A-Z
                                    </Link>
                                    <ul className="dropdown-menu p-3">
                                        <li>
                                            <button
                                                className={`dropdown-item rounded-1 ${sortType === "asc" ? "active" : ""
                                                    }`}
                                                onClick={() => setSortType("asc")}
                                            >
                                                Ascending
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`dropdown-item rounded-1 ${sortType === "desc" ? "active" : ""
                                                    }`}
                                                onClick={() => setSortType("desc")}
                                            >
                                                Descending
                                            </button>
                                        </li>


                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
                            {/* Guardians List */}
                            {loading ? (
                                <Spinner />
                            ) : (<Table key={sortType+Math.floor(Math.random() * 100000)} columns={columns} dataSource={sortedDevices} Selection={false} />)
                            }
                            {/* /Guardians List */}
                        </div>
                    </div>
                    {/* /Guardians List */}
                </div>
            </div>
            {/* /Page Wrapper */}
            <>
                {/* Add task */}
                <div className="modal fade" id="add_task">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Add Task</h4>
                                <button
                                    type="button"
                                    onClick={cancelAdd}
                                    className="btn-close custom-btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>


                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            {/* Class Name */}
                                            <div className="mb-3">
                                                <label className="form-label">Class</label>

                                                <Select<OptionType>
                                                    options={classOptions}
                                                    value={classOptions.find((o) => Number(o.value) === className)}
                                                    onChange={(option: any) => handleSelectClassChange(option)}
                                                    placeholder="Select Class"
                                                    className="text-capitalize"
                                                />

                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Month</label>

                                                <Select<OptionType>
                                                    options={monthsOptions}
                                                    value={monthsOptions.find((o) => Number(o.value) === monthName)}
                                                    onChange={(option: any) =>
                                                        setMonthName(option ? option.value : null)}
                                                    placeholder="Select Class"
                                                    className="text-capitalize"
                                                    isDisabled={!className}
                                                />

                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="" className="form-label" >Title</label>
                                                <input
                                                    className="form-control"
                                                    id="title"
                                                    value={title}
                                                    disabled={true}

                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label" >Activity</label>
                                                <textarea
                                                    className="form-control"
                                                    id="activity"
                                                    disabled={true}
                                                    value={activity}
                                                    cols={4}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label" >Activity Task</label>
                                                <textarea
                                                    className="form-control"
                                                    id="task-activity"
                                                    value={taskTitle}
                                                    onChange={(e) => setTaskTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <label className="form-label" >Task Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find(opt => opt.value === status)}
                                                    onChange={(option: any) => setStatus(option.value)}
                                                    placeholder="Select Status"
                                                    className="text-capitalize"
                                                />
                                            </div>


                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                        onClick={cancelAdd}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"

                                    >
                                        Add Class
                                    </button>
                                </div>
                            </form>


                        </div>
                    </div>
                </div>
                {/* /Add task*/}
                {/* edit task */}
                <div className="modal fade" id="edit_task">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Add Task</h4>
                                <button
                                    type="button"
                                    onClick={cancelAdd}
                                    className="btn-close custom-btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>


                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label" >Activity</label>
                                                <textarea
                                                    className="form-control"
                                                    id="activity"
                                                    disabled={true}
                                                    value={activity}
                                                    cols={4}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label" >Activity Task</label>
                                                <textarea
                                                    className="form-control"
                                                    id="task-activity"
                                                    value={taskTitle}
                                                    onChange={(e) => setTaskTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <label className="form-label" >Task Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find(opt => opt.value === status)}
                                                    onChange={(option: any) => setStatus(option.value)}
                                                    placeholder="Select Status"
                                                    className="text-capitalize"
                                                />
                                            </div>


                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                        onClick={cancelAdd}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"

                                    >
                                        Add Class
                                    </button>
                                </div>
                            </form>


                        </div>
                    </div>
                </div>
                {/* edit task */}
                {/* Delete Modal */}
                <div className="modal fade" id="delete-modal">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form>
                                <div className="modal-body text-center">
                                    <span className="delete-icon">
                                        <i className="ti ti-trash-x" />
                                    </span>
                                    <h4>Confirm Deletion</h4>
                                    <p>
                                        You want to delete this items, this cant be undone once
                                        you delete.
                                    </p>
                                    {
                                        deleteId && (
                                            <div className="d-flex justify-content-center">
                                                <button
                                                    onClick={(e) => cancelDelete(e)}
                                                    className="btn btn-light me-3"
                                                    data-bs-dismiss="modal"
                                                >
                                                    Cancel
                                                </button>
                                                <button className="btn btn-danger" onClick={(e) => handleDelete(deleteId, e)}>
                                                    Yes, Delete
                                                </button>

                                            </div>
                                        )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* /Delete Modal */}

            </>
        </div>
    );
};

export default DailyTask;