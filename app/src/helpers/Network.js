import axios from 'axios';

export default class Network {

    static get(url) {
        return axios.get(`${process.env.VUE_APP_API_URL}/api${url}`);
    }

    static post(url, params) {
        return axios.post(`${process.env.VUE_APP_API_URL}/api${url}`, params, {
            onDownloadProgress: e => {
                const progress = Math.round(e.loaded * 100 / e.total);
                console.log(progress);
            }
        });
    }

}
