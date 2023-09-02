import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import NavFeed from './NavFeed';
import { useUserContext } from '../../Usercontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';

const options = [
  { value: 'Perros', label: 'Perros' },
  { value: 'Gatos', label: 'Gatos' },
  { value: 'Conejos', label: 'Conejos' },
];

function Profile() {
  const { id } = useParams();
  const { userState, dispatch } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [initialValues, setInitialValues] = useState({
    Mote: '',
    Email: '',
    Contrasena: '',
    Nombre: '',
    Apellido: '',
    Descripcion: '',
    Foto: null,
    Gustos: [],
  });

  useEffect(() => {
    axios.get(`http://localhost:3001/usuario/${id}`)
      .then(response => {
        const userData = response.data;
        userData.Gustos = userData.Gustos.split(",");
        setInitialValues({
          Mote: userData.Mote,
          Email: userData.Email,
          Gustos: userData.Gustos,
          Contrasena: '',
          Foto: userData.Foto,
          Nombre: userData.Nombre,
          Apellido: userData.Apellido,
          Descripcion: userData.Descripcion,
        });
      })
      .catch(error => {
        console.error('Error al obtener los datos del usuario:', error);
      });
  }, [id]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSubmit = async (values) => {
    let formData = new FormData();
    formData.append('Mote', values.Mote);
    formData.append('Email', values.Email);
    console.log(values.Contrasena, "Contraseña");
    console.log(initialValues.Contrasena, "Contraseña inicial");
    if (values.Contrasena && values.Contrasena !== initialValues.Contrasena) {
      formData.append('Contrasena', values.Contrasena);
    } else {
      formData.append('Contrasena', initialValues.Contrasena);
    }
  
    formData.append('Gustos', values.Gustos);
    formData.append('Nombre', values.Nombre);
    formData.append('Apellido', values.Apellido);
    formData.append('Descripcion', values.Descripcion);
    console.log(values.Foto);
    if (values.Foto) {
      formData.append('Foto', values.Foto);
    }
    console.log(formData);
    try {
      const response = await axios.put(`http://localhost:3001/usuario/editar-perfil/${id}`, formData);
      if (response.status >= 200 && response.status < 300) {
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
      toast.error('Error al actualizar el perfil:', error);
    }
  };

  const validationSchema = Yup.object({
    Mote: Yup.string().required('Campo requerido'),
    Email: Yup.string().email('Correo electrónico inválido').required('Campo requerido'),
    Gustos: Yup.array().required('Campo requerido'),
  });

  return (
    <>
      <div className='container'>
        <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={(handleSubmit)}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <h3 className="text-center">Editar perfil</h3>
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="rounded-circle profile-image">
                  {selectedImage ? (
                    <img src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage}  height="250px" width="250px" alt="Profile" className="img-fluid rounded-circle" />
                  ) : (
                    <div className="default-image">
                      <img src={values.Foto} alt="Profile" height="250px" width="250px" className="img-fluid rounded-circle" />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group mt-2">
                <input
                  type="file"
                  className="form-control inputs"
                  name="Foto"
                  accept="image/*"
                  onChange={(event) => {
                    setFieldValue('Foto', event.currentTarget.files[0]);
                    handleImageChange(event);
                  }}
                />
              </div>
              <div className="form-group mt-2">
                <Field
                  type="text"
                  className="form-control mt-1 inputs"
                  placeholder="Mote"
                  name="Mote"
                  value={values.Mote}
                  onChange={(e) => setFieldValue("Mote", e.target.value)}
                />
                <ErrorMessage name="Mote" component="div" className="error-message" />
              </div>
              <div className="form-group mt-2">
                <Field
                  type="text"
                  className="form-control mt-1 inputs"
                  placeholder="Nombre"
                  name="Nombre"
                  value={values.Nombre}
                  onChange={(e) => setFieldValue("Nombre", e.target.value)}
                />
              </div>
              <div className="form-group mt-2">
                <Field
                  type="text"
                  className="form-control mt-1 inputs"
                  placeholder="Apellido"
                  name="Apellido"
                  value={values.Apellido}
                  onChange={(e) => setFieldValue("Apellido", e.target.value)}
                />
              </div>
              <div className="form-group mt-3">
                <Field
                  type="email"
                  className="form-control mt-1 inputs"
                  placeholder="Email"
                  name="Email"
                  value={values.Email}
                  onChange={(e) => setFieldValue("Email", e.target.value)}
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
                    onChange={(e) => setFieldValue("Contrasena", e.target.value)}
                  />
                  <div className="input-group-append eye-icon-container">
                    <span className="input-group-text eye-icon" onClick={() => setShowPassword(!showPassword)}>
                      <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </span>
                  </div>
                </div>
                <ErrorMessage name="Contrasena" component="div" className="error-message" />
              </div>
              <div className="form-group mt-2">
                <Field
                  type="text"
                  className="form-control mt-1 inputs"
                  placeholder="Descripción"
                  name="Descripcion"
                  value={values.Descripcion}
                  onChange={(e) => setFieldValue("Descripcion", e.target.value)}
                />
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
                  value={values.Gustos.map(gusto => ({ value: gusto, label: gusto }))}
                />
                <ErrorMessage name="Gustos" component="div" className="error-message" />
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