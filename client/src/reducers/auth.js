//register a user
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  ACCOUNT_DELETED,
} from '../action/types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true, // we wanna mek sure , if user authenticated make sure that is loading is done
  user: null, //when we make request to api, that we putting here email:username and so on
};

export default function (state = initialState, action) {
  //shortcut of upper
  const { type, payload } = action;
  switch (type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload,
      };
    case REGISTER_SUCCESS: //if success
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false, //because we've got a response and stopping a loading
      };
    case REGISTER_FAIL: ///if fail success
    case AUTH_ERROR: // if authe error do below
    case LOGIN_FAIL:
    case LOGOUT:
    case ACCOUNT_DELETED:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false, //because we've got a response and stopping a loading
      };
    default:
      return state;
  }
}
