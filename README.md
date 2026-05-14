🛠️ Instructions d’installation et de lancement du projet


---

🟢 Ouvrir XAMPP

Lancez l’application XAMPP, puis cliquez sur :

▶️ Start pour Apache

▶️ Start pour MySQL



---

📦 Extraire le fichier ZIP

Après avoir extrait le fichier .zip, ouvrez le dossier du projet.


---

💻 Ouvrir PowerShell dans le dossier

Dans le dossier du projet, faites clic droit + Shift, puis sélectionnez :
👉 Ouvrir PowerShell ici


---

⚙️ Lancer le backend

Dans PowerShell, tapez la commande suivante :

cd backend
C:\xampp\php\php.exe artisan serve


---

✅ Vérification du backend

Si vous voyez un message similaire à :

Starting Laravel development server: http://127.0.0.1:8000

✔️ cela signifie que le serveur backend fonctionne correctement.


---

🌐 Lancer le frontend

Ouvrez ensuite un nouvel Invite de commandes (CMD) dans le dossier du projet, puis tapez :

cd frontend
npm run dev -- --port 3000
