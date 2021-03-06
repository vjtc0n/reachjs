module.exports = function( grunt ) {
  "use strict";

  var pkg = require("./package.json");

  grunt.initConfig({
    connect: {
      test: {
        options: {
          port: 8000,
          hostname: '*'
        }
      }
    },
    uglify: {
      options: {
        mangle: false,
        beautify: true,
        "indent-level" : 2,
        width : 120,
        semicolons: false,
        quote_style: 1,
        //wrap: 'window',
        banner: "/*Reach Client v"+pkg.version+"*/\n!function(exports, global) {",
        footer: "}({}, function() {return this || window || {};}());"
      },
      reach: {
        options: {
        },
        files: {
          'dist/reach.js': ['./lib/merge.js','./lib/image.js','./lib/request.js', 'index.js']
        }
      },
      reachmin: {
        options: {
          drop_console: true,
          mangle: true,
          beautify: false
        },
        files: {
          'dist/reach.min.js': ['./lib/request.js', 'index.js']
        }
      }
    },
    jshint: {
      all: {
        src: [
          "index.js", "lib/**/*.js"
        ],
        options: {
          jshintrc: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false,
          clearRequireCache: false
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      files: [ "<%= jshint.all.src %>" ],
      tasks: [ "jshint:all", "uglify:reach" ]
    }
  });

  // Load grunt tasks from NPM packages
  require( "load-grunt-tasks" )( grunt );

  grunt.registerTask("dev", ["connect", "watch"]);

  grunt.registerTask( "build", [ "jshint:all", "uglify" ] );

  grunt.registerTask( "lint", [ "jshint:all" ] );

  grunt.registerTask( "default", [ "build" ] );
};