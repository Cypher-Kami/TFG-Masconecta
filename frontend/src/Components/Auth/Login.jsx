import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import RegisterModal from './RegisterModal';
import ForgotModal from './ForgotPass';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useUserContext } from '../../Usercontext';
import Logo from '../../Assets/Icono_masconecta.svg';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false); 
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleCloseForgot = () => setShowForgotModal(false);
  const handleShowForgot = () => setShowForgotModal(true);

  const handleCloseRegister = () => setShowRegisterModal(false);
  const handleShowRegister = () => setShowRegisterModal(true);

  const navigate = useNavigate();
  const { dispatch } = useUserContext();

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/login', values);
      if (response.status === 200) {
        toast.success('Inicio de sesión exitoso');
        const token = response.data.token;
        values.Recordarme && localStorage.setItem('authToken', token);
        dispatch({
          type: 'SET_USER',
          payload: {
            id: response.data.userID,
            mote: values.Mote,
            contraseña: values.Contrasena,
          },
        });

        navigate('/feed');
      }else {
        toast.error('No se pudo iniciar sesión');
      }
    } catch (error) {
      console.log("Error: ", error.response.data.error);
      toast.error(error.response.data.error);
    }
  };

  const validationSchema = Yup.object({
    Email: Yup.string().email('Correo electrónico inválido').required('Campo requerido'),
    Contrasena: Yup.string().required('Campo requerido'),
  });

  return (
    <div className="login-container p-5 py-5 rounded-4">
      <Formik
        initialValues={{ Email: '', Contrasena: '', Recordarme: false }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form>
            <div className="Auth-form-content">
              <div className="d-flex flex-column align-items-center">
                <img className="" src={Logo} height="45px" width="45px" />
              </div>
              <h3 className="text-center">Bienvenido</h3>
              <p className="text-center mb-4">Introduce tus credenciales</p>
              <div className="form-group">
                <Field
                  type="email"
                  className="form-control mt-1 inputs"
                  placeholder="Email"
                  name="Email"
                />
                <ErrorMessage name="Email" component="div" className="error-message" />
              </div>
              <div className="form-group mt-3">
                <div className="input-group">
                  <Field
                    type={showPassword ? 'text' : 'password'}
                    className="form-control inputs"
                    placeholder="Contraseña"
                    name="Contrasena"
                  />
                  <div className="input-group-append eye-icon-container">
                    <span className="input-group-text eye-icon" onClick={() => setShowPassword(!showPassword)}>
                      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </span>
                  </div>
                </div>
                <ErrorMessage name="Contrasena" component="div" className="error-message" />
              </div>
              <div className="d-grid gap-2 mt-3">
                <button type="submit" className="btn submit-bt">
                  Iniciar sesión
                </button>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-3">
                <div className="form-check">
                  <Field
                    className="form-check-input inputs"
                    type="checkbox"
                    id="rememberCheckbox"
                    name="Recordarme"
                  />
                  <label className="form-check-label mt-1 mx-2" htmlFor="rememberCheckbox">
                    Recordarme
                  </label>
                </div>
                <p className="mt-3">
                  ¿Has olvidado tu <a href="#" onClick={handleShowForgot}>contraseña?</a>
                  <ForgotModal showModal={showForgotModal} handleClose={handleCloseForgot} />
                </p>
              </div>
              <hr className="mt-3"/>
              <div className="d-flex align-items-center">
                <p className="mb-0">¿Sin cuenta aún? </p>
                <b><a href="#" className="ms-2" onClick={handleShowRegister}>Registrate</a></b>
                <RegisterModal showModal={showRegisterModal} handleClose={handleCloseRegister} />
              </div>
            </div>
          </Form>
        )}
      </Formik>
      <ToastContainer />
    </div>
  );
}

export default Login;