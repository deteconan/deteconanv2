import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : window.location.origin;

export default class Network {

    static get(url, options) {
        this.setToken();
        return axios.get(`${API_URL}/api${url}`, options);
    }

    static post(url, params) {
        this.setToken();
        return axios.post(`${API_URL}/api${url}`, params);
    }

    static setToken() {
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    static removeToken() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common[`Authorization`];
    }

}
