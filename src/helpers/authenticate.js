const vscode = require("vscode");
const express = require("express");
const { TokenManager } = require("./TokenManager.js");

const authenticate = (fn) => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.get(`/auth/:token/:isSubscribed`, async (req, res) => {
    const {token , isSusbcribed} = req.params;

    if (!token) {
      res.send(`<h1>Something went wrong</h1>`);
      return;
    }

    await TokenManager.setToken(token);
    await TokenManager.setSubscribed(isSusbcribed)
    fn();

    res.send(`<h1>Authentication was successful, you can close this now </h1>
      <h2>${decodedToken} and ${decodedIsSubscribed}</h2>
      `);

    server.close();
  });

  const server = app.listen(54321, (err) => {
    if (err) {
      vscode.window.showErrorMessage(err.message);
    } else {
      vscode.env.openExternal(vscode.Uri.parse(`http:///localhost:3001/signin/vscode`));
    }
  });
};

module.exports = { authenticate };