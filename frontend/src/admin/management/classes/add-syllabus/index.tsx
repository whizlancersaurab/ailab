import React, { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
// import TooltipOption from "../../../../core/common/tooltipOption";
import { all_routes } from "../../../../router/all_routes";

// allClasses
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../../handlePopUpmodal";
import { addSyllabus, allClassSyllabus, classForOption, deleteSpeSyllabus, speSyllabus, updateSyllabus } from "../../../../service/api";
import type { OptionType, syllabusData } from "../../../../core/data/interface";
import Select from "react-select";
import dayjs from 'dayjs'
import { Spinner } from "../../../../spinner";



interface Month {
    month_no: number;
    title: string;
    activity: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

}

interface FormData {
    className: string;
    months: Month[];
}

const statusOptions = [
    { value: 'PENDING', label: '🕒 Pending' },
    { value: 'IN_PROGRESS', label: '🔵 In Progress' },
    { value: 'COMPLETED', label: '✅ Completed' },
    { value: 'ON_HOLD', label: '⏸ On Hold' },
];


const AddSyllabus = () => {
    const route = all_routes
    const [allSyllabusData, setAllSyllabusData] = useState<syllabusData[]>([])
    const [originalAllSyllabusData, setOriginalAllSyllabusData] = useState<syllabusData[]>([])
    const [formData, setFormData] = useState<FormData>({
        className: "",
        months: [{ month_no: 1, title: "", activity: "", description: "", status: 'PENDING' }],
    });
    const [classOptions, setClassOptions] = useState<OptionType[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [viewSyllabus, setViewSyllabus] = useState<any>(null)
    const [editData, setEditData] = useState<{ title: string, activity: string, description: string, status: string }>({
        title: "",
        activity: "",
        description: "",
        status: ""
    })
    const [errors, setErrors] = useState({
        title: "",
        activity: "",
        description: "",
        status: ""
    });

    const [editId, setEditId] = useState<number | null>(null)
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");



    const fetchAllClassSyllabus = async () => {

        setLoading(true)
        try {

            const { data } = await allClassSyllabus()
            if (data.success) {

                setAllSyllabusData(data.data)
                setOriginalAllSyllabusData(data.data)
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

    useEffect(() => {
        fetchAllClassSyllabus()
        fetchClassForOption()
    }, [])


    const handleMonthChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const months = [...formData.months];
        months[index] = { ...months[index], [name]: value };
        setFormData({ ...formData, months });
    };

    const handleStausChange = (index: number, value: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD') => {

        const months = [...formData.months];
        months[index] = { ...months[index], "status": value };
        setFormData({ ...formData, months });
    };

    const addMonth = () => {
        setFormData({
            ...formData,
            months: [...formData.months, { month_no: 0, title: "", activity: "", description: "", status: 'PENDING' }],
        });
    };

    const removeMonth = (index: number) => {
        const months = formData.months.filter((_, i) => i !== index);
        setFormData({ ...formData, months });
    };

    // Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.className) {
            toast.error('Class is required !')
            return
        }

        if (formData.months.length === 0) {
            toast.error('At least one class syllabus required !')
            return
        }
        const payload = {
            class_id: Number(formData.className),
            months: formData.months,
        }
        try {

            const { data } = await addSyllabus(payload)
            if (data.success) {
                toast.success(data.message)
                setFormData({ className: "", months: [{ month_no: 1, title: "", activity: "", description: "", status: 'PENDING' }] });
                fetchAllClassSyllabus()
                handleModalPopUp('add_syllabus')
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response.data.message)
        }
    };

    // spesyllabus
    const fetchSpeSyllabus = async (id: number) => {
        if (!id) {
            toast.warn('Syllabus Id is required !')
            return
        }
        try {

            const { data } = await speSyllabus(id)
            if (data.success) {
                setViewSyllabus(data.data)
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }

    // edit
    const fetchEditData = async (id: number) => {
        if (!id) {
            toast.warn('Id is required !')
            return
        }
        try {

            const { data } = await speSyllabus(id)
            if (data.success) {
                setEditData({
                    title: data.data.title,
                    activity: data.data.activity,
                    description: data.data.description,
                    status: data.data.status
                })
                setEditId(id)
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }

    const handleEditDataChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setEditData((prev) => ({
            ...prev,
            [name]: value,
        }));


        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };


    const cancelEditDataSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setEditData({
            title: "",
            activity: "",
            description: "",
            status: ""
        });
        setErrors({
            title: "",
            activity: "",
            description: "",
            status: ""
        });
        setEditId(null)
    };


    const validateForm = () => {
        let valid = true;
        let newErrors = {
            title: "",
            activity: "",
            description: "",
            status: ""
        };

        const allowedStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];


        if (!editData.title.trim()) {
            newErrors.title = "Title is required";
            valid = false;
        } else if (editData.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters";
            valid = false;
        }

        if (!editData.activity.trim()) {
            newErrors.activity = "Activity is required";
            valid = false;
        } else if (editData.activity.length < 10) {
            newErrors.activity = "Activity must be at least 10 characters";
            valid = false;
        }

        // Description validation
        if (!editData.description.trim()) {
            newErrors.description = "Description is required";
            valid = false;
        } else if (editData.description.length < 15) {
            newErrors.description = "Description must be at least 15 characters";
            valid = false;
        }

        if (!allowedStatus.includes(editData.status)) {
            newErrors.status = "Invalid status selected !"
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };


    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editId || !validateForm()) return;


        try {

            const { data } = await updateSyllabus(editData, editId)
            if (data.success) {
                toast.success(data.message)
                setEditData({
                    title: "",
                    activity: "",
                    description: "",
                    status: ""
                });
                setErrors({
                    title: "",
                    activity: "",
                    description: "",
                    status: ""
                });
                setEditId(null)
                fetchAllClassSyllabus()
                handleModalPopUp('edit_syllabus')

            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }


    // delete class--------------------------------------------------------------------
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            const { data } = await deleteSpeSyllabus(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchAllClassSyllabus()
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

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        SYL-{text}
                    </Link>
                </>
            ),
        },

        {
            title: "Class",
            dataIndex: "className",
            sorter: (a: any, b: any) => a.className.length - b.className.length,
        },

        {
            title: "Month",
            dataIndex: "month_no",
            sorter: (a: any, b: any) => a.month_no - b.month_no,
        },
        {
            title: "Title",
            dataIndex: "title",
            render: (text: string) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.title.length - b.title.length,
        },

        {
            title: "Description",
            dataIndex: "description",
            render: (text: string) => (
                <span className="text-capitalize">
                    {text.length > 35 ? text.slice(0, 35) + "..." : text}
                </span>
            ),
            sorter: (a: any, b: any) => a.description.length - b.description.length,
        },
        {
            title: "Activity",
            dataIndex: "activity",
            render: (text: string) => (
                <span className="text-capitalize">
                    {text.length > 35 ? text.slice(0, 35) + "..." : text}
                </span>
            ),
            sorter: (a: any, b: any) => a.activity.length - b.activity.length,
        },

        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',

            render: (status: string) => (
                <span
                    className={`badge ${status === 'COMPLETED'
                        ? 'bg-success'
                        : status === 'IN_PROGRESS'
                            ? 'bg-primary'
                            : status === 'ON_HOLD'
                                ? 'bg-warning'
                                : 'bg-secondary'
                        }`}
                >
                    {status}
                </span>
            ),

            sorter: (a: any, b: any) =>
                a.status.localeCompare(b.status),
        },
        {
            title: 'Updated On',
            dataIndex: 'updated_at',
            render: (text: string) => (
                <span

                >
                    {dayjs(text).format('DD MMM YYYY')}
                </span>
            ),

            sorter: (a: any, b: any) =>
                a.status.localeCompare(b.status),
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

                                {

                                    <li>
                                        <button
                                            className="dropdown-item rounded-1"
                                            onClick={() => fetchEditData(record.id)}
                                            data-bs-toggle="modal"
                                            data-bs-target="#edit_syllabus"
                                        >
                                            <i className="ti ti-edit-circle me-2" />
                                            Edit
                                        </button>
                                    </li>
                                }


                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => fetchSpeSyllabus(record.id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#view_syllabus"
                                    >
                                        <i className="ti ti-edit-circle me-2" />
                                        View
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

    // filter
    const sortedDevices = useMemo(() => {
        const copy = [...allSyllabusData];

        copy.sort((a, b) => {
            return sortType === "asc"
                ? a.id - b.id
                : b.id - a.id;
        });

        return copy;
    }, [allSyllabusData, sortType]);



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

        const filtered = originalAllSyllabusData.filter((row: any) => {
            if (filterData.className !== null) {
                return Number(row.className) === Number(filterData.className);
            }
            return true;
        });

        setAllSyllabusData([...filtered]);
        setFilterData({ className: null });
        if (dropdownMenuRef.current) {
            dropdownMenuRef.current.classList.remove("show");
        }
    };


    const handleResetFilter = (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        setFilterData({ className: null });
        setAllSyllabusData(originalAllSyllabusData);
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
                            <h3 className="page-title mb-1">Syllabus List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Syllabus </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Syllabus
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption />
                             */}
                            <button
                                className="btn btn-success me-2"
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = "/assets/botixbo.pdf"; // your PDF path
                                    link.target = "_blank"; // open in new tab
                                    link.click();
                                }}
                            >
                                Download Syllabus
                            </button>




                            <div className="mb-">
                                <Link
                                    to="#"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_syllabus"
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Class Syllabus
                                </Link>
                            </div>

                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Syllabus List</h4>
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

                                {/* 🔥 SORT DROPDOWN (WORKING) */}
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
                                <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (<Table key={sortType + allSyllabusData.length + Math.floor(Math.random() * 100000)} columns={columns} dataSource={sortedDevices} Selection={false} />)
                            }
                            {/* /Guardians List */}
                        </div>
                    </div>
                    {/* /Guardians List */}
                </div>
            </div>
            {/* /Page Wrapper */}
            <>
                {/* Add Classes */}
                <div className="modal fade" id="add_syllabus">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Add Class & Monthly Curriculum</h4>
                                <button
                                    type="button"
                                    className="btn-close custom-btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Make modal-body scrollable */}
                                <div
                                    className="modal-body"
                                    style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "10px" }}
                                >
                                    <div className="mb-3">
                                        <label className="form-label">Class</label>

                                        <Select<OptionType>
                                            options={classOptions}
                                            value={classOptions.find((o) => o.value === formData.className)}
                                            onChange={(option) =>
                                                setFormData((prev) => ({ ...prev, className: option?.value || "" }))
                                            }
                                            placeholder="Select Class"
                                            className="text-capitalize"
                                        />

                                    </div>

                                    {formData.months.map((month, index) => (
                                        <div key={index} className="border p-3 mb-2">
                                            <h6>Month Details</h6>

                                            <div className="mb-2">
                                                <label className="form-label">Month No</label>
                                                <input
                                                    className="form-control"
                                                    type="number"
                                                    name="month_no"
                                                    value={month.month_no}
                                                    onChange={(e) => handleMonthChange(index, e)}
                                                    min={1}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    name="title"
                                                    value={month.title}
                                                    onChange={(e) => handleMonthChange(index, e)}
                                                    required
                                                />
                                            </div>


                                            <div className="mb-2">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={month.description}
                                                    rows={3}
                                                    onChange={(e) => handleMonthChange(index, e)}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-2">
                                                <label className="form-label">Activity</label>
                                                <textarea
                                                    className="form-control"
                                                    name="activity"
                                                    value={month.activity}
                                                    onChange={(e) => handleMonthChange(index, e)}
                                                    rows={4}
                                                    required
                                                />

                                            </div>



                                            <div className="mb-2">
                                                <label className="form-label">Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find(opt => opt.value === month.status)}
                                                    onChange={(option: any) => handleStausChange(index, option.value)}
                                                    placeholder="Select Status"
                                                    className="text-capitalize"
                                                />

                                                {errors.status && (
                                                    <small className="text-danger">{errors.status}</small>
                                                )}
                                            </div>


                                            {formData.months.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeMonth(index)}
                                                >
                                                    Remove Month
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button type="button" className="btn btn-secondary mb-3" onClick={addMonth}>
                                        + Add Month
                                    </button>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Curriculum
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* /Add Classes */}

                {/* Edit Classes */}
                <div className="modal fade" id="edit_syllabus">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Edit Class</h4>
                                <button
                                    type="button"
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
                                            <div className="mb-2">
                                                <label className="form-label">Title</label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    name="title"
                                                    value={editData.title}
                                                    onChange={(e) => handleEditDataChange(e)}

                                                />
                                                {errors.title && <small className="text-danger">{errors.title}</small>}
                                            </div>

                                            <div className="mb-2">
                                                <label className="form-label">Activity</label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    name="activity"
                                                    value={editData.activity}
                                                    onChange={(e) => handleEditDataChange(e)}

                                                />
                                                {errors.activity && (
                                                    <small className="text-danger">{errors.activity}</small>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    value={editData.description}
                                                    onChange={(e) => handleEditDataChange(e)}

                                                />
                                                {errors.description && (
                                                    <small className="text-danger">{errors.description}</small>
                                                )}
                                            </div>

                                            <div className="mb-2">
                                                <label className="form-label">Status</label>
                                                <Select
                                                    options={statusOptions}
                                                    value={statusOptions.find(opt => opt.value === editData.status)}
                                                    onChange={(option: any) => setEditData((prev) => ({ ...prev, "status": option.value }))}
                                                    placeholder="Select Status"
                                                    className="text-capitalize"
                                                />

                                                {errors.status && (
                                                    <small className="text-danger">{errors.status}</small>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={(e) => cancelEditDataSubmit(e)}
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"

                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>


                        </div>
                    </div>
                </div>
                {/* /Edit Classes */}
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

            {/* view modal */}
            <div
                className="modal fade"
                id="view_syllabus"
                tabIndex={-1}
                aria-labelledby="viewSyllabusModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                    <div className="modal-content shadow-lg border-0 rounded-4">

                        {/* Header */}
                        <div className="modal-header bg-secondary text-white rounded-top-4">
                            <div>
                                <h4 className="modal-title mb-1" id="viewSyllabusModalLabel">
                                    Monthly Curriculum
                                </h4>
                                <small className="opacity-75 text-dark">
                                    Detailed syllabus overview
                                </small>
                            </div>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4 bg-light">
                            {viewSyllabus ? (
                                <>
                                    {/* Top Meta Section */}
                                    <div className="row mb-4">
                                        {/* Class */}
                                        <div className="col-md-4">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-body">
                                                    <div className="text-muted">Class</div>
                                                    <h5 className="mb-0">Class {viewSyllabus.class_name}</h5>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Month */}
                                        <div className="col-md-4">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-body">
                                                    <div className="text-muted">Month</div>
                                                    <h5 className="mb-0">Month {viewSyllabus.month_no}</h5>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="col-md-4">
                                            <div className="card border-0 shadow-sm">
                                                <div className="card-body">
                                                    <div className="text-muted">Status</div>
                                                    <h5

                                                        className={`mb-0 badge ${viewSyllabus.status === 'COMPLETED'
                                                            ? 'bg-success'
                                                            : viewSyllabus.status === 'IN_PROGRESS'
                                                                ? 'bg-primary'
                                                                : viewSyllabus.status === 'ON_HOLD'
                                                                    ? 'bg-warning'
                                                                    : 'bg-secondary'
                                                            }`}
                                                    >
                                                        {viewSyllabus.status}
                                                    </h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body">
                                            <h6 className="text-muted mb-1">Topic Title</h6>
                                            <h5 className="fw-semibold">{viewSyllabus.title}</h5>
                                        </div>
                                    </div>

                                    {/* Learning Activity */}
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Learning Activity</h6>
                                            <p className="mb-0 text-dark">{viewSyllabus.activity}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body">
                                            <h6 className="text-muted mb-2">Description</h6>
                                            <div className="mb-0 text-dark">{viewSyllabus.description}</div>
                                        </div>
                                    </div>

                                    {/* Footer Meta */}
                                    <div className="d-flex justify-content-between align-items-center text-muted small">
                                        <div>
                                            Created: {dayjs(viewSyllabus.created_at).format('DD MMM YYYY')}
                                        </div>
                                        <div>
                                            Updated: {dayjs(viewSyllabus.updated_at).format('DD MMM YYYY')}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Spinner />
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer bg-white border-top-0">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSyllabus;