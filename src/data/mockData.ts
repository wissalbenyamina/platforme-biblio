import { Adherent, Oeuvre, Exemplaire, Emprunt } from '../types';

export const INITIAL_ADHERENTS: Adherent[] = [
  {
    id: 'adh-001',
    email: 'wissal.benyamina@usmba.ac.ma',
    nom: 'Wissal Benyamina',
    numero_carte: 'N134089241',
    filiere: 'FST Fès - Master IA & Big Data',
    role: 'adherent',
    created_at: '2026-09-15T08:00:00Z',
  },
  {
    id: 'adh-002',
    email: 'karim.elamrani@usmba.ac.ma',
    nom: 'Karim El Amrani',
    numero_carte: 'S142098112',
    filiere: 'FSJES Fès - Licence Économie & Gestion',
    role: 'adherent',
    created_at: '2026-09-18T10:30:00Z',
  },
  {
    id: 'adh-003',
    email: 'sarah.idrissi@usmba.ac.ma',
    nom: 'Sarah Idrissi',
    numero_carte: 'F130045239',
    filiere: 'FMP Fès - 3ème Année Médecine',
    role: 'adherent',
    created_at: '2026-10-01T14:15:00Z',
  },
  {
    id: 'biblio-001',
    email: 'biblio.centrale@usmba.ac.ma',
    nom: 'Dr. Fatima Zahra Alami',
    numero_carte: 'BIB-USMBA-01',
    filiere: 'Bibliothèque Centrale USMBA',
    role: 'bibliothecaire',
    created_at: '2025-01-10T09:00:00Z',
  },
];

export const INITIAL_OEUVRES: Oeuvre[] = [
  {
    id: 'o-1',
    isbn: '978-2100825424',
    titre: 'Algorithmique & Structures de Données',
    auteur: 'Thomas H. Cormen, Charles E. Leiserson',
    categorie: 'Informatique & IA',
    couverture_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=80',
    description: 'Le manuel de référence mondiale pour la conception et l’analyse des algorithmes fondamentaux. Recommandé pour les cursus FST et ENSA Fès.',
    disponibles_count: 3,
    total_exemplaires: 4,
  },
  {
    id: 'o-2',
    isbn: '978-2100790890',
    titre: 'Deep Learning avec Python & Keras',
    auteur: 'François Chollet',
    categorie: 'Informatique & IA',
    couverture_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    description: 'Guide pratique écrit par le créateur de Keras pour maîtriser les réseaux de neurones profonds, la vision par ordinateur et le traitement du langage naturel.',
    disponibles_count: 1,
    total_exemplaires: 2,
  },
  {
    id: 'o-3',
    isbn: '978-2807328570',
    titre: 'Physique Quantique : Fondements & Applications',
    auteur: 'Michel Le Bellac',
    categorie: 'Sciences Exactes',
    couverture_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=80',
    description: 'Introduction rigoureuse aux concepts fondamentaux de la mécanique quantique, avec exercices corrigés et applications modernes en optique et calcul quantique.',
    disponibles_count: 2,
    total_exemplaires: 3,
  },
  {
    id: 'o-4',
    isbn: '978-2247214693',
    titre: 'Droit des Affaires au Maroc',
    auteur: 'Ahmed Bensouda',
    categorie: 'Droit & Économie',
    couverture_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
    description: 'Analyse synthétique du cadre juridique régissant les sociétés commerciales, les contrats et les litiges économiques dans le contexte marocain.',
    disponibles_count: 0,
    total_exemplaires: 2,
  },
  {
    id: 'o-5',
    isbn: '978-2294767852',
    titre: 'Atlas d’Anatomie Humaine',
    auteur: 'Frank H. Netter',
    categorie: 'Médecine & Santé',
    couverture_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
    description: 'Les planches anatomiques de référence universelle pour la Faculté de Médecine et de Pharmacie de Fès.',
    disponibles_count: 2,
    total_exemplaires: 2,
  },
  {
    id: 'o-6',
    isbn: '978-2070360024',
    titre: 'Histoire du Maroc et Patrimoine de Fès',
    auteur: 'Abdelahad Sebti',
    categorie: 'Lettres & Histoire',
    couverture_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80',
    description: 'Étude historique et sociale consacrée au rayonnement intellectuel de l’Université Al Quaraouiyine et à l’histoire de Fès.',
    disponibles_count: 1,
    total_exemplaires: 1,
  },
  {
    id: 'o-7',
    isbn: '978-2100812345',
    titre: 'Réseaux Informatiques : Notions Fondamentales',
    auteur: 'Andrew S. Tanenbaum, David J. Wetherall',
    categorie: 'Informatique & IA',
    couverture_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80',
    description: 'Les couches OSI, protocoles TCP/IP, routage, sans-fil et cybersécurité expliqués en détail.',
    disponibles_count: 2,
    total_exemplaires: 3,
  },
  {
    id: 'o-8',
    isbn: '978-2 Dunod0982',
    titre: 'Macroéconomie Moderne',
    auteur: 'Olivier Blanchard, Daniel Cohen',
    categorie: 'Droit & Économie',
    couverture_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80',
    description: 'Comprendre l’inflation, le chômage, la politique monétaire et la croissance économique globale.',
    disponibles_count: 1,
    total_exemplaires: 2,
  },
  {
    id: 'o-9',
    isbn: '978-2294711223',
    titre: 'Pharmacologie Clinique et Thérapeutique',
    auteur: 'Patrice Queneau',
    categorie: 'Médecine & Santé',
    couverture_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    description: 'Guide exhaustif des interactions médicamenteuses et stratégies thérapeutiques.',
    disponibles_count: 0,
    total_exemplaires: 1,
  },
  {
    id: 'o-10',
    isbn: '978-2807312345',
    titre: 'Algèbre Linéaire et Applications',
    auteur: 'David C. Lay',
    categorie: 'Sciences Exactes',
    couverture_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80',
    description: 'Espaces vectoriels, matrices, valeurs propres et diagonalisation pour ingénieurs et scientifiques.',
    disponibles_count: 3,
    total_exemplaires: 3,
  },
];

