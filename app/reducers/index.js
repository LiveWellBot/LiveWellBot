import { combineReducers } from 'redux';
import PicturesReducer from './reducer_pictures';

const rootReducer = combineReducers ({
  pictures: PicturesReducer
});

export default rootReducer;
