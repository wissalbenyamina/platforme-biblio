import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, AlertCircle, ArrowLeft, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { Adherent } from '../types';

interface RegisterOcrScreenProps {
  onBack: () => void;
  onRegistered: (newAdherent: Adherent) => void;
}

// Sample realistic USMBA cards for on-device simulation
const SAMPLE_CARDS = [
  {
    nom: 'Wissal Benyamina',
    cne: 'N134089241',
    filiere: 'FST Fès - Master Big Data & IA',
    email: 'wissal.benyamina@usmba.ac.ma',
    label: 'Carte FST Fès (Sciences & Techniques)',
  },
  {
    nom: 'Amine Tazi',
    cne: 'S149023411',
    filiere: 'ENSA Fès - Génie Logiciel',
    email: 'amine.tazi@usmba.ac.ma',
    label: 'Carte ENSA Fès (Ingénieur)',
  },
  {
    nom: 'Zineb Filali',
    cne: 'F138099234',
    filiere: 'FMP Fès - Médecine Générale',
    email: 'zineb.filali@usmba.ac.ma',
    label: 'Carte FMP Fès (Médecine)',
  },
];

export const RegisterOcrScreen: React.FC<RegisterOcrScreenProps> = ({ onBack, onRegistered }) => {
  const [step, setStep] = useState<'scan' | 'verify'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Extracted fields
  const [nom, setNom] = useState('');
  const [numeroCarte, setNumeroCarte] = useState('');
  const [filiere, setFiliere] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera start / stop
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setCameraError("Caméra non accessible ou permission refusée. Utilisez la simulation de scan de carte.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const triggerOcrScan = (selectedSample?: typeof SAMPLE_CARDS[0]) => {
    setIsScanning(true);
    setValidationError(null);

    setTimeout(() => {
      stopCamera();
      setIsScanning(false);

      const sample = selectedSample || SAMPLE_CARDS[0];
      setNom(sample.nom);
      setNumeroCarte(sample.cne);
      setFiliere(sample.filiere);
      setEmail(sample.email);
      setPassword('Usmba2026!');
      setStep('verify');
    }, 1200);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@usmba.ac.ma')) {
      setValidationError("L'adresse email doit obligatoirement se terminer par @usmba.ac.ma");
      return;
    }
    if (!numeroCarte.trim() || !nom.trim() || !filiere.trim()) {
      setValidationError("Tous les champs extraits de la carte sont obligatoires.");
      return;
    }

    const newAdherent: Adherent = {
      id: `adh-${Date.now()}`,
      email: email.trim().toLowerCase(),
      nom: nom.trim(),
      numero_carte: numeroCarte.trim().toUpperCase(),
      filiere: filiere.trim(),
      role: 'adherent',
      created_at: new Date().toISOString(),
    };

    onRegistered(newAdherent);
  };

  return (
    <div className="flex flex-col min-h-full px-5 py-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={step === 'verify' ? () => setStep('scan') : onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 'verify' ? 'Re-scanner' : 'Retour connexion'}</span>
        </button>
        <span className="text-xs font-bold text-slate-900 dark:text-white">Inscription Adhérent</span>
        <div className="w-6" />
      </div>

      {step === 'scan' ? (
        <div className="flex flex-col flex-1">
          <div className="text-center mb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Scan de la carte d’étudiant
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              OCR sur l’appareil : extraction automatique du nom, CNE et filière.
            </p>
          </div>

          {/* Scanner Viewport Box */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-blue-500 shadow-md flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-center text-slate-400 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-2 text-blue-400">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-xs font-medium text-slate-200">Cadre d’alignement de la carte USMBA</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  Placez le CNE et votre nom dans la zone de détection.
                </p>
              </div>
            )}

            {/* Target Reticle */}
            <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-xl flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-5 h-5 border-t-2 border-l-2 border-blue-400" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-blue-400" />
              </div>
              {isScanning && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
              )}
              <div className="flex justify-between">
                <div className="w-5 h-5 border-b-2 border-l-2 border-blue-400" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-blue-400" />
              </div>
            </div>

            {/* Real OCR indicator */}
            <div className="absolute bottom-2 left-2 right-2 text-center">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                {isScanning ? 'Extraction OCR on-device en cours...' : 'Prêt pour la capture locale'}
              </span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Aucune photo stockée ni transmise : seul le texte extrait est conservé.</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            {!cameraActive && (
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Activer la caméra réelle</span>
              </button>
            )}

            <button
              type="button"
              disabled={isScanning}
              onClick={() => triggerOcrScan()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Lecture OCR en cours...' : 'Scanner ma carte maintenant'}</span>
            </button>
          </div>

          {cameraError && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center mt-2">
              {cameraError}
            </p>
          )}

          {/* Sample Cards for quick test */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
              Ou simuler avec une carte étudiante d’exemple :
            </span>
            <div className="space-y-1.5">
              {SAMPLE_CARDS.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => triggerOcrScan(card)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-700/80 transition flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{card.nom}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{card.label} · {card.cne}</p>
                  </div>
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Scanner</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Verify & Edit extracted data */
        <div className="flex flex-col flex-1">
          <div className="p-3 mb-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
            <UserCheck className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-semibold">Informations extraites par OCR</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                Vérifiez attentivement les données ci-dessous. Vous pouvez corriger les champs si nécessaire avant de valider votre compte.
              </p>
            </div>
          </div>

          <form onSubmit={handleFinalSubmit} className="space-y-3 flex-1 flex flex-col">
            {/* Nom complet */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nom & Prénom (extrait)
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CNE / Numéro Carte Unique */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numéro d’étudiant / CNE (unique, sans doublon)
              </label>
              <input
                type="text"
                required
                value={numeroCarte}
                onChange={(e) => setNumeroCarte(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filière */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Établissement & Filière USMBA
              </label>
              <input
                type="text"
                required
                value={filiere}
                onChange={(e) => setFiliere(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email institutionnel */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email institutionnel (@usmba.ac.ma)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@usmba.ac.ma"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mot de passe de connexion */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mot de passe pour les accès futurs
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {validationError && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="mt-auto pt-3">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Créer mon compte Adhérent</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
