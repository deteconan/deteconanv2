import axios from 'axios';

export default class Network {

    static get(url) {
        this.setToken();
        return axios.get(`${process.env.VUE_APP_API_URL}/api${url}`);
    }

    static post(url, params) {
        this.setToken();
        return axios.post(`${process.env.VUE_APP_API_URL}/api${url}`, params);
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
