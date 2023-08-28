import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import NavFeed from '../Components/Feed/NavFeed';
import { useUserContext } from '../Usercontext';
import 'react-toastify/dist/ReactToastify.css';

const options = [
  { value: 'Perros', label: 'Perros' },
  { value: 'Gatos', label: 'Gatos' },
  { value: 'Conejos', label: 'Conejos' },
];

function Profile() {
  const { id } = useParams();
  const { userState, dispatch } = useUserContext();
  const [initialValues, setInitialValues] = useState({
    Mote: '',
    Email: '',
    Gustos: [],
  });

  useEffect(() => {
    axios.get(`http://localhost:3001/usuario/${id}`)
      .then(response => {
        const userData = response.data;
        setInitialValues({
          Mote: userData.Mote,
          Email: userData.Email,
          Gustos: userData.Gustos,
        });
      })
      .catch(error => {
        console.error('Error al obtener los datos del usuario:', error);
      });
  }, [id]);

  const handleSubmit = async (values) => {
    console.log(values);
    console.log(userState);
    const formData = new FormData();
    formData.append('Mote', values.Mote);
    formData.append('Email', values.Email);
    formData.append('Contrasena', values.Contrasena);
    formData.append('Foto', values.Foto); 
    formData.append('Gustos', (values.Gustos).join(","));

    try {
      const response = await axios.put(`http://localhost:3001/usuario/editar-perfil/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success('Perfil actualizado exitosamente.');
        dispatch({
          type: 'SET_USER',
          payload: {
            id: id,
            mote: values.Mote,
            email: values.Email,
          },
        });
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  const validationSchema = Yup.object({
    Mote: Yup.string().required('Campo requerido'),
    Email: Yup.string().email('Correo electrónico inválido').required('Campo requerido'),
    //Contrasena: Yup.string().required('Campo requerido'),
    //Foto: Yup.mixed().required('Campo requerido'),
    Gustos: Yup.array().required('Campo requerido'),
  });

  return (
    <>
      <NavFeed />
      <div className='container login-container mt-5 p-5 py-5 rounded-4'>
      <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(handleSubmit)}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <h3 className="text-center">Editar perfil</h3>
            <div className="form-group mt-2">
              <Field
                type="text"
                className="form-control mt-1 inputs"
                placeholder="Mote"
                name="Mote"
                value={initialValues.Mote}
                readOnly={false}
              />
              <ErrorMessage name="Mote" component="div" className="error-message" />
            </div>
            <div className="form-group mt-3">
              <Field
                type="email"
                className="form-control mt-1 inputs"
                placeholder="Email"
                name="Email"
                value={initialValues.Email}
              />
              <ErrorMessage name="Email" component="div" className="error-message" />
            </div>
            <div className="form-group mt-2">
              <Select
                defaultValue={options.filter(option => initialValues.Gustos.includes(option.value))}
                onChange={(selectedOptions) => setFieldValue('Gustos', selectedOptions.map(option => option.value))}
                options={options}
                isMulti
                isSearchable
                placeholder="Gustos"
                name="Gustos"
              />
              <ErrorMessage name="Gustos" component="div" className="error-message" />
            </div>
            <div className="form-group mt-2">
              <input 
                type="file" 
                className='form-control inputs'
                name="Foto"
                onChange={(event) => setFieldValue('Foto', event.currentTarget.files[0])}
              />
            </div>
            <div className="d-grid gap-2 mt-3">
              <button type="submit" className="btn submit-bt">
                  Enviar
              </button>
            </div>
          </Form>
        )}
        </Formik>
      </div>
      <ToastContainer />
    </>
  );
}

export default Profile;