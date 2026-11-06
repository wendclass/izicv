# iziCV — Créateur de CV Professionnel

**iziCV** est une application web moderne, simple et rapide permettant à n'importe quel utilisateur de créer, personnaliser et exporter un CV de qualité professionnelle au format PDF en quelques minutes, sans aucune compétence en design.

---

## ✨ Fonctionnalités Clés

1. **🔐 Authentification & Espace Personnel Multi-utilisateurs**
   - Inscription et Connexion par email / mot de passe avec sécurité JWT.
   - Mode Découverte instantané (sans inscription obligatoire).
   - Gestion multi-CV : création, modification, duplication, renommage et suppression.

2. **🎨 2 Modèles Professionnels & Évolutifs**
   - **Modèle 1 (Moderne Structuré)** : Mise en page à deux colonnes avec bandeau latéral coloré (photo, coordonnées, compétences visuelles, langues) et parcours professionnel fluide.
   - **Modèle 2 (Minimaliste Épuré)** : Mise en page sur une seule colonne fluide, avec typographie raffinée et séparateurs d'accent subtils.
   - Bascule instantanée entre modèles sans perte des données saisies.
   - Architecture modulaire permettant d'ajouter facilement de futurs modèles via le registre de templates.

3. **🌈 Personnalisation en Temps Réel**
   - Palette de 10 teintes professionnelles prédéfinies + sélecteur de couleur libre (HEX).
   - Choix de typographies (Inter, Plus Jakarta Sans, Montserrat, Merriweather).
   - Mise à jour instantanée du rendu A4.

4. **📝 Formulaire Modulaire & Guidé (100% Français)**
   - **Informations personnelles** (contact, réseaux, titre).
   - **Photo de profil** (upload, zoom réglable 1x à 2.5x, recadrage, suppression).
   - **Profil / Résumé** avec conseils et suggestions de phrases d'accroche.
   - **Expériences professionnelles** (duplication, réorganisation monter/descendre, insertion de puces).
   - **Formations & Diplômes**.
   - **Compétences** catégorisées avec notation 1 à 5.
   - **Langues** avec niveaux CECRL (A1 à C2 / Maternelle).
   - **Certifications & Distinctions**.
   - **Centres d'intérêt** (tags).
   - **Références professionnelles**.
   - **Sections personnalisées** avec titre et éléments libres.
   - **Masquage / Affichage** de n'importe quelle section en un clic.
   - **Réorganisation de l'ordre d'affichage des sections**.

5. **⚡ Sauvegarde Automatique & Aperçu en Direct**
   - Sauvegarde continue (débouncée) avec indicateur de statut.
   - Rendu A4 fidèle avec contrôles de zoom interactifs.

6. **📄 Export PDF Haute Fidélité & Neutre**
   - Exportation immédiate au format PDF haute résolution A4.
   - **0 marque / 0 filigrane iziCV** sur le document final exporté.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v18+)
- npm

### Installation & Lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Compiler l'application (client + serveur)
npm run build

# 3. Lancer le serveur de production
npm start
```

L'application est immédiatement accessible sur **http://localhost:5000**.

### Mode Développement (Hot Reload)

```bash
npm run dev
```

---

## 📂 Structure du Code

- `client/` : Application React 18 + Vite + Tailwind CSS + TypeScript
  - `src/components/` : Composants UI réutilisables, formulaires modulaires, dashboard et éditeur
  - `src/templates/` : Modèles de CV professionnels (`ModernSidebarTemplate`, `MinimalistCleanTemplate`)
  - `src/services/` : Client API et moteur d'export PDF vectoriel
- `server/` : Backend Node.js + Express + TypeScript
  - `src/db.ts` : Base de données JSON persistante et zéro dépendance native
  - `src/routes/` : Routes d'authentification et gestion CRUD des CVs
