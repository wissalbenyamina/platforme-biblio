-- ============================================================================
-- BIBLIO USMBA - SCRIPT SQL POSTGRESQL / SUPABASE
-- Université Sidi Mohamed Ben Abdellah - Fès
-- Tables minimales, règle stricte @usmba.ac.ma, vue des retards (BLEU/JAUNE/ROUGE),
-- Row Level Security (RLS) et index d'optimisation.
-- ============================================================================

-- 0. EXTENSIONS NÉCESSAIRES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES PRINCIPALES (MINIMALES)
-- ============================================================================

-- 1.1 Table des adhérents (étudiants et bibliothécaires)
-- Liée directement à auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.adherents (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    numero_carte TEXT NOT NULL UNIQUE, -- Numéro d'étudiant / CNE unique
    filiere TEXT NOT NULL,             -- Ex: Licence SMI, Master Big Data, Doctorat
    role TEXT NOT NULL DEFAULT 'adherent' CHECK (role IN ('adherent', 'bibliothecaire')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Règle d'intégrité au niveau colonne : domaine institutionnel USMBA obligatoire
    CONSTRAINT check_usmba_email CHECK (email LIKE '%@usmba.ac.ma')
);

-- 1.2 Table des œuvres (catalogue de livres)
CREATE TABLE IF NOT EXISTS public.oeuvres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn TEXT NOT NULL UNIQUE,
    titre TEXT NOT NULL,
    auteur TEXT NOT NULL,
    categorie TEXT NOT NULL,
    couverture_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.3 Table des exemplaires physiques
CREATE TABLE IF NOT EXISTS public.exemplaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oeuvre_id UUID NOT NULL REFERENCES public.oeuvres(id) ON DELETE CASCADE,
    cote TEXT NOT NULL UNIQUE, -- Ex: USMBA-FST-INF-001
    disponible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.4 Table des emprunts
CREATE TABLE IF NOT EXISTS public.emprunts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adherent_id UUID NOT NULL REFERENCES public.adherents(id) ON DELETE CASCADE,
    exemplaire_id UUID NOT NULL REFERENCES public.exemplaires(id) ON DELETE RESTRICT,
    date_emprunt DATE NOT NULL DEFAULT CURRENT_DATE,
    date_retour_prevue DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    date_retour DATE DEFAULT NULL, -- NULL tant que le livre n'est pas rendu
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. VÉRIFICATION DU DOMAINE @usmba.ac.ma CÔTÉ SERVEUR (TRIGGER SUPABASE AUTH)
-- ============================================================================

-- Fonction déclenchée AVANT insertion dans auth.users
-- Bloque immédiatement toute tentative d'inscription hors domaine USMBA
CREATE OR REPLACE FUNCTION public.check_user_domain_usmba()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
    -- Refuse tout email qui ne se termine pas strictement par @usmba.ac.ma
    IF NEW.email IS NULL OR NOT (NEW.email ILIKE '%@usmba.ac.ma') THEN
        RAISE EXCEPTION 'Accès refusé : Seules les adresses institutionnelles se terminant par @usmba.ac.ma sont autorisées.'
            USING ERRCODE = '23514'; -- check_violation
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger sur auth.users (Supabase)
DROP TRIGGER IF EXISTS on_auth_user_domain_check ON auth.users;
CREATE TRIGGER on_auth_user_domain_check
    BEFORE INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_domain_usmba();

-- ============================================================================
-- 3. RÈGLE D'AFFAIRES : MAXIMUM 3 LIVRES PAR ADHÉRENT & GESTION DISPONIBILITÉ
-- ============================================================================

-- Vérifier la limite de 3 emprunts actifs avant d'enregistrer un nouvel emprunt
CREATE OR REPLACE FUNCTION public.verifier_limite_emprunts()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
DECLARE
    emprunts_actifs INTEGER;
    est_disponible BOOLEAN;
BEGIN
    -- Compter les emprunts non retournés pour cet adhérent
    SELECT COUNT(*) INTO emprunts_actifs
    FROM public.emprunts
    WHERE adherent_id = NEW.adherent_id AND date_retour IS NULL;

    IF emprunts_actifs >= 3 THEN
        RAISE EXCEPTION 'Limite atteinte : Un adhérent ne peut pas emprunter plus de 3 livres simultanément.'
            USING ERRCODE = '22000';
    END IF;

    -- Vérifier que l'exemplaire est bien disponible
    SELECT disponible INTO est_disponible
    FROM public.exemplaires
    WHERE id = NEW.exemplaire_id;

    IF est_disponible IS NOT TRUE THEN
        RAISE EXCEPTION 'Exemplaire indisponible : Ce livre est actuellement déjà emprunté.'
            USING ERRCODE = '22000';
    END IF;

    -- Marquer l'exemplaire comme indisponible
    UPDATE public.exemplaires
    SET disponible = false
    WHERE id = NEW.exemplaire_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verifier_emprunt ON public.emprunts;
CREATE TRIGGER trg_verifier_emprunt
    BEFORE INSERT ON public.emprunts
    FOR EACH ROW
    EXECUTE FUNCTION public.verifier_limite_emprunts();

-- Remettre l'exemplaire disponible lors du retour
CREATE OR REPLACE FUNCTION public.gerer_retour_emprunt()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
    IF OLD.date_retour IS NULL AND NEW.date_retour IS NOT NULL THEN
        UPDATE public.exemplaires
        SET disponible = true
        WHERE id = NEW.exemplaire_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gerer_retour ON public.emprunts;
CREATE TRIGGER trg_gerer_retour
    AFTER UPDATE OF date_retour ON public.emprunts
    FOR EACH ROW
    EXECUTE FUNCTION public.gerer_retour_emprunt();

-- ============================================================================
-- 4. VUE DU SUIVI DES RETARDS (CALCUL DYNAMIQUE EN SQL, JAMAIS STOCKÉ)
-- ============================================================================
-- BLEU  : Pas en retard (CURRENT_DATE <= date_retour_prevue)
-- JAUNE : Petit retard (1 à 7 jours de retard)
-- ROUGE : Grand retard (plus de 7 jours de retard)
CREATE OR REPLACE VIEW public.vue_emprunts_retards AS
SELECT 
    e.id AS emprunt_id,
    e.adherent_id,
    a.nom AS adherent_nom,
    a.email AS adherent_email,
    a.numero_carte AS adherent_numero_carte,
    a.filiere AS adherent_filiere,
    e.exemplaire_id,
    ex.cote AS exemplaire_cote,
    o.id AS oeuvre_id,
    o.isbn AS oeuvre_isbn,
    o.titre AS oeuvre_titre,
    o.auteur AS oeuvre_auteur,
    o.categorie AS oeuvre_categorie,
    o.couverture_url AS oeuvre_couverture,
    e.date_emprunt,
    e.date_retour_prevue,
    e.date_retour,
    (CURRENT_DATE - e.date_retour_prevue) AS jours_depassement,
    CASE 
        WHEN e.date_retour IS NOT NULL THEN 'RETOURNE'
        WHEN CURRENT_DATE <= e.date_retour_prevue THEN 'BLEU'
        WHEN CURRENT_DATE <= (e.date_retour_prevue + INTERVAL '7 days')::DATE THEN 'JAUNE'
        ELSE 'ROUGE'
    END AS statut_retard,
    -- Priorité de tri pour le tableau de bord bibliothécaire (ROUGE en 1er, puis JAUNE, puis BLEU)
    CASE 
        WHEN e.date_retour IS NOT NULL THEN 4
        WHEN CURRENT_DATE > (e.date_retour_prevue + INTERVAL '7 days')::DATE THEN 1 -- ROUGE
        WHEN CURRENT_DATE > e.date_retour_prevue THEN 2                             -- JAUNE
        ELSE 3                                                                      -- BLEU
    END AS priorite_urgence
FROM public.emprunts e
JOIN public.adherents a ON e.adherent_id = a.id
JOIN public.exemplaires ex ON e.exemplaire_id = ex.id
JOIN public.oeuvres o ON ex.oeuvre_id = o.id;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.adherents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oeuvres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exemplaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprunts ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour vérifier si l'utilisateur connecté est bibliothécaire
CREATE OR REPLACE FUNCTION public.is_bibliothecaire()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.adherents
        WHERE id = auth.uid() AND role = 'bibliothecaire'
    );