export const INITIAL_EXEMPLAIRES: Exemplaire[] = [
  { id: 'ex-101', oeuvre_id: 'o-1', cote: 'USMBA-FST-INF-001', disponible: true },
  { id: 'ex-102', oeuvre_id: 'o-1', cote: 'USMBA-FST-INF-002', disponible: true },
  { id: 'ex-103', oeuvre_id: 'o-1', cote: 'USMBA-FST-INF-003', disponible: true },
  { id: 'ex-104', oeuvre_id: 'o-1', cote: 'USMBA-FST-INF-004', disponible: false },

  { id: 'ex-201', oeuvre_id: 'o-2', cote: 'USMBA-FST-INF-010', disponible: true },
  { id: 'ex-202', oeuvre_id: 'o-2', cote: 'USMBA-FST-INF-011', disponible: false },

  { id: 'ex-301', oeuvre_id: 'o-3', cote: 'USMBA-FST-PHY-001', disponible: true },
  { id: 'ex-302', oeuvre_id: 'o-3', cote: 'USMBA-FST-PHY-002', disponible: true },
  { id: 'ex-303', oeuvre_id: 'o-3', cote: 'USMBA-FST-PHY-003', disponible: false },

  { id: 'ex-401', oeuvre_id: 'o-4', cote: 'USMBA-FSJES-DRT-001', disponible: false },
  { id: 'ex-402', oeuvre_id: 'o-4', cote: 'USMBA-FSJES-DRT-002', disponible: false },

  { id: 'ex-501', oeuvre_id: 'o-5', cote: 'USMBA-FMP-MED-001', disponible: true },
  { id: 'ex-502', oeuvre_id: 'o-5', cote: 'USMBA-FMP-MED-002', disponible: true },

  { id: 'ex-601', oeuvre_id: 'o-6', cote: 'USMBA-FLSH-HIS-001', disponible: true },
];

