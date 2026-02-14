import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { toast } from "react-toastify";
import CircleImage from "../../../auth/register/CircleImage.tsx";
import type { OptionType } from "../../../core/data/interface/index.tsx";
import { addNewSchool, allUsers } from "../../../service/api.ts";
import Select from "react-select";

const NewSchool = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<OptionType[]>([]);

  // School fields
  const [schoolName, setSchoolName] = useState<string>("");
  const [user, setUser] = useState<number | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Teacher fields
  const [teacherFirstName, setTeacherFirstName] = useState<string>("");
  const [teacherLastName, setTeacherLastName] = useState<string>("");
  const [teacherEmail, setTeacherEmail] = useState<string>("");
  const [teacherProfileFile, setTeacherProfileFile] = useState<File | null>(null);
  const [teacherProfilePreview, setTeacherProfilePreview] = useState<string | null>(null);

  // Errors
  const [errors, setErrors] = useState<any>({});

  // Fetch users for select
  const fetchUsers = async () => {
    try {
      const { data } = await allUsers();
      if (data.success) {
        setUsers(
          data.data.map((c: any) => ({ value: c.usersId, label: c.name }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // File Handlers
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

  const handleTeacherProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeacherProfileFile(file);
    setTeacherProfilePreview(URL.createObjectURL(file));
  };

  // Reset Form
  const resetFormData = () => {
    setSchoolName("");
    setUser(null);
    setProfileFile(null);
    setProfilePreview(null);
    setLogoFile(null);
    setLogoPreview(null);
    setTeacherFirstName("");
    setTeacherLastName("");
    setTeacherEmail("");
    setTeacherProfileFile(null);
    setTeacherProfilePreview(null);
    setErrors({});
  };

  // Validation
  const validate = () => {
    const newErrors: any = {};

    if (!schoolName.trim()) newErrors.schoolName = "School Name is required!";
    else if (schoolName.trim().length < 7)
      newErrors.schoolName = "School Name must be at least 7 characters!";

    if (!user) newErrors.user = "Owner Name is required!";
    if (!profileFile) newErrors.profileFile = "Profile Image is required!";
    if (!logoFile) newErrors.logoFile = "School Logo is required!";

    if (!teacherFirstName.trim()) newErrors.teacherFirstName = "Teacher First Name required!";
    if (!teacherLastName.trim()) newErrors.teacherLastName = "Teacher Last Name required!";
    if (!teacherEmail.trim()) newErrors.teacherEmail = "Teacher Email required!";
    if (!teacherProfileFile) newErrors.teacherProfileFile = "Teacher Profile Image required!";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();

    // School info
    formData.append("schoolName", schoolName);
    formData.append("userId", String(user));
    if (profileFile) formData.append("profileImage", profileFile);
    if (logoFile) formData.append("schoolLogo", logoFile);

    // Teacher info
    formData.append(
      "teacher",
      JSON.stringify({
        firstName: teacherFirstName,
        lastName: teacherLastName,
        email: teacherEmail,
      })
    );
    if (teacherProfileFile) formData.append("teacherProfileImage", teacherProfileFile);

    try {
      const { data } = await addNewSchool(formData);

      if (data.success) {
        toast.success(data.message);
        resetFormData();
        navigate(-1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Schools List</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={route.superadmindashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">School</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  New School
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Form */}
        <div className="row justify-content-center mt-5">
          <div className="col-8">
            <form onSubmit={handleSubmit}>
              <div className="card rounded-5">
                <div className="card-body">
                  <div className="text-center mb-4">
                    <h1>Add New School</h1>
                  </div>

                  {/* School Images */}
                  <div className="row mb-4">
                    <div className="col-12 col-sm-6">
                      <CircleImage
                        preview={profilePreview}
                        label="User Image"
                        onChange={handleProfileChange}
                      />
                      {errors.profileFile && <small className="text-danger">{errors.profileFile}</small>}
                    </div>
                    <div className="col-12 mt-3 mt-sm-0 col-sm-6">
                      <CircleImage
                        preview={logoPreview}
                        label="School Logo"
                        onChange={handleLogoChange}
                      />
                      {errors.logoFile && <small className="text-danger">{errors.logoFile}</small>}
                    </div>
                  </div>

                  {/* School Name */}
                  <div className="mb-3">
                    <label className="form-label">School Name</label>
                    <input
                      name="schoolName"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="form-control mb-2"
                      placeholder="School Name"
                    />
                    {errors.schoolName && <small className="text-danger">{errors.schoolName}</small>}
                  </div>

                  {/* Owner */}
                  <div className="mb-3">
                    <label htmlFor="">Owner Name</label>
                    <Select<OptionType>
                      options={users}
                      value={users.find((o) => Number(o.value) === user)}
                      onChange={(option: any) => setUser(option.value)}
                      placeholder="Select User"
                      className="text-capitalize"
                    />
                    {errors.user && <small className="text-danger">{errors.user}</small>}
                  </div>

                  {/* Teacher Info */}
                  <div className="mb-3">
                    <h5>Teacher Info</h5>
                    <div className="mb-2">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={teacherFirstName}
                        onChange={(e) => setTeacherFirstName(e.target.value)}
                        className="form-control"
                      />
                      {errors.teacherFirstName && <small className="text-danger">{errors.teacherFirstName}</small>}
                    </div>

                    <div className="mb-2">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={teacherLastName}
                        onChange={(e) => setTeacherLastName(e.target.value)}
                        className="form-control"
                      />
                      {errors.teacherLastName && <small className="text-danger">{errors.teacherLastName}</small>}
                    </div>

                    <div className="mb-2">
                      <label>Email</label>
                      <input
                        type="email"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="form-control"
                      />
                      {errors.teacherEmail && <small className="text-danger">{errors.teacherEmail}</small>}
                    </div>

                    <div className="mb-2">
                      <label>Teacher Profile Image</label>
                      <CircleImage
                        preview={teacherProfilePreview}
                        label="Teacher Image"
                        onChange={handleTeacherProfileChange}
                      />
                      {errors.teacherProfileFile && <small className="text-danger">{errors.teacherProfileFile}</small>}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={resetFormData}
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary px-4">
                      {loading ? "Adding..." : "Add"}
                    </button>
                  </div>

                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSchool;