$$;

-- 5.1 Politiques pour 'adherents'
-- Un adhérent peut lire et mettre à jour son propre profil
CREATE POLICY "Adhérent peut voir son propre profil"
    ON public.adherents
    FOR SELECT
    USING (auth.uid() = id OR public.is_bibliothecaire());

CREATE POLICY "Création de compte adhérent authentifié"
    ON public.adherents
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Adhérent peut modifier son profil"
    ON public.adherents
    FOR UPDATE
    USING (auth.uid() = id OR public.is_bibliothecaire());

-- 5.2 Politiques pour 'oeuvres' et 'exemplaires'
-- Tout le monde (connecté) peut consulter le catalogue
CREATE POLICY "Lecture libre du catalogue pour les connectés"
    ON public.oeuvres
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Gestion catalogue réservée au bibliothécaire"
    ON public.oeuvres
    FOR ALL
    USING (public.is_bibliothecaire());

CREATE POLICY "Lecture des exemplaires pour les connectés"
    ON public.exemplaires
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Gestion exemplaires réservée au bibliothécaire"
    ON public.exemplaires
    FOR ALL
    USING (public.is_bibliothecaire());

-- 5.3 Politiques pour 'emprunts'
-- Règle clé : L'adhérent ne voit QUE ses propres emprunts ; le bibliothécaire voit tout.
CREATE POLICY "Consultation des emprunts selon le rôle"
    ON public.emprunts
    FOR SELECT
    USING (auth.uid() = adherent_id OR public.is_bibliothecaire());

