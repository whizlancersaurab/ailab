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
  
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<OptionType[]>([]);

  // Form Fields
  const [schoolName, setSchoolName] = useState<string>("");
  const [user, setUser] = useState<number | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Errors
  const [errors, setErrors] = useState<{
    schoolName?: string;
    user?: string;
    profileFile?: string;
    logoFile?: string;
  }>({});

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

  // Reset Form
  const resetFormData = () => {
    setSchoolName("");
    setUser(null);
    setProfileFile(null);
    setProfilePreview(null);
    setLogoFile(null);
    setLogoPreview(null);
    setErrors({});
  };


  const validate = () => {
    const newErrors: {
      schoolName?: string;
      user?: string;
      profileFile?: string;
      logoFile?: string;
    } = {};

    if (!schoolName.trim()) newErrors.schoolName = "School Name is required!";
    else if (schoolName.trim().length < 7)
      newErrors.schoolName = "School Name must be at least 7 characters!";

    if (!user) newErrors.user = "Owner Name is required!";
    if (!profileFile) newErrors.profileFile = "Profile Image is required!";
    if (!logoFile) newErrors.logoFile = "School Logo is required!";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("schoolName", schoolName);
    formData.append("userId", String(user));

    if (profileFile) formData.append("profileImage", profileFile);
    if (logoFile) formData.append("schoolLogo", logoFile);

    try {
      
      const { data } = await addNewSchool(formData);

      if(data.success){
          toast.success(data.message);
          resetFormData();
          navigate(-1)
        
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
                  <Link to={route.adminDashboard}>Dashboard</Link>
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

                  {/* Profile & School Images */}
                  <div className="row mb-4">
                    <div className="col-12 col-sm-6">
                      <CircleImage
                        preview={profilePreview}
                        label="User Image"
                        onChange={handleProfileChange}
                      />
                      {errors.profileFile && (
                        <small className="text-danger">{errors.profileFile}</small>
                      )}
                    </div>

                    <div className="col-12 mt-3 mt-sm-0 col-sm-6">
                      <CircleImage
                        preview={logoPreview}
                        label="School Logo"
                        onChange={handleLogoChange}
                      />
                      {errors.logoFile && (
                        <small className="text-danger">{errors.logoFile}</small>
                      )}
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
                    {errors.schoolName && (
                      <small className="text-danger">{errors.schoolName}</small>
                    )}
                  </div>

                  {/* Owner Name */}
                  <div className="mb-3">
                    <label htmlFor="">Owner Name</label>
                    <Select<OptionType>
                      options={users}
                      value={users.find((o) => Number(o.value) === user)}
                      onChange={(option: any) => setUser(option.value)}
                      placeholder="Select User"
                      className="text-capitalize"
                    />
                    {errors.user && (
                      <small className="text-danger">{errors.user}</small>
                    )}
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetFormData}
                    >
                      Back
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
