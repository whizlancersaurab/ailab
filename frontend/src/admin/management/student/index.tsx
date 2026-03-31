import React, { useEffect, useMemo, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { toast } from "react-toastify";
import { Spinner } from "../../../spinner.tsx";
import dayjs from 'dayjs';
import CircleImage from "../../../auth/register/CircleImage.tsx";
import { addNewStudent, deleteStudent, speSchoolStudent, updateStudent } from "../../../service/api.ts";

export interface studentData {
  id: number;
  userId: number | null;
  firstname: string;
  lastname: string;
  email: string;
  name: string;
  profileImage: string;
  schoolLogo: string;
  created_at: string;
}

const Student = () => {
  const route = all_routes;
  const [students, setStudents] = useState<studentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortType, setSortType] = useState<"asc" | "desc">("asc");

  const [loading2, setLoading2] = useState<boolean>(false);
  const [addModal, setAddModal] = useState<boolean>(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  const [editId, setEditId] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<boolean>(false);
  const isEdit = !!editId;

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await speSchoolStudent();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
    setPassword("");
    setConfirmPassword("");
    setProfileFile(null);
    setProfilePreview(null);
    setErrors({});
    setAddModal(false);
    setEditModal(false)
    setEditId(null)
  };

  // Validation with password match
  const validate = () => {
    const newErrors: any = {};
    if (!firstName.trim()) newErrors.firstName = "First Name is required!";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required!";
    if (!email.trim()) newErrors.email = "Email is required!";
    if (!isEdit && !password.trim()) newErrors.password = "Password is required!";
    if (!isEdit && password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match!";
    if (!isEdit && !profileFile) newErrors.profileFile = "Profile Image is required!";
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
    formData.append("password", password);
    if (profileFile) formData.append("studentProfileImage", profileFile);

    try {
      const { data } = await addNewStudent(formData);
      if (data.success) {
        toast.success(data.message);
        fetchStudents();
        resetFormData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add student");
    } finally {
      setLoading2(false);
    }
  };

  // Delete student
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [delModal, setDelModal] = useState<boolean>(false);

  const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const { data } = await deleteStudent(id);
      if (data.success) {
        setDeleteId(null);
        toast.success(data.message);
        fetchStudents();
        setDelModal(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    }
  };

  const cancelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDeleteId(null);
    setDelModal(false);
  };

  const sortedStudents = useMemo(() => {
    const copy = [...students];
    copy.sort((a, b) => (sortType === "asc" ? a.id - b.id : b.id - a.id));
    return copy;
  }, [students, sortType]);


  const handleEdit = (record: any) => {
    setEditId(record.userId);
    setFirstName(record.firstname || "");
    setLastName(record.lastname || "");
    setEmail(record.email || "");
    setProfilePreview(record.profileImage);
    setProfileFile(record.profileImage);
    setEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading2(true);
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    if (profileFile) formData.append("studentProfileImage", profileFile);

    try {
      const { data } = await updateStudent(Number(editId) , formData);
      if (data.success) {
        toast.success(data.message);
        fetchStudents();
        resetFormData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to edit student");
    } finally {
      setLoading2(false);
    }
  };

 

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: any) => (
        <Link to="#" className="link-primary">ST-{text}</Link>
      ),
    },
    {
      title: "School Logo",
      dataIndex: "schoolLogo",
      render: (text: any) => (
        <img style={{ objectFit: 'cover', borderRadius: '100%', width: '60px', height: '60px' }} src={text ?? 'assets/img/school.webp'} />
      ),
    },
    {
      title: "School Name",
      dataIndex: "name",
    },
    {
      title: "Student Image",
      dataIndex: "profileImage",
      render: (text: any) => (
        <img style={{ objectFit: 'cover', borderRadius: '100%', width: '60px', height: '60px' }} src={text ?? 'assets/img/user.jpg'} />
      ),
    },
    {
      title: "FirstName",
      dataIndex: "firstname",
    },
    {
      title: "Lastname",
      dataIndex: "lastname",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Added On",
      dataIndex: "created_at",
      render: (text: any) => dayjs(text).format('DD MMM YYYY'),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => (
        <div className="dropdown">
          <button className="btn btn-white btn-sm" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </button>
          <ul className="dropdown-menu">
            <li>
              <button className="dropdown-item" onClick={() => handleEdit(record)}>
                <i className="ti ti-edit me-2" />
                Edit
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => { setDeleteId(record.userId); setDelModal(true); }}
              >
                <i className="ti ti-trash-x me-2" />
                Delete
              </button>
            </li>
          </ul>
        </div>
      ),
    }
  ];

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Students List</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to={route.adminDashboard}>Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="#">Students</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">All Students</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="mb-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setAddModal(true)}
                >
                  <i className="ti ti-square-rounded-plus-filled me-2" />
                  Add Student
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Students List</h4>
              <div className="d-flex align-items-center flex-wrap">
                <div className="dropdown mb-3">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-sort-ascending-2 me-2" />Sort by A-Z
                  </Link>
                  <ul className="dropdown-menu p-3">
                    <li>
                      <button
                        className={`dropdown-item rounded-1 ${sortType === "asc" ? "active" : ""}`}
                        onClick={() => setSortType("asc")}
                      >Ascending</button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item rounded-1 ${sortType === "desc" ? "active" : ""}`}
                        onClick={() => setSortType("desc")}
                      >Descending</button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              {loading ? <Spinner /> : <Table key={sortType} columns={columns} dataSource={sortedStudents} Selection={false} />}
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {addModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Student</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => { resetFormData(); setAddModal(false); }}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">

                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="form-control" />
                      {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="form-control" />
                      {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" />
                      {errors.email && <small className="text-danger">{errors.email}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" />
                      {errors.password && <small className="text-danger">{errors.password}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-control" />
                      {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Profile Image</label>
                      <CircleImage preview={profilePreview} label="Student Image" onChange={handleProfileChange} />
                      {errors.profileFile && <small className="text-danger text-center">{errors.profileFile}</small>}
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-danger me-2" onClick={() => { resetFormData(); setAddModal(false); }}>Cancel</button>
                    <button type="submit" disabled={loading2} className="btn btn-primary">{loading2 ? "Saving..." : "Add Student"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {editModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Student</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => { resetFormData(); setEditModal(false); }}
                  />
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">

                    <div className="mb-3">
                      <label className="form-label">First Name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="form-control" />
                      {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Last Name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="form-control" />
                      {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" />
                      {errors.email && <small className="text-danger">{errors.email}</small>}
                    </div>

                  

                    <div className="mb-3">
                      <label className="form-label">Profile Image</label>
                      <CircleImage preview={profilePreview} label="Student Image" onChange={handleProfileChange} />
                      {errors.profileFile && <small className="text-danger text-center">{errors.profileFile}</small>}
                    </div>

                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-danger me-2" onClick={() => { resetFormData(); setAddModal(false); }}>Cancel</button>
                    <button type="submit" disabled={loading2} className="btn btn-primary">{loading2 ? "Saving..." : "Edit Student"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Delete Modal */}
      {delModal && (
        <div className="modal fade d-block show">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center">
                <span className="delete-icon"><i className="ti ti-trash-x" /></span>
                <h4>Confirm Deletion</h4>
                <p>You want to delete this item, this can't be undone once deleted.</p>
                {deleteId && (
                  <div className="d-flex justify-content-center">
                    <button className="btn btn-light me-3" onClick={cancelDelete}>Cancel</button>
                    <button className="btn btn-danger" onClick={(e) => handleDelete(deleteId, e)}>Yes, Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Student;