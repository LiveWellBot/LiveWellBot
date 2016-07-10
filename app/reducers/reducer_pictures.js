import { FETCH_IMAGES, FETCH_IMAGE } from '../actions/index';

export default function(state = [], action) {
  switch(action.type) {
    case FETCH_IMAGES:
      return [ action.payload.data, ...state];
    case FETCH_IMAGE:
      return [ action.payload.data, ...state];
    default
      return state;
  }
}
