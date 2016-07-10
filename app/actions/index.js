import axios from 'axios';

export const FETCH_IMAGES = 'FETCH_IMAGES';
export const FETCH_IMAGE = 'FETCH_IMAGE';
export const PUT_IMAGE = 'UPDATE_IMAGE';

const ROOT_URL = 'localhost:3000/api';
const API_KEY = '?key=helloworld';

export function fetchImages(id) {
  const request = axios.get(`${ROOT_URL}/livewell/${id}${API_KEY}`);

  return {
    type: FETCH_PICTURES,
    payload: request
  };
}

export function fetchImage(id) {
  const request = axios.get(`${ROOT_URL}/livewell/${id}${API_KEY}`);

  return {
    type: FETCH_PICTURE,
    payload: request
  };
}

export function putImage(props) {
  const id = livewell.params._id;
  const request = axios.patch(`${ROOT_URL}/livewell/${id}${API_KEY}`, props);

  return {
    type: PUT_IMAGE,
    payload: request
  };
}
