const KEY = "syntaxSnippToken";
const SUBSCRIBED = "subscription"

class TokenManager {
  static globalState;

  static setToken(token) {
    return this.globalState.update(KEY, token);
  }

  static getToken() {
    return this.globalState.get(KEY);
  }

  static removeToken() {
    return this.globalState.update(KEY, null);
  }

  static getSubscribed() {
    return this.globalState.update(SUBSCRIBED);
  }

  static setSubscribed(isSubscribed) {
    return this.globalState.update(SUBSCRIBED, isSubscribed);
  }

  static removeSubscribed() {
    return this.globalState.update(SUBSCRIBED, null);
  }
}

module.exports = { TokenManager };