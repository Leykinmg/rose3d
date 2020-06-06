import del from 'del';

const list = [
    'dist/rose3d/server',
    'dist/rose3d/app',
    'src/app/**/*.css',
    'src/app/**/*.css.map',
    'src/app/**/*.js.map',
    // exclusion
    '!src/app/vendor/**'
];

/**
 * Clean
 */
function clean() {
    return del(list);
}

export default clean;
