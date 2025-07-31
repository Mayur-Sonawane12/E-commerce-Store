import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    address: Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .required('Address is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await updateProfile(values);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <FaUser className="me-2" />
                Profile Information
              </h3>
            </div>
            
            <div className="card-body p-5">
              {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}>
                  {message.text}
                </div>
              )}

              <Formik
                initialValues={{
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  address: user.address || '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          <FaUser className="me-1" />
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
                          <FaEnvelope className="me-1" />
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
                        <label htmlFor="phone" className="form-label">
                          <FaPhone className="me-1" />
                          Phone Number
                        </label>
                        <Field
                          type="tel"
                          id="phone"
                          name="phone"
                          className={`form-control ${
                            errors.phone && touched.phone ? 'is-invalid' : ''
                          }`}
                          placeholder="Enter your phone number"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="address" className="form-label">
                          <FaMapMarkerAlt className="me-1" />
                          Address
                        </label>
                        <Field
                          as="textarea"
                          id="address"
                          name="address"
                          rows="3"
                          className={`form-control ${
                            errors.address && touched.address ? 'is-invalid' : ''
                          }`}
                          placeholder="Enter your address"
                        />
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="invalid-feedback"
                        />
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
                            Updating Profile...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Update Profile
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>

              {/* Account Information */}
              <div className="mt-5 pt-4 border-top">
                <h5 className="mb-3">Account Information</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Account Type:</strong> {user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                    <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
                    <p><strong>Account Status:</strong> 
                      <span className="badge bg-success ms-2">Active</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 