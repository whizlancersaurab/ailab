import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import { allSchools,  delSchool, speSchool, updateSchool } from "../../../service/api.ts";
// allClasses
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../handlePopUpmodal";
import { Spinner } from "../../../spinner.tsx";
import dayjs from 'dayjs'
import Select from 'react-select'


export interface schoolData {
    id: number,
    firstname: string,
    lastname: string,
    email: string,
    name: string,
    profileImage:string,
    schoolLogo:string,
    status: 'SUSPENDED | ACTIVE',
    created_at: string;
}

const schoolStatus = [
    { value: '', label: 'Select' },
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'SUSPENDED', label: 'SUSPENDED' },
]



const School = () => {
    const route = all_routes
    const [schools, setSchools] = useState<schoolData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");
    const [editId, setEditId] = useState<number | null>(null)
    const [schoolName, setSchoolName] = useState<string>('')
    const [status, setStatus] = useState<string | 'ACTIVE' | 'SUSPENDED'>('')
    const [firstname, setFirstname] = useState<string>("")
    const [lastname, setLastname] = useState<string>("")


    const fetchSchools = async () => {
        setLoading(true)
        await new Promise((res) => setTimeout(res, 500))
        try {
            const { data } = await allSchools()
            // console.log(data)
            if (data.success) {
                setSchools(data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchools()

    }, [])

    //   CHANGE STATUS

    const fetchSpeSchool = async (id: number) => {
        if (!id) return
        try {

            const { data } = await speSchool(id)
            console.log(data.data)


            if (data.success) {
                console.log(data)
                setStatus(data.data.status)
                setSchoolName(data.data.name)
                setFirstname(data.data.firstname)
                setLastname(data.data.lastname)
                setEditId(id)
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }

    const cancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setStatus('')
        setSchoolName('')
        setFirstname('')
        setLastname('')
        setEditId(null)


    }

    const handelChageSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editId || !status || !firstname) {
            toast.warn('Required fields are neccsary !')
            return
        }
        try {

            const { data } = await updateSchool(editId, { status , firstname , lastname })

            if (data.success) {
                toast.success(data.message)
                fetchSchools()
                setEditId(null)
                setSchoolName('')
                setStatus('')
                handleModalPopUp('changeModal')

            }

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }


    // delete class ===================
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            const { data } = await delSchool(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchSchools()
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
        const copy = [...schools];
        copy.sort((a, b) => {
            return sortType === "asc"
                ? a.id - b.id
                : b.id - a.id;
        });
        return copy;
    }, [schools, sortType]);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        SC-{text}
                    </Link>
                </>
            ),
        },
        {
            title: "School Logo",
            dataIndex: "schoolLogo",
            render: (text: any) => (
                <img style={{objectFit:'cover' , borderRadius:'100%' , width:'60px' , height:'60px'}} className="text-capitalize" src={text??'assets/img/school.webp'} />
            ),
            sorter: (a: any, b: any) => a.schoolLogo.length - b.schoolLogo.length,
        },

        {
            title: "School Name",
            dataIndex: "name",
            render: (text: any) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.name.length - b.name.length,
        },
        {
            title: "User Image",
            dataIndex: "profileImage",
            render: (text: any) => (
                <img style={{objectFit:'cover' , borderRadius:'100%' , width:'60px' , height:'60px'}} className="text-capitalize" src={text??'assets/img/user.jpg'} />
            ),
            sorter: (a: any, b: any) => a. profileImage.length - b. profileImage.length,
        },
        {
            title: "FirstName",
            dataIndex: "firstname",
            render: (text: any) => (
                <span>{text}</span>
            ),
            sorter: (a: any, b: any) => a.firstname.length - b.firstname.length,
        },
        {
            title: "Lastname",
            dataIndex: "lastname",
            render: (text: any) => (
                <span className="text-capitalize">{text ?? '----'}</span>
            ),
            sorter: (a: any, b: any) => a.lastname.length - b.lastname.length,
        },
        {
            title: "Email",
            dataIndex: "email",
            render: (text: any) => (
                <span >{text}</span>
            ),
            sorter: (a: any, b: any) => a.email.length - b.email.length,
        }
        ,

        {
            title: "Status",
            dataIndex: "status",
            render: (text: any) => (
                <span className={`badge ${text === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{text}</span>
            )
        },
        {
            title: "Added On",
            dataIndex: "created_at",
            render: (text: any) => (
                <span >{dayjs(text).format('DD MMM YYYY')}</span>
            )
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
                                        onClick={() => fetchSpeSchool(record.id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#changeModal"
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



    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Schools List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Schools</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Schools
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <Link
                                    to="/register"
                                    className="btn btn-primary"
                                // data-bs-toggle="modal"
                                // data-bs-target="#addDeviceModal"
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    New Register
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Schools List</h4>
                            <div className="d-flex align-items-center flex-wrap">

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
                                <Spinner />
                            ) : (<Table key={sortType} columns={columns} dataSource={sortedDevices} Selection={false} />)
                            }
                            {/* /Guardians List */}
                        </div>
                    </div>
                    {/* /Guardians List */}
                </div>
            </div>
            {/* /Page Wrapper */}
            <>

                {/* change status */}
                <div
                    className="modal fade"
                    id="changeModal"
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">

                            <form onSubmit={handelChageSubmit}>
                                {/* HEADER */}
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit</h5>
                                    <button type="button" onClick={cancelEdit} className="btn-close" data-bs-dismiss="modal" />
                                </div>

                                {/* BODY */}
                                <div className="modal-body">

                                    {/* DEVICE NAME */}
                                    <div className="mb-3">
                                        <label className="form-label">School Name</label>
                                        <input
                                            className={`form-control`}
                                            value={schoolName}
                                            disabled={true}
                                            // onChange={(e) => setDeviceName(e.target.value)}
                                            placeholder="School name"
                                        />

                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            className={`form-control`}
                                            value={firstname}  
                                            onChange={(e) => setFirstname(e.target.value)}
                                            placeholder="First name"
                                        />

                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            className={`form-control`}
                                            value={lastname}   
                                            onChange={(e) => setLastname(e.target.value)}
                                            placeholder="Last name"
                                        />

                                    </div>

                                    {/* STATUS */}
                                    <div className="mb-3">
                                        <label className="form-label">Category</label>
                                        <Select
                                            options={schoolStatus}
                                            value={schoolStatus.find((i: any) => i.value === status)}
                                            onChange={(opt: any) => setStatus(opt.value)}
                                            placeholder="Select Category"

                                        />

                                    </div>

                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-1"
                                        data-bs-dismiss="modal"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes

                                    </button>
                                </div>

                            </form>

                        </div>
                    </div>
                </div>
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
            </>
        </div>
    );
};

export default School;