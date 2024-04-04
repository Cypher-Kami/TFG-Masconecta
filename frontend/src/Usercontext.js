import { createContext, useContext, useReducer } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children, initialUserID }) => {
  const initialState = {
    id: initialUserID || null,
    mote: '',
    email: '',
    foto: '',
    esEmpresa: 0,
    publicaciones: [],
    currentComponent: 'Home',
    theme: 'light',
  };

  const userReducer = (state, action) => {
    console.log("Action received in userReducer", action);
    switch (action.type) {
      case 'SET_USER':
        return {
          ...state,
          id: action.payload.id,
          mote: action.payload.mote,
          foto: action.payload.foto,
          email: action.payload.email,
          esEmpresa: action.payload.esEmpresa,
        };
      case 'CLEAR_USER':
        return initialState;
      case 'ADD_PUBLICACION':
        return {
          ...state,
          publicaciones: [action.payload, ...state.publicaciones],
        };
      case 'SET_CURRENT_COMPONENT':
        return {
          ...state,
          currentComponent: action.payload,
        };
      case 'TOGGLE_THEME':
        return {
          ...state,
          theme: state.theme === 'light' ? 'dark' : 'light',
        };
      default:
        return state;
    }
  };

  const [userState, dispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ userState, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);