'use strict';

var path = require('path')

var outDir = 'build',
  baseDir = '',
  lessDir = 'style/less',
  cssDir = 'style/css',
  jslibDir = 'script/jslib',
  jsDir = 'script/js',
  images = 'images',
  tplDir = 'build';

var lrPort = 35728;
var lrSnippet = require('connect-livereload')({
  port: lrPort
});

var lrMiddleware = function(connect, options) {
  return [
    lrSnippet,
    connect.static(options.base),
    connect.directory(options.base)
  ];
};

grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  connect: {
    options: {
      port: 8001,
      hostname: 'localhost',
      base: '.'
    },
    livereload: {
      options: {
        middleware: lrMiddleware
      }
    }
  },
  //clean清除
  clean: {
    options: {},
    clean: [
      path.join(outDir, '{image,script,style,view,favicon.ico,index.html}'),
    ],
  },
  /*less编译*/
  less: {
    options: {},

    all2css: {
      expand: true,
      flatten: true,
      cwd: path.join(baseDir, lessDir),
      src: ['**.less', '!*.min.css'],
      dest: path.join(baseDir, cssDir),
      ext: '.css'
    }
  },
  /*minCSS编译*/
  cssmin: {
    options: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */',
    },
    all2min: {
      expand: true,
      cwd: path.join(baseDir, cssDir), // 指定待压缩的文件路径
      src: ['*.css', '!*.min.css'], // 匹配相对于cwd目录下的所有css文件(排除.min.css文件)
      dest: path.join(outDir, cssDir), // 生成的压缩文件存放的路径
      ext: '.min.css' // 生成的文件都使用.min.css替换原有扩展名，生成文件存放于dest指定的目录中
    }
  },
  //uglify压缩js
  uglify: {
    options: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */',
    },
    jslibAll2min: {
      expand: true,
      cwd: path.join(baseDir, jslibDir),
      src: ['*.js', '!*.min.js'],
      dest: path.join(outDir, jslibDir),
      ext: '.min.js'
    },
    jsAll2min: {
      expand: true,
      cwd: path.join(baseDir, jsDir),
      src: ['*.js', '!*.min.js'],
      dest: path.join(outDir, jsDir),
      ext: '.min.js'
    }
  },
  swig_precompile: {
    options: {
      locals: require('./options'),
      beautify: {
        indent_size: 2
      }
    },
    buildHtml: {
      expand: true,
      cwd: "template",
      src: "**/*.tpl",
      dest: "build/view"
    }
  },
  //html压缩
  htmlmin: {
    options: { // Target options
      removeComments: true,
      collapseWhitespace: true
    },
    web2view: {
      expand: true,
      cwd: path.join(baseDir, tplDir + '/view'),
      src: ['*.html'],
      dest: path.join(outDir, '/view'),
      ext: '.html'
    }
  },
  //image压缩
  imagemin: {
    options: {
      optimizationLevel: 3 //定义 PNG 图片优化水平
    },
    img2min: {
      files: [{
        expand: true,
        cwd: path.join(baseDir),
        src: ['image/**/*.png', 'image/**/*.jpg'],
        dest: path.join(outDir)
      }]
    },
    icoImg2min: {
      files: [{
        expand: true,
        cwd: path.join(baseDir),
        src: '*.ico',
        dest: path.join(outDir)
      }]
    }
  },
  //concat合并js
  concat: {
    options: {
      separator: '^_^;',
    },
    src: [
      path.join(outDir, jsDir + '/*.js')
    ],
    dest: path.join(outDir, jsDir + '/<%= pkg.name %>.js'),
    dist: {
      src: [path.join(outDir, jsDir + '/*.js'), ],
      dest: path.join(outDir, jsDir + '/<%= pkg.name %>.js')
    }
  },
  //复制文件
  copy: {
    ico: {
      files: [{
        expand: true,
        cwd: path.join(baseDir),
        src: '*.ico',
        dest: path.join(outDir)
      }]
    }
  },
  //监听watch
  watch: {
    scripts: {
      files: path.join(baseDir, 'script/**/*.js'),
      tasks: ['uglify:jslibAll2min', 'uglify:jsAll2min'],
      options: {
        livereload: true,
      },
    },
    less: {
      files: path.join(baseDir, 'style/less/**/*.less'),
      tasks: ['less:all2css', 'cssmin:all2min'],
      options: {
        livereload: true,
      },
    },
    tpl: {
      files: path.join(baseDir, 'template/**/*.tpl'),
      tasks: ['swig_precompile:buildHtml', 'htmlmin'],
      options: {
        livereload: true,
      },
    },
  },
});


// 加载包含 任务的插件。
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-contrib-imagemin');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-swig-precompile');

// 默认被执行的任务列表。
grunt.registerTask('default', [
  'swig_precompile:buildHtml',
  'clean:clean',
  'less:all2css',
  'cssmin:all2min',
  'uglify:jslibAll2min',
  'uglify:jsAll2min',
  'htmlmin',
  'imagemin:img2min',
  'copy:ico',
]);


grunt.registerTask('grunt-watch', [
  'default',
  'watch'
]);
