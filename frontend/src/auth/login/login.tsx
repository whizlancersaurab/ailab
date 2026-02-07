import React, { useEffect, useState } from "react";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
// import { FaFacebook, FaGoogle } from "react-icons/fa";
import { login } from "../../service/api";
import { toast } from "react-toastify";
import WhatsNew from "../whatsnew";


const Login = () => {
  const routes = all_routes;
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };
  useEffect(() => {
    localStorage.setItem("menuOpened", "Dashboard");
  }, []);
  const date = () => {
    return new Date().getFullYear();
  };



  interface LoginForm {
    email: string;
    password: string;
  }

  interface Errors {
    email?: string;
    password?: string;
  }

  const navigate = useNavigate()
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: ''
  })
  const [error, setError] = useState<Errors>({})
  const [loading , setLoading] = useState<boolean>(false)


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateLoginForm = (form: LoginForm) => {
    const errors: Errors = {};

    // ✅ Email validation
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // ✅ Password validation
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    //  else if (
    //   !/(?=.*[a-z])/.test(form.password) ||
    //   !/(?=.*[A-Z])/.test(form.password) ||
    //   !/(?=.*\d)/.test(form.password) ||
    //   !/(?=.*[@$!%*?&])/.test(form.password)
    // ) {
    //   errors.password =
    //     "Password must include uppercase, lowercase, number, and special character";
    // }
    setError(errors)
    return Object.keys(errors).length === 0
  };


  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm(loginForm)) {
      return
    }
    setLoading(true)
    try {

      const { data } = await login(loginForm)
      

      if (data.success) {
        toast.success(data.message)
        if (data.role === 'ADMIN')
          navigate(routes.adminDashboard)
        else if (data.role === 'SUPER_ADMIN')
          navigate(routes.superadmindashboard)
      }

    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.message)
    }finally{
      setLoading(false)
    }
  };


  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row">

          <WhatsNew />

          <div className="col-lg-6 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
              <div className="col-md-8 mx-auto p-4">
                <form onSubmit={handleSubmit}>
                  <div>
                    <div className=" mx-auto mb-5 text-center">
                      <ImageWithBasePath
                        src="assets/img/authentication/authentication-logo.svg"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="card">
                      <div className="card-body pb-3">
                        <div className=" mb-4">
                          <h2 className="mb-2">Welcome</h2>
                          <p className="mb-0">
                            Please enter your details to sign in
                          </p>
                        </div>

                        <div className="mb-3 ">
                          <label className="form-label">Email Address</label>
                          <div className="input-icon mb-3 position-relative">
                            <span className="input-icon-addon">
                              <i className="ti ti-mail" />
                            </span>
                            <input
                              name="email"
                              value={loginForm.email}
                              onChange={handleChange}
                              type="text"
                              className="form-control"
                              placeholder="Enter Email"
                              autoComplete="off"
                            />
                          </div>
                          {error.email && (<p className="text-danger">{error.email}</p>)}
                          <label className="form-label">Password</label>
                          <div className="pass-group">
                            <input
                              name="password"
                              placeholder="Enter Password"
                              value={loginForm.password}
                              onChange={handleChange}
                              autoComplete="off"
                              type={isPasswordVisible ? "text" : "password"}
                              className="pass-input form-control"
                            />
                            <span
                              className={`ti toggle-password ${isPasswordVisible ? "ti-eye" : "ti-eye-off"
                                }`}
                              onClick={togglePasswordVisibility}
                            />
                          </div>
                          {error.password && (<p className="text-danger">{error.password}</p>)}
                        </div>

                        <div className="form-wrap form-wrap-checkbox">
                          {/* <div className="d-flex align-items-center"> */}
                          {/* <div className="form-check form-check-md mb-0">
                              <input
                                className="form-check-input mt-0"
                                type="checkbox"
                              />
                            </div> */}
                          <p></p>
                          {/* </div> */}
                          <div className="text-end">
                            <Link to={routes.forgotPassword} className="link-danger">
                              Forgot Password?
                            </Link>
                          </div>
                        </div>

                      </div>
                      <div className="p-4 pt-0">
                        <div className="mb-3">
                          <button
                            type="submit"
                            // to={routes.adminDashboard}
                            disabled={loading}
                            className="btn btn-primary w-100"
                          >
                           {loading?'Signing...':' Sign In'}
                          </button>
                        </div>
                        {/* <p className="text-center mt-3">
                          Don’t have an account?{" "}
                          <Link to={routes.register}>Sign Up</Link>
                        </p> */}

                      </div>
                    </div>
                    <div className="mt-5 text-center">
                      <p className="mb-0 ">Copyright © {date()} - Whizlancer</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
