/* globals window:true,freedom:true,BrowserBox,emailjs,global */

/**
 * Implementation of a Social provider for freedom.js that
 * uses IMAP/SMTP clients to connect to email servers.
 **/

// Global declarations for node.js
if (typeof global !== 'undefined') {
  if (typeof window === 'undefined') {
    global.window = {};
  }
} else {
  if (typeof window === 'undefined') {
    var window = {};
  }
}

var EmailSocialProvider = function (dispatchEvent, credentials) {
  'use strict';
  this.dispatchEvent = dispatchEvent;
  this.credentials = credentials;  // TODO - better auth, maybe interactive
};


/**
 * Begin the login view, potentially prompting for credentials.
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 */
EmailSocialProvider.prototype.login = function(loginOpts, continuation) {
  'use strict';
  this.smtp = emailjs.server.connect({
    user:     this.credentials.user,
    password: this.credentials.password,
    host:     this.credentials.smtphost,
    ssl:      true
  });
  this.imap = new BrowserBox('localhost', 143, {
    auth: {
      user: this.credentials.user,
      pass: this.credentials.password
    },
    id: {
      name: 'freedom-social-email IMAP client',
      version: '0.1.0'
    }
  });
  if (this.imap) {
    this.imap.connect();
    continuation();
  } else {
    continuation(undefined, {
      errcode: 'UNKNOWN',
      message: 'No login function defined'
    });
  }
};


/**
 * Clear any credentials / state in the app.
 * @method clearCachedCredentials
 */
EmailSocialProvider.prototype.clearCachedCredentials = function(continuation) {
  'use strict';
  delete this.credentials;
};


/**
 * TODO
 * Returns all the <client_state>s that we've seen so far (from any 'onClientState' event)
 * Note: this instance's own <client_state> will be somewhere in this list
 * Use the clientId returned from social.login() to extract your element
 *
 * @method getClients
 * @return {Object} {
 *    'clientId1': <client_state>,
 *    'clientId2': <client_state>,
 *     ...
 * } List of <client_state>s indexed by clientId
 *   On failure, rejects with an error code (see above)
 */
EmailSocialProvider.prototype.getClients = function(continuation) {
  'use strict';
  continuation(this.vCardStore.getClients());
};


// TODO
EmailSocialProvider.prototype.getUsers = function(continuation) {
  'use strict';
  continuation(this.vCardStore.getUsers());
};


/**
 * TODO
 * Sends a message to a user on the network.
 * If the destination is not specified or invalid, the mssage is dropped.
 * @method sendMessage
 * @param {String} to clientId of the device or user to send to.
 * @param {String} msg The message to send
 * @param {Function} continuation Callback after message is sent.
 */
EmailSocialProvider.prototype.sendMessage = function(to, msg, continuation) {
  'use strict';
  if (!this.client) {
    this.logger.warn('No client available to send message to ' + to);
    continuation(undefined, {
      errcode: 'OFFLINE',
      message: this.ERRCODE.OFFLINE
    });
    return;
  }
};


EmailSocialProvider.prototype.logout = function(continuation) {
  'use strict';
  delete this.smtp;  // No explicit logout method for email.js
  this.imap.onclose(continuation);
  this.imap.close();
};


/**
 * TODO
 * Handle messages from the Email client.
 * @method onMessage
 */
EmailSocialProvider.prototype.onMessage = function(from, msg) {
  'use strict';
};

// TODO other event receiving maybe, particularly for credentials/auth


// Register provider when in a module context.
if (typeof freedom !== 'undefined') {
  if (!freedom.social) {
    freedom().provideAsynchronous(EmailSocialProvider);
  } else {
    freedom.social().provideAsynchronous(EmailSocialProvider);
  }
}
