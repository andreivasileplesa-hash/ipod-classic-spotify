# iPod + Spotify

Standalone mobile-first iPod player project. It lives in its own repository, separate from Camino de Santiago.

## Controls

- The wheel center plays or pauses Spotify.
- The arrows beside the wheel skip tracks.
- Turning the wheel changes volume when Spotify reports that the active device supports remote volume.
- Spotify playback control requires Premium and an active Spotify device.

## Publish with GitHub Pages

1. Create a new, empty GitHub repository named `ipod-classic-spotify` under `andreivasileplesa-hash`.
2. In **Settings → Pages**, set the build source to **GitHub Actions**.
3. From this folder, run `git push -u origin main`. The included workflow publishes the site at `https://andreivasileplesa-hash.github.io/ipod-classic-spotify/`.

## Publish with Render

1. In Render, choose **New → Blueprint** and connect this GitHub repository.
2. Render reads `render.yaml` and publishes the static site from the repository root.
3. Copy the `onrender.com` address Render assigns to the site.
4. Add that exact address with a trailing `/` to the Spotify app's **Redirect URIs**, then save.
5. Open the Render address and connect Spotify again.

## Install on iPhone or iPad

Open the deployed Render site in Safari, tap **Share → Add to Home Screen**, enable **Open as Web App**, and tap **Add**. This creates an iPod icon and opens the site without Safari's browser chrome. Spotify still needs an internet connection.
