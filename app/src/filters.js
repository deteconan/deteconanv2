import Vue from 'vue';

Vue.filter('size', value => {
    if (!value)
        return '';

    const bytes = value.quotaBytesUsed;
    const decimals = 1;

    if (bytes === 0) return '0 o';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['o', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
});

Vue.filter('mimeType', value => {
    if (!value)
        return '';

    return value.mimeType;
});