// Helper to format ISO dates
const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
};

// Initial emprunts demonstrating BLEU, JAUNE and ROUGE
export const INITIAL_EMPRUNTS: Emprunt[] = [
  {
    id: 'emp-001',
    adherent_id: 'adh-001', // Wissal Benyamina
    adherent_nom: 'Wissal Benyamina',
    adherent_numero_carte: 'N134089241',
    exemplaire_id: 'ex-104',
    oeuvre_id: 'o-1',
    oeuvre_titre: 'Algorithmique & Structures de Données',
    oeuvre_isbn: '978-2100825424',
    oeuvre_couverture: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=80',
    date_emprunt: formatDate(addDays(today, -8)),
    date_retour_prevue: formatDate(addDays(today, 7)), // BLEU: 7 jours restants
    date_retour: null,
  },
  {
    id: 'emp-002',
    adherent_id: 'adh-001', // Wissal Benyamina
    adherent_nom: 'Wissal Benyamina',
    adherent_numero_carte: 'N134089241',
    exemplaire_id: 'ex-202',
    oeuvre_id: 'o-2',
    oeuvre_titre: 'Deep Learning avec Python & Keras',
    oeuvre_isbn: '978-2100790890',
    oeuvre_couverture: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    date_emprunt: formatDate(addDays(today, -19)),
    date_retour_prevue: formatDate(addDays(today, -4)), // JAUNE: 4 jours de retard
    date_retour: null,
  },
  {
    id: 'emp-003',
    adherent_id: 'adh-002', // Karim El Amrani
    adherent_nom: 'Karim El Amrani',
    adherent_numero_carte: 'S142098112',
    exemplaire_id: 'ex-401',
    oeuvre_id: 'o-4',
    oeuvre_titre: 'Droit des Affaires au Maroc',
    oeuvre_isbn: '978-2247214693',
    oeuvre_couverture: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80',
    date_emprunt: formatDate(addDays(today, -26)),
    date_retour_prevue: formatDate(addDays(today, -11)), // ROUGE: 11 jours de retard (> 7j)
    date_retour: null,
  },
  {
    id: 'emp-004',
    adherent_id: 'adh-003', // Sarah Idrissi
    adherent_nom: 'Sarah Idrissi',
    adherent_numero_carte: 'F130045239',
    exemplaire_id: 'ex-303',
    oeuvre_id: 'o-3',
    oeuvre_titre: 'Physique Quantique : Fondements & Applications',
    oeuvre_isbn: '978-2807328570',
    oeuvre_couverture: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=80',
    date_emprunt: formatDate(addDays(today, -6)),
    date_retour_prevue: formatDate(addDays(today, 9)), // BLEU: 9 jours restants
    date_retour: null,
  },
];

// Helper to compute retard status identical to the SQL VIEW
export function computeRetardStatus(dateRetourPrevueStr: string, dateRetourStr: string | null): {
  statut: 'BLEU' | 'JAUNE' | 'ROUGE' | 'RETOURNE';
  joursDiff: number;
} {
  if (dateRetourStr) {
    return { statut: 'RETOURNE', joursDiff: 0 };
  }
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const prevue = new Date(dateRetourPrevueStr);
  prevue.setHours(0, 0, 0, 0);

  const diffMs = now.getTime() - prevue.getTime();
  const joursRetard = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (joursRetard <= 0) {
    return { statut: 'BLEU', joursDiff: Math.abs(joursRetard) };
  } else if (joursRetard <= 7) {
    return { statut: 'JAUNE', joursDiff: joursRetard };
  } else {
    return { statut: 'ROUGE', joursDiff: joursRetard };
  }
}
