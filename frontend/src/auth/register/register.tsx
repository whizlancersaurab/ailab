import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import type { RootState } from "../../core/data/redux/store";
import { register } from "../../service/api";
import CircleImage from "./CircleImage";


interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface TeacherForm {
  firstName: string;
  lastName: string;
  email: string;
  profileFile: File | null;
  profilePreview: string | null;
}

interface SchoolForm {
  schoolName: string;
  profileFile: File | null;   // admin image
  profilePreview: string | null;
  logoFile: File | null;      // school logo
  logoPreview: string | null;
  teacher: TeacherForm;       // teacher info
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state: RootState) => state.authSlice);

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [schools, setSchools] = useState<SchoolForm[]>([
    {
      schoolName: "",
      profileFile: null,
      profilePreview: null,
      logoFile: null,
      logoPreview: null,
      teacher: { firstName: "", lastName: "", email: "", profileFile: null, profilePreview: null }
    }
  ]);

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("menuOpened", "Register");
  }, []);

 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // School form change
  const handleSchoolChange = (index: number, value: string) => {
    const updated = [...schools];
    updated[index].schoolName = value;
    setSchools(updated);
  };

  const handleProfileChange = (index: number, file: File) => {
    const updated = [...schools];
    updated[index].profileFile = file;
    updated[index].profilePreview = URL.createObjectURL(file);
    setSchools(updated);
  };

  const handleLogoChange = (index: number, file: File) => {
    const updated = [...schools];
    updated[index].logoFile = file;
    updated[index].logoPreview = URL.createObjectURL(file);
    setSchools(updated);
  };

  // Teacher handlers
  const handleTeacherChange = (
    schoolIdx: number,
    field: keyof TeacherForm,
    value: string | File
  ) => {
    const updated = [...schools];
    if (field === "profileFile") {
      if (value instanceof File) {
        updated[schoolIdx].teacher.profileFile = value;
        updated[schoolIdx].teacher.profilePreview = URL.createObjectURL(value);
      }
    } else {
   
      updated[schoolIdx].teacher[field] = value as string;
    }
    setSchools(updated);
  };

  
  const addSchool = () => {
    setSchools(prev => [
      ...prev,
      {
        schoolName: "",
        profileFile: null,
        profilePreview: null,
        logoFile: null,
        logoPreview: null,
        teacher: { firstName: "", lastName: "", email: "", profileFile: null, profilePreview: null }
      }
    ]);
  };

  const removeSchool = (index: number) => {
    setSchools(prev => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = () => {
    const err: Errors = {};
    if (!form.firstName.trim()) err.firstName = "First name is required";
    else if (form.firstName.length < 3) err.firstName = "First name must be at least 3 characters";

    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Invalid email address";

    if (!form.password) err.password = "Password is required";
    else if (form.password.length < 8) err.password = "Password must be at least 8 characters";

    if (!form.confirmPassword) err.confirmPassword = "Confirm password is required";
    else if (form.password !== form.confirmPassword) err.confirmPassword = "Passwords do not match";

    // Validate each school and teacher
    schools.forEach((school, idx) => {
      if (!school.schoolName.trim()) err[`schoolName${idx}`] = `School ${idx + 1} name is required`;
      const t = school.teacher;
      if (!t.firstName.trim()) err[`teacherFirstName${idx}`] = "Teacher first name required";
      if (!t.email.trim()) err[`teacherEmail${idx}`] = "Teacher email required";
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const resetFormData = () => {
    setForm({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    setSchools([
      {
        schoolName: "",
        profileFile: null,
        profilePreview: null,
        logoFile: null,
        logoPreview: null,
        teacher: { firstName: "", lastName: "", email: "", profileFile: null, profilePreview: null }
      }
    ]);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("password", form.password);

    // Append each school and teacher info
    schools.forEach((school) => {
      formData.append(
        "schools",
        JSON.stringify({
          schoolName: school.schoolName,
          teacher: {
            firstName: school.teacher.firstName,
            lastName: school.teacher.lastName,
            email: school.teacher.email
          }
        })
      );

      if (school.profileFile) formData.append("profileImage", school.profileFile);
      if (school.logoFile) formData.append("schoolLogo", school.logoFile);
      if (school.teacher.profileFile) formData.append("teacherProfileImage", school.teacher.profileFile);
    });

     
  // for (const pair of formData.entries()) {
  //   console.log(pair[0], pair[1]);
  // }

    try {
      const { data } = await register(formData);
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
    <div className="container-fluid">
      <div className="w-100 vh-100">
        <div className="row">
          {/* LEFT SIDE */}
         

          {/* RIGHT SIDE */}
          <div style={{ overflowY: 'scroll' }} className="col-12">
            <div className="row justify-content-center align-items-center vh-100">
              <div className="col-md-8 p-4">
                <form onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                   <h1>Register New School</h1>
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <h2>Register</h2>
                      <p>Please enter details to register new school(s)</p>

                      {/* User Info */}
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="form-control mb-2" placeholder="First Name" />
                        {errors.firstName && <p className="text-danger">{errors.firstName}</p>}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="form-control mb-2" placeholder="Last Name" />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control mb-2" placeholder="Email" />
                        {errors.email && <p className="text-danger">{errors.email}</p>}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control mb-2" placeholder="Password" />
                        {errors.password && <p className="text-danger">{errors.password}</p>}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-control mb-2" placeholder="Confirm Password" />
                        {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
                      </div>

                      {/* Schools */}
                      {schools.map((school, idx) => (
                        <div key={idx} className="border p-3 mb-3 rounded">
                          <h5>School {idx + 1}</h5>
                          <input type="text" value={school.schoolName} onChange={(e) => handleSchoolChange(idx, e.target.value)} placeholder="School Name" className="form-control mb-2" />
                          {errors[`schoolName${idx}`] && <p className="text-danger">{errors[`schoolName${idx}`]}</p>}

                          <div className="row mb-3">
                            <div className="col-6">
                              <CircleImage preview={school.profilePreview} label="User Image" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProfileChange(idx, f); }} />
                            </div>
                            <div className="col-6">
                              <CircleImage preview={school.logoPreview} label="School Logo" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoChange(idx, f); }} />
                            </div>
                          </div>

                          {/* Teacher Inputs */}
                          <div className="border p-2 mb-2">
                            <h6>Teacher Details</h6>
                            <input type="text" value={school.teacher.firstName} onChange={(e) => handleTeacherChange(idx, "firstName", e.target.value)} placeholder="Teacher First Name" className="form-control mb-2" />
                            <input type="text" value={school.teacher.lastName} onChange={(e) => handleTeacherChange(idx, "lastName", e.target.value)} placeholder="Teacher Last Name" className="form-control mb-2" />
                            <input type="email" value={school.teacher.email} onChange={(e) => handleTeacherChange(idx, "email", e.target.value)} placeholder="Teacher Email" className="form-control mb-2" />
                            <CircleImage preview={school.teacher.profilePreview} label="Teacher Image" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTeacherChange(idx, "profileFile", f); }} />
                          </div>

                          {schools.length > 1 && (
                            <button type="button" className="btn btn-danger mb-2" onClick={() => removeSchool(idx)}>Remove School</button>
                          )}
                        </div>
                      ))}

                      <button type="button" className="btn btn-secondary mb-3" onClick={addSchool}>+ Add Another School</button>

                      {role === "SUPER_ADMIN" && (
                        <div className="d-flex justify-content-between mt-3">
                          <button type="button" className="btn btn-danger" onClick={() => { resetFormData(); navigate(-1); }}>Back</button>
                          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Registering..." : "Register"}</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-center mt-4">Copyright © {new Date().getFullYear()} - Whizlancer</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
