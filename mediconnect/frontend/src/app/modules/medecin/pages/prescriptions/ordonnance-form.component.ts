import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-ordonnance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `<p>Ordonnances</p>`
})
export class OrdonnanceFormComponent {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  router       = inject(Router);
}
