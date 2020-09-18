// Plugin();
tinymce.init({
    selector: 'textarea.tinymce_1',
    plugins: 'code',
    external_plugins: {
        budwriter: './plugin.min.js'
    },
    budwriter: {
        name: 'Andre',
        photoUrl: 'https://www.biggalyoga.com/wp-content/uploads/2018/07/profilecircle-768x814.png',
        key: 'free4all',
        socketUrl: 'ws://budwriter-server.herokuapp.com'
    },
    toolbar: 'budwriter',
    height: '600',
    branding: false,
});
tinymce.init({
    selector: 'textarea.tinymce_2',
    plugins: 'code',
    external_plugins: {
        budwriter: './plugin.min.js'
    },
    budwriter: {
        name: 'James',
        key: 'free4all',
        socketUrl: 'ws://budwriter-server.herokuapp.com'
    },
    toolbar: 'budwriter',
    height: '600',
    branding: false,
});
//# sourceMappingURL=Demo.js.map