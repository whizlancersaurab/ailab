import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { addNewTeacher, deleteTeacher, speSchoolTeachers } from "../../../service/api.ts";
// allClasses
import { toast } from "react-toastify";
import { Spinner } from "../../../spinner.tsx";
import dayjs from 'dayjs'
import CircleImage from "../../../auth/register/CircleImage.tsx";
import { useSelector } from "react-redux";
import type { RootState } from "../../../core/data/redux/store.tsx";




export interface teacherData {
    id: number,
    userId: null,
    firstname: string,
    lastname: string,
    email: string,
    name: string,
    profileImage: string,
    schoolLogo: string,
    created_at: string;
}



const Teacher = () => {
    const route = all_routes
    const [teachers, setTeachers] = useState<teacherData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");

    // add new teacher
    const [loading2, setLoading2] = useState<boolean>(false);
    const [addModal, setAddModal] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});

    const fetchTeachers = async () => {
        setLoading(true)

        try {
            const { data } = await speSchoolTeachers()
            // console.log(data)
            if (data.success) {
                setTeachers(data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeachers()

    }, [])

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfileFile(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    const resetFormData = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setProfileFile(null);
        setProfilePreview(null);
        setErrors({});
        setAddModal(false)
    };

    const validate = () => {
        const newErrors: any = {};

        if (!firstName.trim()) newErrors.firstName = "First Name is required!";
        if (!lastName.trim()) newErrors.lastName = "Last Name is required!";
        if (!email.trim()) newErrors.email = "Email is required!";
        if (!profileFile) newErrors.profileFile = "Profile Image is required!";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading2(true);
        const formData = new FormData();

        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        if (profileFile) formData.append("teacherProfileImage", profileFile);

        try {
            const { data } = await addNewTeacher(formData);

            if (data.success) {
                toast.success(data.message);
                fetchTeachers()
                resetFormData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add teacher");
        } finally {
            setLoading2(false);
        }
    };




    // delete class ===================
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [delModal, setDelModal] = useState<boolean>(false)


    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        try {
            const { data } = await deleteTeacher(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchTeachers()
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
        const copy = [...teachers];
        copy.sort((a, b) => {
            return sortType === "asc"
                ? a.id - b.id
                : b.id - a.id;
        });
        return copy;
    }, [teachers, sortType]);

      const { role } = useSelector((state: RootState) => state.authSlice)
      
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
                <img style={{ objectFit: 'cover', borderRadius: '100%', width: '60px', height: '60px' }} className="text-capitalize" src={text ?? 'assets/img/school.webp'} />
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
            title: "Teacher Image",
            dataIndex: "profileImage",
            render: (text: any) => (
                <img style={{ objectFit: 'cover', borderRadius: '100%', width: '60px', height: '60px' }} className="text-capitalize" src={text ?? 'assets/img/user.jpg'} />
            ),
            sorter: (a: any, b: any) => a.profileImage.length - b.profileImage.length,
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
        },
        {
            title: "Added On",
            dataIndex: "created_at",
            render: (text: any) => (
                <span >{dayjs(text).format('DD MMM YYYY')}</span>
            )
        },


        ...(role === 'ADMIN'
            ? [{
                title: "Action",
                dataIndex: "action",
                render: (_: any, record: any) => (
                    <div className="dropdown">
                        <button
                            className="btn btn-white btn-sm"
                            data-bs-toggle="dropdown"
                        >
                            <i className="ti ti-dots-vertical" />
                        </button>

                        <ul className="dropdown-menu">
                            <li>
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setDeleteId(record.userId)
                                        setDelModal(true)
                                    }}
                                >
                                    <i className="ti ti-trash-x me-2" />
                                    Delete
                                </button>
                            </li>
                        </ul>
                    </div>
                ),
            }]
            : [])

    ];


   


    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Techers List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Teachers</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Teachers
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption /> */}
                            {
                                role === 'ADMIN' && (<div className="mb-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setAddModal(true)}

                                    >
                                        <i className="ti ti-square-rounded-plus-filled me-2" />
                                        Add Teacher
                                    </button>
                                </div>)
                            }
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Teachers List</h4>
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

                {/* add teacher */}



                {
                    addModal && (
                        <>
                            {/* Backdrop */}
                            <div className="modal-backdrop fade show"></div>

                            <div className="modal fade show d-block" tabIndex={-1}>
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">

                                        {/* Header */}
                                        <div className="modal-header">
                                            <h5 className="modal-title">Add New Teacher</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => {
                                                    resetFormData();
                                                    setAddModal(false);
                                                }}
                                            />
                                        </div>

                                        {/* Body */}
                                        <form onSubmit={handleSubmit}>
                                            <div className="modal-body">

                                                <div className="mb-3">
                                                    <label className="form-label">First Name</label>
                                                    <input
                                                        type="text"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="form-control"
                                                    />
                                                    {errors.firstName && (
                                                        <small className="text-danger">{errors.firstName}</small>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="form-control"
                                                    />
                                                    {errors.lastName && (
                                                        <small className="text-danger">{errors.lastName}</small>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="form-control"
                                                    />
                                                    {errors.email && (
                                                        <small className="text-danger">{errors.email}</small>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Profile Image</label>
                                                    <CircleImage
                                                        preview={profilePreview}
                                                        label="Teacher Image"
                                                        onChange={handleProfileChange}
                                                    />
                                                    {errors.profileFile && (
                                                        <small className="text-danger text-center">{errors.profileFile}</small>
                                                    )}
                                                </div>

                                            </div>

                                            {/* Footer */}
                                            <div className="modal-footer">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger me-2"
                                                    onClick={() => {
                                                        resetFormData();
                                                        setAddModal(false);
                                                    }}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn btn-primary"
                                                >
                                                    {loading2 ? "Saving..." : "Add Teacher"}
                                                </button>
                                            </div>
                                        </form>

                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }


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


            </>
        </div>
    );
};

export default Teacher;