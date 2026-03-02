import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import { addTopic, allTopics, deleteTopic,speTopic, updateTopic } from "../../../service/api.ts";
// allClasses
import { toast } from "react-toastify";
import { Spinner } from "../../../spinner.tsx";
import type { TasksData } from "../../../core/data/interface/index.tsx";
import dayjs from 'dayjs'

interface Errors {
    title?: string;
    desc?: string;
}


const WhatsNew = () => {
    const route = all_routes
    const [topics, setTopics] = useState<TasksData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [errrors, setErrors] = useState<Errors>({})
    const [title, setTitle] = useState<string>("")
    const [desc, setDesc] = useState<string>("")
    const [editId, setEditId] = useState<number | null>(null)
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");
    const [addModal, setAddModal] = useState<boolean>(false)
    const [editModal, setEditModal] = useState<boolean>(false)
    const [delModal, setDelModal] = useState<boolean>(false)


    const fetchTopics = async () => {
        setLoading(true)

        try {
            const { data } = await allTopics()
            if (data.success) {
                setTopics(data.data)

            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchTopics()

    }, [])

    const resetStates = () => {
        setTitle("")
        setDesc("")
        setEditId(null)
        setAddModal(false)
        setEditModal(false)

    }

    const cancelAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        resetStates()
    }

    const validateFunction = () => {
        const newErrors: Errors = {}

        if (!title.trim()) {
            newErrors.title = 'Title is required!'
        } else if (title.length < 10) {
            newErrors.title = 'Title must be at least 10 characters!'
        }

        if (!desc.trim()) {
            newErrors.desc = 'Description is required!'
        } else if (desc.length < 30) {
            newErrors.desc = 'Description must be at least 30 characters!'
        }
        setErrors(newErrors)
        return newErrors
    }


    //add
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateFunction()
        if (Object.keys(errors).length > 0) {
            return
        }
        const payLoad = {
            title: title,
            description: desc,
        }

        try {

            const apiCall = editId ? updateTopic(payLoad, editId) : addTopic(payLoad)
            const { data } = await apiCall
            if (data.success) {
                toast.success(data.message)
                resetStates()
                fetchTopics()

            }
        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }

    };

    // edit
    const fetchSpecificTopic = async (id: number) => {
        console.log(id)
        if (!id) return
        setEditModal(true)
        try {
            const { data } = await speTopic(id)

            if (data.success) {
                setTitle(data.data.title)
                setDesc(data.data.description)
                setEditId(data.data.id)
            }

        } catch (error) {
            console.log(error)
        }
    }

    // delete class
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {

            const { data } = await deleteTopic(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchTopics()
                setDelModal(false)
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    const cancelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeleteId(null)
        setDelModal(false)
    }

    const sortedDevices = useMemo(() => {
        const copy = [...topics];

        copy.sort((a, b) => {
            return sortType === "asc"
                ? a.id - b.id
                : b.id - a.id;
        });

        return copy;
    }, [topics, sortType]);



    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        T-{text}
                    </Link>
                </>
            ),
        },

        {
            title: "Title",
            dataIndex: "title",
            render: (text: any) => (
                <span className="text-uppercase">{text}</span>
            ),
            sorter: (a: any, b: any) => a.title.length - b.title.length,
        },

        {
            title: "Description",
            dataIndex: "description",
            render: (text: number) => (
                <span className="text-uppercase">{text}</span>
            ),
            sorter: (a: any, b: any) => a.description.length - b.description.length,
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
                                        onClick={() => fetchSpecificTopic(record.id)}

                                    >
                                        <i className="ti ti-edit-circle me-2" />
                                        Edit
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => {
                                            setDeleteId(record.id)
                                            setDelModal(true)
                                        }
                                        }

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
                            <h3 className="page-title mb-1">What's New</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.superadmindashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">What's new </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Topics
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setAddModal(true)}
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add New Topic
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Topic List</h4>
                            <div className="d-flex align-items-center flex-wrap">

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
                            ) : (<Table key={sortType + Math.floor(Math.random() * 100000)} columns={columns} dataSource={sortedDevices} Selection={false} />)
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
                {
                    addModal && (<div className="modal fade d-block show" id="add_task">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Add Topic</h4>
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
                                                <div className="mb-3">
                                                    <label className="form-label" >Title</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="title"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}

                                                    />
                                                    {
                                                        errrors.title && (<p className="text-danger" style={{ fontSize: '11px' }}>{errrors.title}</p>)
                                                    }
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label" >Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="desc"
                                                        value={desc}
                                                        onChange={(e) => setDesc(e.target.value)}
                                                        cols={4}
                                                    />
                                                    {
                                                        errrors.desc && (<p className="text-danger" style={{ fontSize: '11px' }}>{errrors.desc}</p>)
                                                    }
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light me-2"

                                            onClick={cancelAdd}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"

                                        >
                                            Add Topic
                                        </button>
                                    </div>
                                </form>


                            </div>
                        </div>
                    </div>)
                }
                {/* /Add task*/}
                {/* edit task */}
                {
                    editModal && (<div className="modal fade show d-block" id="edit_task">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Edit Topic</h4>
                                    <button
                                        type="button"
                                        onClick={cancelAdd}
                                        className="btn-close custom-btn-close"


                                    >
                                        <i className="ti ti-x" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label className="form-label" >Title</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="title"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}

                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label" >Description</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="desc"
                                                        value={desc}
                                                        onChange={(e) => setDesc(e.target.value)}
                                                        cols={6}
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

                                            onClick={cancelAdd}
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
                    </div>)
                }
                {/* edit task */}
                {/* Delete Modal */}
                {
                    delModal && (<div className="modal fade d-block show" id="delete-modal">
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
                    </div>)
                }
                {/* /Delete Modal */}

            </>
        </div>
    );
};

export default WhatsNew;