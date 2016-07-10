import { combineReducers } from 'redux';
import LivewellReducer from './reducer_livewell';

const rootReducer = combineReducers ({
  livewell: LivewellReducer
});

export default rootReducer;
