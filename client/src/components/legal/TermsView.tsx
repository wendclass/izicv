import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, Scale, AlertCircle } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack }) => {
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
            <Scale className="w-3.5 h-3.5" />
            Cadre d'utilisation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dernière mise à jour : 6 novembre 2026 • Application : <strong>iziCV</strong> (éditée par Class S, wendclass.com)
          </p>
        </header>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 shrink-0" />
            1. Objet et Présentation du Service
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            L'application <strong>iziCV</strong> est un outil en ligne intuitif conçu pour faciliter la rédaction, la mise en page et l'exportation de curriculum vitae (CV) professionnels. L'outil offre une expérience fluide sur smartphone et ordinateur, permettant de générer des documents PDF vectoriels nets, prêts à l'emploi pour les candidatures professionnelles, sans aucun filigrane imposé sur le rendu final.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            2. Accès et Gratuité
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            L'accès à la création et à l'exportation de CV est gratuit. L'utilisateur peut utiliser le service en mode découverte sans création de compte, ou connecter son compte Google personnel pour bénéficier de la synchronisation sécurisée et automatique de ses CV dans son propre espace Google Drive.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            3. Propriété Intellectuelle et Droits sur le Contenu
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              <strong>Contenu de l'utilisateur :</strong> L'utilisateur conserve l'intégralité de la propriété intellectuelle et des droits sur l'ensemble des textes, descriptions, coordonnées, compétences et photographies qu'il saisit dans l'outil. iziCV ne revendique aucun droit de propriété sur le contenu de vos CV.
            </p>
            <p>
              <strong>Structure et Design :</strong> Les templates de mise en page, l'interface graphique, les éléments de code, logos et la marque iziCV sont la propriété exclusive de Class S.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-teal-600 shrink-0" />
            4. Responsabilités de l'Utilisateur
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>L'utilisateur s'engage à :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Renseigner des informations véridiques, sincères et exactes dans ses démarches de recrutement.</li>
              <li>Ne pas utiliser le service pour diffuser des contenus illicites, diffamatoires ou portant atteinte aux droits de tiers.</li>
              <li>Prendre les mesures nécessaires pour sauvegarder régulièrement ses documents importants via l'exportation PDF ou la synchronisation Google Drive.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-600 shrink-0" />
            5. Garantie et Disponibilité
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Le service est fourni « en l'état ». Bien que nous mettions tout en œuvre pour garantir une disponibilité continue et une compatibilité maximale des exports PDF avec les systèmes de recrutement (ATS), iziCV ne peut être tenu responsable d'éventuelles interruptions temporaires de service, de pertes de données locales ou de l'issue des processus de recrutement engagés par l'utilisateur.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pb-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 shrink-0" />
            6. Éditeur du Service et Contact
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Le service iziCV est édité par l'entité <strong>Class S</strong>.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1">
            <p><strong>Éditeur :</strong> Class S</p>
            <p><strong>Site internet officiel :</strong> <a href="https://wendclass.com" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-semibold">wendclass.com</a></p>
            <p><strong>Contact :</strong> contact@wendclass.com</p>
          </div>
        </section>
      </article>
    </div>
  );
};
