import axios from 'axios';

export const FETCH_IMAGES = 'FETCH_IMAGES';
export const FETCH_IMAGE = 'FETCH_IMAGE';
export const PUT_IMAGE = 'UPDATE_IMAGE';

const ROOT_URL = 'localhost:3000/api';

export function fetchImages(id) {
  const request = axios.get(`${ROOT_URL}/livewell/${id}`);

  return {
    type: FETCH_PICTURES,
    payload: request
  };
}

export function fetchImage(id) {
  const request = axios.get(`${ROOT_URL}/livewell/${id}`);

  return {
    type: FETCH_PICTURE,
    payload: request
  };
}

export function putImage(props) {
  const id = livewell.params._id;
  const request = axios.put(`${ROOT_URL}/livewell/${id}`, props);

  return {
    type: PUT_IMAGE,
    payload: request
  };
}
