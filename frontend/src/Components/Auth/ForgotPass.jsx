import React, { useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import Logo from '../../Assets/Icono_masconecta.svg';
import 'react-toastify/dist/ReactToastify.css';

function ForgotModal({ showModal, handleClose }) {
  const handleSubmit = async (values) => {
    try {
      const response = await axios.post('http://localhost:3001/auth/forgotpassword', {
        Email: values.Email,
      });

      if (response.status === 200) {
        toast.success('Se ha enviado el correo');
        handleClose();
      } else {
        toast.error('Error al enviar el correo');
      }
    } catch (error) {
      toast.error('Error al enviar el correo');
      console.error(error);
    }
  };
  
  const validationSchema = Yup.object({
    Email: Yup.string().email('Correo electrónico inválido').required('Campo requerido'),
  });

  return (
    <Modal show={showModal} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Olvide mi contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="Auth-form-container px-5 py-3">
          <Formik
            initialValues={{
              Email: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(handleSubmit)}
          >
            {({ values }) => (
              <Form>
                <div className="Auth-form-content">
                  <div className="d-flex flex-column align-items-center">
                    <img className="" src={Logo} height="45px" width="45px" />
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
                  <div className="d-grid gap-2 mt-3">
                    <button type="submit" className="btn btn submit-bt" disabled={!(values.Email)}>
                      Enviar
                    </button>
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

export default ForgotModal;