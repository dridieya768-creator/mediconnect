import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent {
  private router = inject(Router);

  menuOpen = false;
  searchQuery = '';

  stats = [
    { num: '500+', label: 'Medecins partenaires' },
    { num: '50k+', label: 'Patients enregistres' },
    { num: '24/7', label: 'Disponibilite' },
    { num: '98%', label: 'Satisfaction patients' },
  ];

  services = [
    { title: 'Prise de RDV en ligne',      desc: 'Reservez une consultation avec votre medecin en quelques clics.',  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=200&fit=crop' },
    { title: 'Teleconsultation video',      desc: 'Consultez votre medecin a distance depuis chez vous.',            image: 'assets/images/téléconsultation.jpg' },
    { title: 'Dossier medical numerique',   desc: 'Acces a tout votre historique medical en un seul endroit.',      image: 'assets/images/skin-care-1771591941516.jpg' },
    { title: 'Ordonnances electroniques',   desc: 'Recevez et partagez vos ordonnances numeriquement.',               image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=200&fit=crop' },
    { title: 'Resultats de laboratoire',    desc: 'Consultez vos analyses directement en ligne.',                     image: 'assets/images/abo.jpg'  },
    { title: 'Imagerie medicale',           desc: 'Acces a vos comptes-rendus radiologiques.',                        image: 'assets/images/imagerie.jpg' },
    { title: 'Grossiste Medical / Pharmacie', desc: 'Commandez vos medicaments et fournitures medicales en gros directement en ligne.', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=200&fit=crop' },
  ];

  specialitesList = [
    { name: 'Cardiologie',        desc: 'Soins du coeur.',              image: 'assets/images/cardio.jpg' },
    { name: 'Gynecologie',        desc: 'Sante reproductive.',           image: 'assets/images/gyneco.jpg' },
    { name: 'Pediatrie',          desc: 'Soins des enfants.',            image: 'assets/images/pediatrie.jpg' },
    { name: 'Neurologie',         desc: 'Systeme nerveux.',              image: 'assets/images/neuro.jpg' },
    { name: 'Ophtalmologie',      desc: 'Soins des yeux.',                image: 'assets/images/ophtalmo.jpg' },
    { name: 'Dermatologie',       desc: 'Soins de la peau.',             image: 'assets/images/dermato.jpg' },
    { name: 'Chirurgie Plastique',desc: 'Chirurgie esthetique.',         image: 'assets/images/plastique.jpg' },
    { name: 'Dentisterie',        desc: 'Soins dentaires.',              image: 'assets/images/dentiste.jpg' },
    { name: 'Urgences',           desc: 'Soins urgence.',                image: 'assets/images/urgences.jpg' },
    { name: 'Medecine generale',  desc: 'Medecine de famille.',          image: 'assets/images/famille.jpg' },
    { name: 'ORL',                desc: 'Oreille, nez, gorge.',          image: 'assets/images/orl.jpg' },
    { name: 'Psychiatrie',        desc: 'Sante mentale.',                image: 'assets/images/psychiatrie.jpg' },
    { name: 'Radiologie',         desc: 'Imagerie medicale.',            image: 'assets/images/radio.jpg' },
    { name: 'Rhumatologie',       desc: 'Articulations et os.',          image: 'assets/images/rhumato.jpg' },
    { name: 'Urologie',           desc: 'Voies urinaires.',             image: 'assets/images/urologie.jpg' },
    { name: 'Chirurgie',          desc: 'Interventions chirurgicales.',  image: 'assets/images/chirurgie.jpg' },
    { name: 'Endocrinologie',     desc: 'Hormones et metabolisme.',      image: 'assets/images/endocrino.jpg' },
    { name: 'Gastro-enterologie', desc: 'Systeme digestif.',              image: 'assets/images/gastro.jpg'},
    { name: 'Nephrologie',        desc: 'Soins des reins.',               image: 'assets/images/nephro.jpg'},
    { name: 'Oncologie',          desc: 'Traitement du cancer.',         image: 'assets/images/onco.jpg'},
    { name: 'Pneumologie',        desc: 'Poumons et respiration.',        image: 'assets/images/pneumo.jpg'},
    { name: 'Anesthesie',         desc: 'Anesthesie et reanimation.',     image: 'assets/images/anesthesie.jpg'},
  ];

  topProcedures = [
    { slug: 'liposuccion',           label: 'Liposuccion',           desc: 'Chirurgie pour eliminer les graisses localisees.',   image: 'assets/images/proc/liposuccion.jpg' },
    { slug: 'augmentation-mammaire', label: 'Augmentation Mammaire', desc: 'Chirurgie pour augmenter le volume des seins.',      image: 'assets/images/proc/mammaire.jpg' },
    { slug: 'rhinoplastie',          label: 'Rhinoplastie',          desc: 'Chirurgie de correction du nez.',                    image: 'assets/images/proc/rhinoplastie.jpg' },
    { slug: 'abdominoplastie',       label: 'Abdominoplastie',       desc: 'Chirurgie pour retendre la paroi abdominale.',       image: 'assets/images/proc/abdominoplastie.jpg' },
    { slug: 'blepharoplastie',       label: 'Blepharoplastie',       desc: 'Chirurgie des paupieres pour un regard rajeuni.',    image: 'assets/images/proc/blepharoplastie.jpg' },
  ];

  topTreatments = [
    { slug: 'perte-de-poids',        label: 'Programme Perte de Poids',     desc: 'Programmes medicaux supervises pour une perte de poids durable.',         image: 'assets/images/weight-loss.jpg' },
    { slug: 'medecine-sportive',      label: 'Medecine Sportive',            desc: 'Soins specialises pour les athletes et blessures sportives.',              image: 'assets/images/sports.webp' },
    { slug: 'soins-peau',             label: 'Soins de la Peau',             desc: 'Dermatologie esthetique et traitements cutanes avances.',                 image: 'assets/images/skin-care.jpg ' },
    { slug: 'chirurgie-vasculaire',   label: 'Chirurgie Vasculaire',         desc: 'Traitement des maladies des arteres, veines et vaisseaux sanguins.',       image: 'assets/images/vascular-surgery.webp' },
    { slug: 'yoga-meditation',        label: 'Yoga / Meditation',            desc: 'Retraites de bien-etre et programmes de sante mentale holistiques.',       image: 'assets/images/yoga.jpg' },
    { slug: 'medecine-sexuelle',      label: 'Medecine Sexuelle',            desc: 'Traitements discrets et specialises pour la sante sexuelle.',              image: 'assets/images/sexual.jpg' },
    { slug: 'readaptation',           label: 'Readaptation',                 desc: 'Programmes intensifs de readaptation neurologique et physique.',           image: 'assets/images/rehabilitation.webp' },
    { slug: 'traitement-addiction',   label: 'Traitement Addiction',         desc: 'Prise en charge medicale des dependances avec suivi personnalise.',       image: 'assets/images/addiction-treatment.jpg' },
    { slug: 'urologie',               label: 'Urologie',                     desc: 'Traitement des maladies urinaires, prostate et rein.',                     image: 'assets/images/urology.webp' },
    { slug: 'readaptation-medicale',  label: 'Readaptation Medicale',        desc: 'Programmes combines de readaptation et spa medical integres.',             image: 'assets/images/rehabilitation.jpg' },
  ];
  goToSearch() {
    this.router.navigate(['/auth/login']);
  }

  svcIndex = 0;
  readonly svcCardWidth = 296;

  get svcVisible(): number {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640)  return 1;
    if (window.innerWidth < 900)  return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  }

  get svcOffset(): number { return this.svcIndex * this.svcVisible * this.svcCardWidth; }
  get svcMaxIndex(): number { return Math.ceil(this.services.length / this.svcVisible) - 1; }
  get svcDots(): number[] { return Array.from({ length: this.svcMaxIndex + 1 }, (_, i) => i); }

  svcPrev() { if (this.svcIndex > 0) this.svcIndex--; }
  svcNext() { if (this.svcIndex < this.svcMaxIndex) this.svcIndex++; }
  svcGo(i: number) { this.svcIndex = i; }

  
  specIndex = 0;
  readonly specCardWidth = 194; // 180px + 14px gap

  get specVisible(): number {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth < 640)  return 2;
    if (window.innerWidth < 900)  return 4;
    if (window.innerWidth < 1200) return 5;
    return 6;
  }

  get specOffset(): number { return this.specIndex * this.specVisible * this.specCardWidth; }
  get specMaxIndex(): number { return Math.ceil(this.specialitesList.length / this.specVisible) - 1; }
  get specDots(): number[] { return Array.from({ length: this.specMaxIndex + 1 }, (_, i) => i); }

  specPrev() { if (this.specIndex > 0) this.specIndex--; }
  specNext() { if (this.specIndex < this.specMaxIndex) this.specIndex++; }
  specGo(i: number) { this.specIndex = i; }

  
  procIndex = 0;
  readonly procCardWidth = 240; 

  get procVisible(): number {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640)  return 1;
    if (window.innerWidth < 900)  return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  }

  get procOffset(): number { return this.procIndex * this.procVisible * this.procCardWidth; }
  get procMaxIndex(): number { return Math.ceil(this.topProcedures.length / this.procVisible) - 1; }
  get procDots(): number[] { return Array.from({ length: this.procMaxIndex + 1 }, (_, i) => i); }

  procPrev() { if (this.procIndex > 0) this.procIndex--; }
  procNext() { if (this.procIndex < this.procMaxIndex) this.procIndex++; }
  procGo(i: number) { this.procIndex = i; }
}