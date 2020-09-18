import Plugin from '../../main/ts/Plugin';
Plugin();
tinymce.init({
    selector: 'textarea.tinymce_1',
    plugins: 'code budwriter',
    budwriter: {
        name: 'Andre',
        photoUrl: 'https://www.biggalyoga.com/wp-content/uploads/2018/07/profilecircle-768x814.png',
        key: 'free4all',
        socketUrl: 'localhost:3000'
    },
    toolbar: 'budwriter',
    height: '600',
    branding: false,
});
tinymce.init({
    selector: 'textarea.tinymce_2',
    plugins: 'code budwriter',
    budwriter: {
        name: 'James',
        key: 'free4all',
        socketUrl: 'localhost:3000'
    },
    toolbar: 'budwriter',
    height: '600',
    branding: false,
});
//# sourceMappingURL=Demo.js.map