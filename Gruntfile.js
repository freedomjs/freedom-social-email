/**
 * Gruntfile for freedom-social-email
 *
 **/

var path = require('path');

module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    jasmine_node: 'grunt-jasmine-node2',
    'npm-publish': 'grunt-npm'
  });

  grunt.initConfig({
    copy: {
      build: {
        cwd: 'src/',
        src: ['**'],
        dest: 'build/',
        flatten: false,
        filter: 'isFile',
        expand: true
      },
      freedom: {
        src: [ require.resolve('freedom') ],
        dest: 'build/',
        flatten: true,
        filter: 'isFile',
        expand: true,
        onlyIf: 'modified'
      }
    },

    browserify: {
      emailjsImap: {
        files: {
          'build/emailjs-imap.js': [ require.resolve('emailjs-imap-client') ]
        },
        options: {
          browserifyOptions: {
            standalone: 'ImapClient'
          }
        }
      },
      emailjsSmtp: {
        files: {
          'build/emailjs-smtp.js': [ require.resolve('emailjs-smtp-client') ]
        },
        options: {
          browserifyOptions: {
            standalone: 'SmtpClient'
          }
        }
      }
    },

    jshint: {
      all: ['src/**/*.js', 'spec/**/*.js'],
      options: {
        jshintrc: true,
        ignores: ['src/forge.min.js']
      }
    },

    connect: {
      demo: {
        options: {
          port: 8000,
          keepalive: true,
          base: ['./', 'build/'],
          open: 'http://localhost:8000/build/demo/main.html'
        }
      }
    },

    clean: ['build/']
  });

  grunt.registerTask('build', [
    'jshint',
    'copy',
    'browserify'
  ]);
  grunt.registerTask('demo', [
    'build',
    'connect'
  ]);
  grunt.registerTask('default', [
    'build'
  ]);

};
