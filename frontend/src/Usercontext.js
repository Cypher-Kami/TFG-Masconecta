import { createContext, useContext, useReducer } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children, initialUserID }) => {
  const initialState = {
    id: initialUserID || null,
    mote: '',
    email: '',
    foto: '',
    publicaciones: [],
    currentComponent: 'Home',
  };

  const userReducer = (state, action) => {
    switch (action.type) {
      case 'SET_USER':
        return {
          ...state,
          id: action.payload.id,
          mote: action.payload.mote,
          foto: action.payload.foto,
          email: action.payload.email,
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