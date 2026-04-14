import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-procedure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.scss'],
})
export class ProcedureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  activeTab = 'overview';
  expandedFaq: number | null = null;

  procedures: Record<string, any> = {
    'liposuccion': {
      label: 'Liposuccion',
      subtitle: 'Chirurgie de Liposuccion : Elimination des Graisses et Remodelage Corporel',
      image: 'assets/images/proc/liposuccion.jpg',
      overview: "La liposuccion est une chirurgie esthetique qui consiste a eliminer les exces de graisse localises dans certaines parties du corps, notamment l'abdomen, les cuisses, les hanches, les bras, le dos et le menton.\n\nC'est une technique permettant de remodeler et de sculpter le corps en eliminant les depots graisseux resistants au regime et a l'activite physique. La liposuccion n'est pas une solution pour perdre du poids, mais elle peut, associee a une bonne hygiene de vie, aider a ameliorer significativement le contour corporel.",
      checks: [
        "Consultez votre medecin sur vos antecedents medicaux (diabete, hypertension)",
        "Arretez de fumer au moins 2 semaines avant l'intervention",
        "Arretez les anticoagulants et anti-inflammatoires selon les conseils du medecin",
        "Prevoyez un accompagnant pour le retour a domicile",
        "Preparez la liste de vos medicaments et complements alimentaires",
      ],
      risks: [
        "Saignements ou hematomes sous la peau",
        "Infection serieuse (abces ou cellulite)",
        "Accumulation de liquide (serome) necessitant un drainage",
        "Engourdissements ou douleurs temporaires dans la zone traitee",
        "Cicatrices, cheloides ou modifications de la pigmentation",
      ],
      issues: [
        "Graisses des cuisses internes et externes resistantes au sport",
        "Poignees d'amour et graisses des flancs",
        "Double menton et exces de graisse au niveau du cou",
        "Ventre rebondi malgre un regime alimentaire equilibre",
        "Bras flasques et graisses des genoux",
      ],
      dos: [
        "Verifier les certifications du chirurgien (ISAPS, JPRAS)",
        "Demander des photos avant/apres de patients reels",
        "Verifier les accreditations de la clinique",
        "Prevoir un suivi post-operatoire complet",
        "Tenir compte des lois locales sur la responsabilite medicale",
      ],
      donts: [
        "Ne pas choisir une clinique uniquement sur le prix",
        "Ne pas se fier uniquement aux reseaux sociaux ou influenceurs",
        "Ne pas ignorer les barrieres linguistiques avec le chirurgien",
        "Ne pas se precipiter sans recherche approfondie",
        "Ne pas prevoir de vol retour immediatement apres l'operation",
      ],
      faqs: [
        { q: "En quoi consiste cette procedure ?", a: "La liposuccion consiste a inserer une fine canule sous la peau pour aspirer les cellules graisseuses. Elle se realise sous anesthesie locale ou generale selon les zones traitees." },
        { q: "Qui est un bon candidat pour cette procedure ?", a: "Les meilleurs candidats sont des personnes proches de leur poids ideal, avec une bonne elasticite cutanee, mais presentant des depots graisseux localises resistants au sport et au regime." },
        { q: "Comment se preparer avant l'intervention ?", a: "Arretez de fumer, evitez l'aspirine et les anti-inflammatoires, faites les bilans sanguins demandes et suivez les instructions alimentaires de votre chirurgien." },
        { q: "Une anesthesie est-elle necessaire ?", a: "Oui, selon l'etendue de l'intervention : anesthesie locale pour les petites zones, anesthesie generale ou sedation pour les zones plus importantes." },
        { q: "Quelle est la duree de recuperation ?", a: "La plupart des patients reprennent une activite legere apres 3 a 5 jours. La recuperation complete prend 4 a 6 semaines. Le port d'une gaine de compression est recommande." },
      ],
    },
    'augmentation-mammaire': {
      label: 'Augmentation Mammaire',
      subtitle: "Chirurgie d'Augmentation Mammaire : Volume et Harmonie",
      image: 'assets/images/proc/mammaire.jpg',
      overview: "L'augmentation mammaire est une intervention chirurgicale visant a augmenter le volume et ameliorer la forme des seins grace a des implants ou a un transfert de graisse autologue.",
      checks: ["Consultation preoperatoire complete","Mammographie si necessaire","Arret du tabac 4 semaines avant"],
      risks: ["Rupture ou fuite d'implant","Contracture capsulaire","Modification de la sensibilite"],
      issues: ["Seins asymetriques","Volume insuffisant apres grossesse","Perte de volume liee a l'age"],
      dos: ["Choisir un chirurgien certifie","Discuter du type d'implant","Prevoir un suivi regulier"],
      donts: ["Ne pas allaiter sans avis medical","Ne pas faire de sport intense trop tot","Ne pas ignorer les signes d'infection"],
      faqs: [
        { q: "Combien de temps durent les implants ?", a: "Les implants modernes sont concus pour durer 10 a 20 ans, mais un suivi regulier est recommande." },
      ],
    },
    'rhinoplastie': {
      label: 'Rhinoplastie',
      subtitle: 'Rhinoplastie : Correction et Remodelage du Nez',
      image: 'assets/images/proc/rhinoplastie.jpg',
      overview: "La rhinoplastie est une chirurgie de correction et de remodelage du nez, pouvant etre realisee pour des raisons esthetiques ou fonctionnelles.",
      checks: ["Attendre la fin de la croissance (18 ans)","Bilan photographique preoperatoire","Arret du tabac"],
      risks: ["Difficultes respiratoires temporaires","Asymetrie residuelle","Cicatrices visibles"],
      issues: ["Bosse sur le dos du nez","Pointe du nez trop large ou tombante","Narines asymetriques"],
      dos: ["Choisir un chirurgien specialise en rhinoplastie","Avoir des attentes realistes","Prevoir 2 semaines d'arret de travail"],
      donts: ["Ne pas porter de lunettes pendant 6 semaines","Ne pas pratiquer de sport de contact","Ne pas s'exposer au soleil"],
      faqs: [{ q: "Quand voit-on le resultat final ?", a: "Le resultat definitif est visible apres 12 a 18 mois, une fois que tous les gonflements ont disparu." }],
    },
    'abdominoplastie': {
      label: 'Abdominoplastie',
      subtitle: 'Abdominoplastie : Ventre Plat et Peau Tendue',
      image: 'assets/images/proc/abdominoplastie.jpg',
      overview: "L'abdominoplastie retire l'exces de peau et de graisse de l'abdomen tout en resserrant les muscles de la paroi abdominale.",
      checks: ["Etre proche de son poids ideal","Ne pas envisager de grossesse future","Arret du tabac obligatoire"],
      risks: ["Cicatrice permanente","Risque de thrombose","Asymetrie abdominale"],
      issues: ["Peau relachee apres grossesse ou perte de poids","Muscles abdominaux distendus","Vergetures importantes"],
      dos: ["Maintenir un poids stable avant l'operation","Suivre le programme de recuperation","Porter la gaine de compression"],
      donts: ["Ne pas envisager de grossesse apres","Ne pas reprendre le sport trop tot","Ne pas fumer"],
      faqs: [{ q: "Quelle est la duree de l'hospitalisation ?", a: "En general 1 a 2 nuits en clinique, suivies de 2 a 4 semaines de convalescence a domicile." }],
    },
    'blepharoplastie': {
      label: 'Blepharoplastie',
      subtitle: 'Blepharoplastie : Chirurgie des Paupieres pour un Regard Rajeuni',
      image: 'assets/images/proc/blepharoplastie.jpg',
      overview: "La blepharoplastie est une chirurgie des paupieres qui corrige l'exces de peau, les poches graisseuses et le relachement des paupieres pour un regard plus jeune et repose.",
      checks: ["Bilan ophtalmologique preoperatoire","Arret des anticoagulants","Test de secheresse oculaire"],
      risks: ["Secheresse oculaire temporaire","Asymetrie des paupieres","Cicatrices visibles"],
      issues: ["Paupieres tombantes genants la vision","Poches sous les yeux","Regard fatigue ou vieilli"],
      dos: ["Choisir un chirurgien ophtalmologiste ou plasticien","Utiliser des larmes artificielles post-op","Proteger les yeux du soleil"],
      donts: ["Ne pas porter de lentilles pendant 2 semaines","Ne pas se maquiller pendant 10 jours","Ne pas frotter les yeux"],
      faqs: [{ q: "La cicatrice est-elle visible ?", a: "Les cicatrices sont placees dans les plis naturels des paupieres et deviennent pratiquement invisibles apres quelques mois." }],
    },
  };

  procedure: any = null;
  tabs = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'checks', label: 'A verifier' },
    { id: 'dos', label: 'Conseils' },
    { id: 'faqs', label: 'FAQ' },
  ];

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    this.procedure = this.procedures[slug] || null;
  }

  toggleFaq(i: number) {
    this.expandedFaq = this.expandedFaq === i ? null : i;
  }
}