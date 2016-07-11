import { combineReducers } from 'redux';
import LivewellsReducer from './reducer_livewells';
import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
  livewells: LivewellsReducer,
  form: formReducer
});

export default rootReducer;