CREATE POLICY "Enregistrement emprunts réservé au bibliothécaire"
    ON public.emprunts
    FOR INSERT
    WITH CHECK (public.is_bibliothecaire());

CREATE POLICY "Enregistrement retours réservé au bibliothécaire"
    ON public.emprunts
    FOR UPDATE
    USING (public.is_bibliothecaire());

-- ============================================================================
-- 6. INDEX D'OPTIMISATION (RAPIDITÉ & MOINS DE 30 MO)
-- ============================================================================

-- Recherche rapide par ISBN
CREATE INDEX IF NOT EXISTS idx_oeuvres_isbn ON public.oeuvres(isbn);

-- Recherche de livre par titre ou auteur (requêtes LIKE / ILIKE)
CREATE INDEX IF NOT EXISTS idx_oeuvres_titre_trgm ON public.oeuvres USING gin(titre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_oeuvres_auteur_trgm ON public.oeuvres USING gin(auteur gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_oeuvres_categorie ON public.oeuvres(categorie);

-- Index sur les adhérents (email, numéro de carte d'étudiant)
CREATE INDEX IF NOT EXISTS idx_adherents_email ON public.adherents(email);
CREATE INDEX IF NOT EXISTS idx_adherents_numero_carte ON public.adherents(numero_carte);

-- Index sur les emprunts (adherent_id pour RLS rapide et 'Mes emprunts')
CREATE INDEX IF NOT EXISTS idx_emprunts_adherent_id ON public.emprunts(adherent_id);
CREATE INDEX IF NOT EXISTS idx_emprunts_exemplaire_id ON public.emprunts(exemplaire_id);
-- Index partiel sur les emprunts actifs en cours pour le tableau de bord
CREATE INDEX IF NOT EXISTS idx_emprunts_actifs_retour ON public.emprunts(date_retour_prevue) 
    WHERE date_retour IS NULL;

-- ============================================================================
-- 7. DONNÉES DE DÉMONSTRATION (SEED USMBA)
-- ============================================================================

INSERT INTO public.oeuvres (isbn, titre, auteur, categorie, couverture_url, description)
VALUES 
('978-2100825424', 'Algorithmique et structures de données', 'Thomas Cormen', 'Informatique & IA', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=80', 'Manuel fondamental pour les étudiants en SMI / Génie Informatique de la FST de Fès.'),
('978-2100790890', 'Deep Learning avec Python et Keras', 'François Chollet', 'Informatique & IA', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80', 'Apprentissage profond appliqué aux projets de vision et traitement du langage.'),
('978-2807328570', 'Physique quantique : Fondements et applications', 'Michel Le Bellac', 'Sciences Exactes', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=80', 'Cours complet pour étudiants en Master Physique et Sciences des Matériaux.'),
('978-2247214693', 'Droit des affaires au Maroc', 'Ahmed Bensouda', 'Droit & Économie', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80', 'Ouvrage de référence pour les étudiants de la FSJES Fès.'),
('978-2294767852', 'Anatomie clinique et physiologie humaine', 'Frank H. Netter', 'Médecine & Santé', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80', 'Atlas illustré destiné aux étudiants de la Faculté de Médecine et de Pharmacie de Fès.'),
('978-2070360024', 'Histoire du Maroc médiéval', 'Abdelahad Sebti', 'Lettres & Histoire', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&auto=format&fit=crop&q=80', 'Ouvrage d''histoire pour les cursus FLSH Dhar El Mahraz.')
ON CONFLICT (isbn) DO NOTHING;
