import React, { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link, useParams } from "react-router-dom";
// import TooltipOption from "../../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";

// allClasses
import { toast } from "react-toastify";
import { addSyllabusExcelFile, allClassSyllabusForSchoolDas, classForOption, speSyllabusForSchoolDas, } from "../../../service/api";
import type { OptionType, syllabusData } from "../../../core/data/interface";
import Select from "react-select";
import dayjs from 'dayjs'
import { Spinner } from "../../../spinner";

const SyllabusForSchoolDas = () => {
    const route = all_routes
    const { schoolId } = useParams()
    const [allSyllabusData, setAllSyllabusData] = useState<syllabusData[]>([])
    const [originalAllSyllabusData, setOriginalAllSyllabusData] = useState<syllabusData[]>([])
    const [classOptions, setClassOptions] = useState<OptionType[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [viewSyllabus, setViewSyllabus] = useState<any>(null)

    const [sortType, setSortType] = useState<"asc" | "desc">("asc");
    const [viewModal, setViewModal] = useState<boolean>(false)



    const fetchAllClassSyllabus = async (schoolId: number) => {

        setLoading(true)
        try {

            const { data } = await allClassSyllabusForSchoolDas(schoolId)
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

        fetchClassForOption()
        if (schoolId) {
            fetchAllClassSyllabus(Number(schoolId))
        }
    }, [])


    // spesyllabus
    const fetchSpeSyllabus = async (id: number) => {
        if (!id || !schoolId) {
            toast.warn('Syllabus Id is required !')
            return
        }

        try {

            const { data } = await speSyllabusForSchoolDas(id, Number(schoolId))
            if (data.success) {
                setViewSyllabus(data.data)
                setViewModal(true)
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
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



                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => fetchSpeSyllabus(record.id)}

                                    >
                                        <i className="ti ti-edit-circle me-2" />
                                        View
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

    //     onClick={async () => {
    //     const res = await fetch("/api/download-syllabus", {
    //         headers: {
    //             Authorization: `Bearer ${localStorage.getItem("token")}`
    //         }
    //     });

    //     const blob = await res.blob();
    //     const url = window.URL.createObjectURL(blob);

    //     const a = document.createElement("a");
    //     a.href = url;
    //     a.download = "syllabus.pdf";
    //     a.click();
    // }}
    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!schoolId) return
        const file = e.target.files[0];


        const formData = new FormData();
        formData.append("file", file);
        // for (const pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }

        try {
            setLoading(true);

            const { data } = await addSyllabusExcelFile(formData, Number(schoolId))

            if (data.success) {
                toast.success(data.message);
                fetchAllClassSyllabus(Number(schoolId));
                e.target.value = "";
                // setShowAddModal(false);
            } else {
                toast.error(data.message || "Excel upload failed");
            }
        } catch (err: any) {
            console.error(err?.response?.data);
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
            e.target.value = "";
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
                                        <Link to={route.superadmindashboard}>Dashboard</Link>
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
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-3">
                            {/* Download Syllabus */}
                            <button
                                className="btn btn-success"
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = "/assets/img/syllabusguide.png"; // your PDF path
                                    link.target = "_blank"; // open in new tab
                                    link.click();
                                }}
                            >
                                Download Template
                            </button>

                            {/* Stylish Upload Excel */}
                            <div className="position-relative">
                                <label className="btn btn-warning mb-0">
                                    <i className="ti ti-upload me-2" /> Upload Syllabus
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleExcelUpload}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: 0,
                                            width: "100%",
                                            height: "100%",
                                            opacity: 0,
                                            cursor: "pointer",
                                        }}
                                    />
                                </label>
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

            {/* view modal */}
            {
                viewModal && (<div
                    className="modal fade show d-block"
                    id="view_syllabus"


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
                                    onClick={() => setViewModal(false)}
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
                                    onClick={() => setViewModal(false)}
                                >
                                    Close
                                </button>
                            </div>

                        </div>
                    </div>
                </div>)
            }
        </div>
    );
};

export default SyllabusForSchoolDas;