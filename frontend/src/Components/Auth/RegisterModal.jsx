import React, { useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Logo from '../../Assets/Icono_masconecta.svg';
import termsCondiciones from '../../Misc/terminosCondiciones';
import 'react-toastify/dist/ReactToastify.css';

const options = [
  { value: 'Perros', label: 'Perros' },
  { value: 'Gatos', label: 'Gatos' },
  { value: 'Conejos', label: 'Conejos' },
];

const popover = (
  <Popover id="popover-right">
    <Popover.Title as="h3">Términos y Condiciones</Popover.Title>
    <Popover.Content>{termsCondiciones}</Popover.Content>
  </Popover>
);

function RegisterModal({ showModal, handleClose }) {
  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('Mote', values.Mote);
    formData.append('Email', values.Email);
    formData.append('Contrasena', values.Contrasena);
    formData.append('Foto', values.Foto); 
    formData.append('Gustos', (values.Gustos).join(","));
    try {
      const response = await axios.post('http://localhost:3001/auth/register', formData);
      if (response.status >= 200 && response.status < 300) {
        toast.success('Registro exitoso');
        handleClose();
      } else {
        toast.error('Error al registrar');
      }
    } catch (error) {
      toast.error('Error al registrar');
      console.error(error);
    }
  };
  
  const validationSchema = Yup.object({
    Mote: Yup.string().required('Campo requerido'),
    Email: Yup.string().email('Correo electrónico inválido').required('Campo requerido'),
    Contrasena: Yup.string().required('Campo requerido').min(8, "La contraseña debe tener minimo 8 caracteres"),
    //Foto: Yup.mixed().required('Campo requerido'),
    Gustos: Yup.array().required('Campo requerido'),
    Terminos: Yup.boolean().oneOf([true], 'Debes aceptar los términos y condiciones').required('Campo requerido'),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const handleNextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        {step > 1 && (
          <Button variant="Link" className="step-back-btn" onClick={handlePrevStep}>
            <FontAwesomeIcon icon={faArrowLeft} className='color-primary' />
          </Button>
        )}
        <Modal.Title>Paso {step} de {totalSteps}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="Auth-form-container px-5 py-3">
          <Formik
            initialValues={{
              Mote: '',
              Email: '',
              Contrasena: '',
              Foto: null,
              Gustos: [],
              Terminos: false
            }}
            validationSchema={validationSchema}
            onSubmit={(handleSubmit)}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <div className="Auth-form-content">
                  <div className="d-flex flex-column align-items-center">
                    <img className="" src={Logo} height="45px" width="45px" />
                  </div>
                  <h3 className="text-center mb-5">Crea tu mascocuenta</h3>
                  {step === 1 && (
                    <>
                      <div className="form-group mt-3">
                        <Field
                          type="text"
                          className="form-control mt-1 inputs"
                          placeholder="Mote"
                          name="Mote"
                        />
                        <ErrorMessage name="Mote" component="div" className="error-message" />
                      </div>
                      <div className="form-group mt-3">
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
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="form-group mt-3">
                        <label>Foto</label>
                        <input
                          type="file"
                          className="form-control mt-1 inputs"
                          name="Foto"
                          onChange={(event) => setFieldValue('Foto', event.currentTarget.files[0])}
                        />
                        <ErrorMessage name="Foto" component="div" className="error-message" />
                      </div>
                      <div className="form-group mt-3">
                        <Select
                          defaultValue={options.filter(option => values.Gustos.includes(option.value))}
                          onChange={(selectedOptions) => setFieldValue('Gustos', selectedOptions.map(option => option.value))}
                          options={options}
                          isMulti
                          isSearchable
                          placeholder="Gustos"
                          name="Gustos"
                        />
                        <ErrorMessage name="Gustos" component="div" className="error-message" />
                      </div>
                      <div className="form-group mt-3">
                        <label className="form-check-label">
                          <Field type="checkbox" name="Terminos" className="form-check-input inputs" />
                          <OverlayTrigger
                            trigger="click"
                            placement="right" 
                            overlay={popover}
                            show={popoverVisible}
                            onHide={() => setPopoverVisible(false)}
                          >
                            <a
                              href="#"
                              className="mt-1 mx-2"
                              onClick={(e) => {
                                e.preventDefault();
                                setPopoverVisible(!popoverVisible);
                              }}
                            >
                              Acepto los términos y condiciones.
                            </a>
                          </OverlayTrigger>
                        </label>
                        <ErrorMessage name="Terminos" component="div" className="error-message" />
                      </div>
                    </>
                  )}
                  <div className="d-grid gap-2 mt-3">
                    {step < totalSteps ? (
                      <button className="btn submit-bt" onClick={handleNextStep} disabled={!(values.Mote && values.Email && values.Contrasena)}>Siguiente</button>
                    ) : (
                      <button type="submit" className="btn btn submit-bt" disabled={!(values.Terminos && values.Foto && values.Gustos)}>
                        Registrarse
                      </button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
          <ToastContainer />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-light" onClick={handleClose}>Cerrar</button>
      </Modal.Footer>
    </Modal>
  );
}

export default RegisterModal;