import { FETCH_IMAGES, FETCH_IMAGE } from '../actions/index';

const INITIAL_STATE = { all: [], image: null };

export default function(state = INITIAL_STATE, action) {
  switch(action.type) {
    case FETCH_IMAGES:
      return { ...state, all: action.payload.data };
    case FETCH_IMAGE:
      return { ...state, image: action.payload.data };
    default
      return state;
  }
}
