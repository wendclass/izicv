import React from 'react';
import { ArrowLeft, Shield, Lock, EyeOff, HardDrive, CheckCircle2, ExternalLink } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'application
        </button>
      </div>

      {/* Main card */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8">
        {/* Header */}
        <header className="space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Confidentialité et Données personnelles
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Règles de Confidentialité
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dernière mise à jour : 6 novembre 2026 • Application : <strong>iziCV</strong> (éditée par Class S, wendclass.com)
          </p>
        </header>

        {/* Intro Highlight */}
        <section className="bg-slate-50 border-l-4 border-teal-500 p-4 sm:p-5 rounded-r-xl space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            Notre engagement fondamental : Vos données vous appartiennent
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            iziCV est conçu selon le principe de la <strong>souveraineté des données</strong>. Vos CV, coordonnées, parcours professionnels et photos ne sont stockés sur aucun serveur tiers ou base de données commerciale gérée par iziCV. Vos données sont conservées soit <strong>localement dans votre navigateur</strong>, soit directement sur votre <strong>Google Drive personnel</strong> si vous choisissez de synchroniser votre compte.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            1. Informations collectées et traitées
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Pour permettre la conception, la prévisualisation et l'exportation de votre CV, iziCV traite uniquement les informations que vous saisissez volontairement dans les formulaires :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>État civil et coordonnées (nom, prénom, e-mail, téléphone, ville, titre professionnel).</li>
              <li>Profil et parcours (expériences professionnelles, formations, compétences, langues, centres d'intérêt).</li>
              <li>Photo de profil (si vous choisissez d'en ajouter une, elle reste stockée localement ou sur votre Drive).</li>
            </ul>
          </div>
        </section>

        {/* Section 2 - Google Drive */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-teal-600 shrink-0" />
            2. Utilisation des données de l'API Google (Google Drive)
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Lorsque vous activez la connexion avec Google, iziCV sollicite l'autorisation minimale restreinte :
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-800 font-mono text-[11px] ml-1">
                https://www.googleapis.com/auth/drive.file
              </code>
            </p>
            <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-teal-950">
              <p className="font-semibold">Portée et limitations strictes :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Fichiers dédiés uniquement :</strong> L'application a accès exclusivement aux fichiers et au dossier <code className="font-bold">iziCV</code> qu'elle a elle-même créés sur votre Drive.
                </li>
                <li>
                  <strong>Aucun accès à vos autres fichiers :</strong> iziCV n'a techniquement aucun moyen de lire, modifier ou consulter le reste de vos documents, photos ou dossiers personnels présents sur votre Google Drive.
                </li>
                <li>
                  <strong>Zéro partage commercial :</strong> Les données reçues de l'API Google ne sont jamais vendues, louées, partagées avec des tiers, ni utilisées pour entraîner des modèles d'intelligence artificielle ou diffuser de la publicité ciblée.
                </li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 italic pt-1">
              L'utilisation des informations reçues des API Google par iziCV respecte strictement les{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 underline font-medium inline-flex items-center gap-0.5"
              >
                Règles de confidentialité relatives aux données utilisateur des services d'API Google
                <ExternalLink className="w-3 h-3" />
              </a>
              , y compris les exigences d'utilisation limitée.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-teal-600 shrink-0" />
            3. Absence de traceurs et cookies publicitaires
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            iziCV n'utilise aucun cookie publicitaire ni traceur commercial tiers. Nous utilisons uniquement le stockage local de votre navigateur (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">localStorage</code>) pour conserver vos préférences de langue, de thème et votre brouillon de CV entre deux visites sans nécessiter de serveur de session externe.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600 shrink-0" />
            4. Révocation des autorisations et suppression
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Vous conservez à tout moment le contrôle total de vos données :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Suppression locale :</strong> Vous pouvez supprimer n'importe quel CV depuis le tableau de bord ou en vidant les données de votre navigateur.
              </li>
              <li>
                <strong>Suppression Google Drive :</strong> Vous pouvez supprimer le dossier <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">iziCV</code> directement depuis votre interface Google Drive à tout instant.
              </li>
              <li>
                <strong>Révocation de l'accès Google :</strong> Vous pouvez déconnecter l'application immédiatement depuis la page de gestion des autorisations de votre compte Google :{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 underline font-medium inline-flex items-center gap-0.5"
                >
                  myaccount.google.com/permissions
                  <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600 shrink-0" />
            5. Contact et Éditeur
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pour toute question relative à ces règles de confidentialité ou pour exercer vos droits, vous pouvez contacter l'éditeur du service :
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1">
            <p><strong>Éditeur :</strong> Class S</p>
            <p><strong>Site officiel :</strong> <a href="https://wendclass.com" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-semibold">wendclass.com</a></p>
            <p><strong>Contact :</strong> support@wendclass.com</p>
          </div>
        </section>
      </article>
    </div>
  );
};
