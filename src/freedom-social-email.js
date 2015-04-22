/* globals freedom,BrowserBox,emailjs */
var EmailSocialProvider = function (dispatchEvents, args) {
  'use strict';

  this.imap = new BrowserBox('localhost', 143, {
    auth: {
      user: args.user,
      pass: args.password
    },
    id: {
      name: 'freedom-social-email IMAP client',
      version: '0.1.0'
    }
  });
  this.smtp = emailjs.server.connect({
    user:     args.user,
    password: args.password, 
    host:     args.smtphost, 
    ssl:      true
  });
};


// TODO implement below methods to satisfy social interface
/**
 * Begin the login view, potentially prompting for credentials.
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 */
EmailSocialProvider.prototype.login = function(loginOpts, continuation) {
  'use strict';
  continuation(undefined, {
    errcode: 'UNKNOWN',
    message: 'No login function defined'
  });
};


/**
 * Clear any credentials / state in the app.
 * @method clearCachedCredentials
 */
EmailSocialProvider.prototype.clearCachedCredentials = function(continuation) {
  'use strict';
  delete this.credentials;
  continuation();
};


/**
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


EmailSocialProvider.prototype.getUsers = function(continuation) {
  'use strict';
  continuation(this.vCardStore.getUsers());
};


/**
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
  this.status = 'offline';
  this.credentials = null;
  this.lastMessageTimestampMs_ = null;
  if (this.pollForDisconnectInterval_) {
    clearInterval(this.pollForDisconnectInterval_);
    this.pollForDisconnectInterval_ = null;
  }
  if (this.client) {
    this.client.send(new window.Email.Element('presence', {
      type: 'unavailable'
    }));
    this.client.end();
    this.client = null;
  }
  if (continuation) {
    continuation();
  }
};


/**
 * Handle messages from the Email client.
 * @method onMessage
 */
EmailSocialProvider.prototype.onMessage = function(from, msg) {
  'use strict';
};

// TODO other event receiving maybe


// Register provider when in a module context.
if (typeof freedom !== 'undefined') {
  if (!freedom.social) {
    freedom().provideAsynchronous(EmailSocialProvider);
  } else {
    freedom.social().provideAsynchronous(EmailSocialProvider);
  }
}
