import { createContext, useContext, useReducer } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const initialState = {
    id: null,
    mote: '',
    email: '',
  };

  const userReducer = (state, action) => {
    switch (action.type) {
      case 'SET_USER':
        return {
          ...state,
          id: action.payload.id,
          mote: action.payload.mote,
          email: action.payload.email,
        };
      case 'CLEAR_USER':
        return initialState;
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