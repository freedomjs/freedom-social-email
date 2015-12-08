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

var EmailSocialProvider = function (dispatchEvent) {
  'use strict';
  this.dispatchEvent = dispatchEvent;
  this.credentials = null;
};


/**
 * Receive credentials from client application.
 * @method onCredentials
 * @private
 * @param {function} continuation call to complete to login promise.
 * @param {object} msg The authentication message sent by the client.
 **/
EmailSocialProvider.prototype.onCredentials = function(continuation, msg) {
  'use strict';
  if (msg.cmd && msg.cmd === 'auth') {
    this.credentials = msg.credentials;
    this.login(null, continuation);
  } else if (msg.cmd && msg.cmd === 'error') {
    continuation(undefined, {
      errcode: 'LOGIN_FAILEDCONNECTION',
      message: 'Failed to connect to email provider'
    });
  } else {
    continuation(undefined, {
      errcode: 'LOGIN_BADCREDENTIALS',
      message: 'Bad credentials, could not log into email'
    });
  }
};


/**
 * Begin the login view, potentially prompting for credentials.
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 */
EmailSocialProvider.prototype.login = function(loginOpts, continuation) {
  'use strict';
  console.log(this.credentials);
  this.smtp = new SmtpClient(this.credentials.smtphost, 587, {
    useSecureTransport: true,
    requireTLS: true,
    name: 'freedom-social-email SMTP client',
    auth: {
      user: this.credentials.user,
      pass: this.credentials.password
    },
  });
  this.imap = new BrowserBox(this.credentials.imaphost, 143, {
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
  this.credentials = null;
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
  if (!this.smtp) {
    this.logger.warn('No client available to send message to ' + to);
    continuation(undefined, {
      errcode: 'OFFLINE',
      message: this.ERRCODE.OFFLINE
    });
    return;
  }

  var sending = false;
  this.smtp.onidle = function () {
    if (sending) {
      return;
    }
    sending = true;
    // Ready to set up a new envelope
    this.smtp.useEnvelope({
      from: this.credentials.user,
      to: [to]
    });
  };
  this.smtp.onready = function(failedRecipients){
    if(failedRecipients.length){
      console.log('The following addresses were rejected: ', failedRecipients);
    }
    // Ready to send the email
    client.send("Subject: freedom-social-email message\r\n");
    client.send("\r\n");
    client.send(msg);
    client.end();
  };
  this.smtp.ondone = function(success){
    if (success) {
      console.log('The message was transmitted successfully with' + response);
    }
    continuation();
  };
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
