import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
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
  const { userState, dispatch } = useUserContext();
  const id = userState.id;
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
          Nombre: (userData.Nombre && userData.Nombre !=="null") ? userData.Nombre : '',
          Apellido: (userData.Apellido && userData.Apellido !=="null") ? userData.Apellido : '',
          Descripcion: (userData.Descripcion && userData.Descripcion !=="null") ? userData.Descripcion : '',
          esEmpresa: userState.esEmpresa,
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
    if (values.Contrasena && values.Contrasena !== initialValues.Contrasena) {
      formData.append('Contrasena', values.Contrasena);
    } else {
      formData.append('Contrasena', initialValues.Contrasena);
    }
  
    formData.append('Gustos', values.Gustos);
    formData.append('Nombre', values.Nombre);
    formData.append('Apellido', values.Apellido);
    formData.append('Descripcion', values.Descripcion);
    if (values.Foto) {
      formData.append('Foto', values.Foto);
    }
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
            foto: values.Foto,
            esEmpresa: userState.esEmpresa,
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
              <h3 className="text-center mt-5">Editar perfil</h3>
              <div className="mb-3">
                <div className="row mt-5">
                  <div className="col-2 rounded-circle profile-image">
                    {selectedImage ? (
                      <img src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage}  height="120px" width="120px" alt="Profile" className="rounded-circle" />
                    ) : (
                      <div className="default-image">
                        <img src={values.Foto} alt="Profile" height="120px" width="120px" className="rounded-circle" />
                      </div>
                    )}
                  </div>
                  <div className="col-10 form-group mt-2 d-flex align-items-center"> 
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
                </div>
                <div className='row'>
                  <div className="col-md-6">
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
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mt-2">
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
                    <div className="form-group">
                      <div className="input-group mt-2">
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
                  </div>
                </div>
                <div className=" d-flex justify-content-center ">
                  <button type="submit" className="btn submit-bt p-4 mt-2">
                      Editar
                  </button>
                </div>
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