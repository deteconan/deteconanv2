import Vue from 'vue'

Vue.filter('bytes', value => bytes(value));
Vue.filter('speed', value => bytes(value, true));

function bytes(byteVal, perSec = false) {
    const units = perSec ? ["Bytes/s", "KB/s", "MB/s", "GB/s", "TB/s"] : ["Bytes", "KB", "MB", "GB", "TB"];
    let kounter = 0;
    let kb= 1024;
    let div=byteVal/1;
    while(div>=kb){
        kounter++;
        div= div/kb;
    }
    return div.toFixed(1) + " " + units[kounter];
}

export function tmdbPoster(val) {
    return `https://www.themoviedb.org/t/p/w400${val}`;
}

export function tmdbPosterHD(val) {
    return `https://www.themoviedb.org/t/p/original${val}`;
}

Vue.filter('tmdbPoster', val => tmdbPoster(val));

Vue.filter('tmdbPosterHD', val => tmdbPosterHD(val));
