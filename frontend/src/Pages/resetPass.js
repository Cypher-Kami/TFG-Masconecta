import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import Logo from '../Assets/Icono_masconecta.svg';
import 'react-toastify/dist/ReactToastify.css';

function ResetPass () {
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
          const response = await axios.post(`http://localhost:3001/auth/resetpassword/${token}`, {
            Contrasena: values.Contrasena,
          });
    
          if (response.status === 200) {
            toast.success('Se ha restablecido la contraseña', {
              onClose: () => navigate('/')
            });
          } else {
            toast.error("Error restableciendo la contraseña");
          }
        } catch (error) {
          toast.error(error);
          console.error(error);
        }
      };
    
    const validationSchema = Yup.object({
        Contrasena: Yup.string().required('Campo requerido'),
        ContrasenaRepetida: Yup.string().required('Campo requerido')
        .oneOf([Yup.ref('Contrasena'), null], 'Las contraseñas no coinciden'),
    });

  return (
    <div className="container mt-5">
      <div className='row'>
        <div className='col-3'></div>
        <div className='col-6 login-container p-5 py-5 rounded-4'>
          <Formik
            initialValues={{ Contrasena: '', ContrasenaRepetida: ''  }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values }) => (
              <Form>
                <div className="Auth-form-content">
                  <div className="d-flex flex-column align-items-center">
                    <img className="" src={Logo} height="45px" width="45px" />
                  </div>
                  <h3 className="text-center">Bienvenido</h3>
                  <p className="text-center mb-4">Introduce tu nueva contraseña</p>
                  <div className="form-group mt-3">
                    <div className="input-group">
                      <Field
                        type={showPassword2 ? 'text' : 'password'}
                        className="form-control inputs"
                        placeholder="Contraseña"
                        name="Contrasena"
                      />
                      <div className="input-group-append eye-icon-container">
                        <span className="input-group-text eye-icon" onClick={() => setShowPassword2(!showPassword2)}>
                          <FontAwesomeIcon icon={showPassword2 ? faEye : faEyeSlash} />
                        </span>
                      </div>
                    </div>
                    <ErrorMessage name="Contrasena" component="div" className="error-message" />
                  </div>
                  <div className="form-group mt-3">
                    <div className="input-group">
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        className="form-control inputs"
                        placeholder="Contraseña repetida"
                        name="ContrasenaRepetida"
                      />
                      <div className="input-group-append eye-icon-container">
                        <span className="input-group-text eye-icon" onClick={() => setShowPassword(!showPassword)}>
                          <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                        </span>
                      </div>
                    </div>
                    <ErrorMessage name="ContrasenaRepetida" component="div" className="error-message" />
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <button type="submit" className="btn submit-bt" disabled={!( values.Contrasena && values.ContrasenaRepetida )}>
                      Enviar
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className='col-3'></div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default ResetPass;