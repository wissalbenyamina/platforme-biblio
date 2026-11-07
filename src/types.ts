export type Role = 'adherent' | 'bibliothecaire';

export type RetardStatus = 'BLEU' | 'JAUNE' | 'ROUGE';

export interface Adherent {
  id: string;
  email: string;
  nom: string;
  numero_carte: string; // Ex: CNE ou code carte unique USMBA
  filiere: string;
  role: Role;
  created_at?: string;
}

export interface Oeuvre {
  id: string;
  isbn: string;
  titre: string;
  auteur: string;
  categorie: string;
  couverture_url: string;
  description?: string;
  disponibles_count?: number;
  total_exemplaires?: number;
}

export interface Exemplaire {
  id: string;
  oeuvre_id: string;
  cote: string; // Ex: USMBA-FST-INF-042
  disponible: boolean;
}

export interface Emprunt {
  id: string;
  adherent_id: string;
  adherent_nom?: string;
  adherent_numero_carte?: string;
  exemplaire_id: string;
  oeuvre_id?: string;
  oeuvre_titre?: string;
  oeuvre_isbn?: string;
  oeuvre_couverture?: string;
  date_emprunt: string; // YYYY-MM-DD
  date_retour_prevue: string; // YYYY-MM-DD (15 jours après emprunt)
  date_retour: string | null; // NULL si en cours
  // Champs calculés par la vue SQL:
  jours_retard?: number;
  statut_retard?: RetardStatus;
}

export interface StatsRetard {
  bleus: number;
  jaunes: number;
  rouges: number;
  total: number;
}
