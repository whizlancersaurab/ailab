import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import { allSchools, changeSchoolStatus, delSchool, speSchool } from "../../../service/api.ts";
// allClasses
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../handlePopUpmodal";
import { Spinner } from "../../../spinner.tsx";
import dayjs from 'dayjs'
import Select from 'react-select'
import CircleImage from "../../../auth/register/CircleImage.tsx";


export interface schoolData {
    id: number,
    userId: null,
    firstname: string,
    lastname: string,
    email: string,
    name: string,
    profileImage: string,
    schoolLogo: string,
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
    const [status, setStatus] = useState<string | 'ACTIVE' | 'SUSPENDED'>('')
    const [showAddSchoolModal, setShowAddSchoolModal] = useState<boolean>(false)
    const [addUserId, setAddUserId] = useState<null | number>(null)




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
        setEditId(null)


    }

    const handelChageSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editId || !status) {
            toast.warn('Required fields are neccsary !')
            return
        }
        try {

            const { data } = await changeSchoolStatus(editId, { status })

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

   

    // 
      const [schoolName , setSchoolName] = useState<string>("");
      const [loading2, setLoading2] = useState<boolean>(false)
    
      const [profileFile, setProfileFile] = useState<File | null>(null);
      const [profilePreview, setProfilePreview] = useState<string | null>(null);
    
      const [logoFile, setLogoFile] = useState<File | null>(null);
      const [logoPreview, setLogoPreview] = useState<string | null>(null);
    
      // update

      const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setProfileFile(file);
        setProfilePreview(URL.createObjectURL(file));
      };
    
      const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      };

    
      const resetFormData = () => {
        setSchoolName("")
        setShowAddSchoolModal(false)
        setProfileFile(null)
        setProfilePreview(null)
        setLogoFile(null)
        setLogoPreview(null)
        // handleModalPopUp('edit_personal_information')
      }
    
    
    
      // ✅ Submit
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!schoolName){
            toast.error('School Name is Required !')
            return
        }else if(schoolName.length<7){
            toast.error('School Name at least 7 chracters !')
            return
        }
       
        setLoading2(true)
        const formData = new FormData();
        formData.append("schoolName",schoolName);
    
        // image files (IMPORTANT)
        if (profileFile) {
          formData.append("profileImage", profileFile);
        }
    
        if (logoFile) {
          formData.append("schoolLogo", logoFile);
        }
    
        try {
            console.log(schoolName , addUserId)
            setShowAddSchoolModal(false)
            resetFormData()
        //   const { data } = await updateProfile(formData);
    
        //   if (data.success) {
        //     toast.success(data.message);
        //     resetFormData()
        //     fetchUser()
        //     handleModalPopUp('edit_personal_information')
    
        //   }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Registration failed");
        } finally {
          setLoading2(false)
        }
      };


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
            title: "User Image",
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
                                        onClick={() => {
                                            setAddUserId(record.id)
                                            setShowAddSchoolModal(true)
                                        }}
                                       
                                    >
                                        <i className="ti ti-edit-circle me-2" />
                                        Add Another School
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

                {/* add another school */}
                {
                    showAddSchoolModal&&
                    ( <div className="modal fade show d-block" >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Edit Personal Information</h4>
                                <button
                                    type="button"
                                    className="btn-close custom-btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                // onClick={() => resetFormData()}
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>
                            <div className="p-3">
                                <div className="row justify-content-center align-items-center ">
                                    <div className="">
                                        <form onSubmit={handleSubmit}>

                                            <div className="card">
                                                <div className="card-body">


                                                    {/* Profile & School Images */}
                                                    <div className="row mb-4">
                                                        <div className="col-6">
                                                            <CircleImage
                                                                preview={profilePreview}
                                                                label="User Image"
                                                                onChange={handleProfileChange}
                                                            />
                                                        </div>

                                                        <div className="col-6">
                                                            <CircleImage
                                                                preview={logoPreview}
                                                                label="School Logo"
                                                                onChange={handleLogoChange}
                                                            />
                                                        </div>
                                                    </div>


                                                    {/* First Name */}
                                                    <div className="mb-3">
                                                        <label className="form-label">School Name</label>
                                                        <input
                                                            name="schoolName"
                                                            value={schoolName}
                                                            onChange={(e)=>setSchoolName(e.target.value)}
                                                            className="form-control mb-2"
                                                            placeholder="School Name"
                                                        />
                                                      
                                                    </div>

                                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                             onClick={()=>resetFormData()}

                                                        >
                                                            Back
                                                        </button>

                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="btn btn-primary px-4"
                                                        >
                                                            {loading2 ? 'Adding...' : 'Add'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>)
                }
            </>
        </div>
    );
};

export default School;