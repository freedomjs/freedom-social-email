/*globals freedom:true,setTimeout,console,VCardStore,EmailSocialProvider */
/*jslint indent:2,white:true,sloppy:true */

/**
 * Begin the login view, potentially prompting for credentials.
 * @method login
 * @param {Object} loginOpts Setup information about the desired network.
 *   keys used by this provider include
 *   agent - The user agent to expose on the network
 *   url - The url of the client connecting
 *   version - The version of the client.
 *   network - A string used to differentiate this provider in events.
 */
EmailSocialProvider.prototype.login = function(loginOpts, continuation) {
  console.log("FOO?");
  console.log(this);
  console.log(this.connect);
  if (loginOpts) {
    this.loginOpts = loginOpts;
  }

  if (!this.credentials) {
    if (this.view) {
      this.view.close();
    }
    this.view = freedom['core.view']();
    this.view.once('message', this.onCredentials.bind(this, continuation));
    this.view.on('message', this.view.close.bind(this.view));
    this.view.show('email-login');
    return;
  }
  console.log("BINGO");
  /*  if (!this.client) {
   this.initializeState();
   }*/
  this.connect(continuation);
};
