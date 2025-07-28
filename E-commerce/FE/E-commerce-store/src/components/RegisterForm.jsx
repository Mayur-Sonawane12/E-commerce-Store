import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = values;
      const result = await register(userData);
      if (result.success) {
        navigate('/');
      } else {
        setFieldError('email', result.error);
      }
    } catch (error) {
      setFieldError('email', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">Create Account</h2>
              
              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          Full Name
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          className={`form-control ${
                            errors.name && touched.name ? 'is-invalid' : ''
                          }`}
                          placeholder="Enter your full name"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          className={`form-control ${
                            errors.email && touched.email ? 'is-invalid' : ''
                          }`}
                          placeholder="Enter your email"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <div className="input-group">
                          <Field
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            className={`form-control ${
                              errors.password && touched.password ? 'is-invalid' : ''
                            }`}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          <ErrorMessage
                            name="password"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm Password
                        </label>
                        <div className="input-group">
                          <Field
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            className={`form-control ${
                              errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
                            }`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="invalid-feedback"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={isSubmitting || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm; 