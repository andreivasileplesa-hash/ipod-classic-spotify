# iPod + Spotify

Standalone mobile-first iPod player project. It lives in its own repository, separate from Camino de Santiago.

## Run locally

Open `index.html` in a browser to preview the interface. Spotify account login requires the published HTTPS URL.

## Publish with GitHub Pages

1. Create a new, empty GitHub repository named `ipod-classic-spotify` under `andreivasileplesa-hash`.
2. In **Settings → Pages**, set the build source to **GitHub Actions**.
3. From this folder, run `git push -u origin main`. The included workflow publishes the site at `https://andreivasileplesa-hash.github.io/ipod-classic-spotify/`.
4. In the Spotify Developer Dashboard, create a Spotify app and add `https://andreivasileplesa-hash.github.io/ipod-classic-spotify/index.html` as a Redirect URI.
5. Open the published iPod, choose **Conectar cuenta**, paste the Spotify Client ID, and authorize access.

The login uses Spotify Authorization Code with PKCE and stores no client secret in the app.
