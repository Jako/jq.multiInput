const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const sass = require('sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// Read package information dynamically from package.json
const packageJson = require('./package.json');
const dateStr = new Date().toISOString()
    .split('T')[0];

const banner = `/*! ${packageJson.name} * Version: ${packageJson.version} * Build date: ${dateStr} */\n`;

// Helper: Ensure directory structure exists
function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Helper function to compile scripts
async function compileScripts(files, dest, filename) {
    console.log('Compiling scripts...');
    let combinedCode = files.map(f => fs.readFileSync(f, 'utf8'))
        .join('\n');
    const minified = await minify(combinedCode, {
        mangle: true,
        compress: true,
        format: {
            comments: false,
        },
    });
    const finalCode = banner + minified.code;
    ensureDirExists(dest);
    filename = filename.replace(/(\.\w+)$/i, '.min$1');
    fs.writeFileSync(path.join(dest, filename), finalCode, 'utf8');
}

// Helper function to compile, autoprefix and minify Sass
async function compileSass(src, intermediate, dest, filename) {
    console.log('Compiling Sass & processing CSS...');
    const sassResult = sass.compile(src, { style: 'expanded' });
    const postcssResult = await postcss([
        autoprefixer(),
        cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
    ])
        .process(sassResult.css, { from: undefined });
    const finalCss = postcssResult.css + '\n' + banner;
    ensureDirExists(dest);
    filename = filename.replace(/(\.\w+)$/i, '.min$1');
    fs.writeFileSync(path.join(dest, filename), finalCss, 'utf8');
}

async function taskScripts() {
    await compileScripts([
        'src/js/jq.multiinput.js'
    ], 'dist/js/', 'jq.multiinput.js');
}

async function taskSass() {
    await compileSass(
        'src/scss/jq.multiinput.scss',
        'src/css/',
        'dist/css/',
        'jq.multiinput.css',
    );
}

const action = process.argv[2];
if (action === 'scripts') {
    taskScripts();
} else if (action === 'sass') {
    taskSass();
} else {
    // Default: Beides ausführen
    taskScripts()
        .then(() => taskSass());
}

console.log('Done!');
