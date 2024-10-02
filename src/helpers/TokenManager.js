const KEY = "syntaxSnippToken";

class TokenManager {
  static globalState;

  static setToken(token) {
    return this.globalState.update(KEY, token);
  }

  static getToken() {
    return this.globalState.get(KEY);
  }

  static removeToken() {
    return this.globalState.update(KEY , null);
  }
}

module.exports = { TokenManager };