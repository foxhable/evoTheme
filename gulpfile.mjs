import { createRequire } from 'module';
const require = createRequire(import.meta.url);


import gulp from 'gulp';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(dartSass);

import concat         from 'gulp-concat';
const uglify          = require('gulp-uglify-es').default;
import autoprefixer   from 'gulp-autoprefixer';
import imagemin       from 'gulp-imagemin';
import del            from 'del';

const paths = {
  styles: {
    src: 'clientSide-src/scss/style.scss',
    dest: 'app/public/css',
    scss: 'clientSide-src/scss/**/*.scss'
  },
  scripts: {
    src: 'clientSide-src/js/main.js', 
    dest: 'app/public/js'
  },
  images: {
    src: 'clientSide-src/images/**/*',
    dest: 'app/public/images'
  }
}

function cleanImages() {
  del('src/public/images');
}

function images() {
  return gulp.src(paths.images.src)
    .pipe(imagemin([
      gifsicle({interlaced: true}),
	    mozjpeg({quality: 75, progressive: true}),
	    optipng({optimizationLevel: 5}),
	    svgo({
		    plugins: [
			    {removeViewBox: true},
			    {cleanupIDs: false}
		    ]
	    }),
    ]))
    .pipe(gulp.dest(paths.images.dest))
}

function scripts() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    paths.scripts.src,
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest));
}

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserlist: ['last 10 version'],
      grid: true,
    }))
    .pipe(gulp.dest(paths.styles.dest));
};

function watching() {
  gulp.watch(paths.styles.scss, styles);
  gulp.watch(paths.scripts.src, scripts);
}

export { styles as styles };
export { scripts as scripts };
export { watching as watch };

const imagesUglify = gulp.series(cleanImages, images);
export { imagesUglify as images };

const gulpDefault = gulp.parallel(styles, scripts, watching);
export default gulpDefault;