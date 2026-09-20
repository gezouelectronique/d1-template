export function renderHtml(content: string) {
	return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sterling Abonnés</title>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sterling Abonnés" />
        <meta
          name="description"
          content="Application installable de gestion des abonnés Sterling."
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>
    
      <body>
        <header>
          <img
            src="https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/30e0d3f6-6076-40f8-7abb-8a7676f83c00/public"
          />
          <h1>📱 Sterling Abonnés</h1>
          <p>Installez cette application sur votre téléphone depuis le navigateur.</p>
        </header>
        <main>
          <section>
            <h2>Installation sur téléphone</h2>
            <p>
              Android&nbsp;: ouvrez le menu du navigateur puis choisissez
              <strong>Installer l'application</strong> ou
              <strong>Ajouter à l'écran d'accueil</strong>.
            </p>
            <p>
              iPhone&nbsp;: utilisez le bouton <strong>Partager</strong> dans Safari puis
              <strong>Sur l'écran d'accueil</strong>.
            </p>
          </section>
          <section>
            <h2>Données de démonstration</h2>
            <p>Votre base D1 contient actuellement les données suivantes&nbsp;:</p>
          </section>
          <pre><code><span style="color: #0E838F">&gt; </span>SELECT * FROM comments LIMIT 3;<br>${content}</code></pre>
          <small class="blue">
            <a target="_blank" href="https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/">Build a comments API with Workers and D1</a>
          </small>
        </main>
        <script>
          if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
              navigator.serviceWorker.register("/sw.js").catch(() => {});
            });
          }
        </script>
      </body>
    </html>
`;
}
