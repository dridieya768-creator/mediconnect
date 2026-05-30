import {
  Component,
  OnInit,
  inject,
  signal,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";


@Component({
  selector: "app-medecin-qrcode",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-wrapper">

      
      <div class="qr-header">
        <div class="qr-icon"></div>
        <div>
          <h3 class="qr-title">Mon QR Code Profil</h3>
          <p class="qr-subtitle">
            Partagez ce code pour que vos patients puissent vérifier votre identité médicale
          </p>
        </div>
      </div>

      
      <div class="qr-loading" *ngIf="isLoading()">
        <div class="spinner"></div>
        <span>Génération en cours…</span>
      </div>

      
      <div class="qr-error" *ngIf="!isLoading() && errorMsg()">
         {{ errorMsg() }}
      </div>

      
      <div class="qr-body" *ngIf="!isLoading() && !errorMsg()">

        <!-- Canvas QR -->
        <div class="qr-canvas-wrap">
          <canvas #qrCanvas class="qr-canvas"></canvas>
          <!-- Logo centré par-dessus le canvas -->
          <div class="qr-logo-overlay"></div>
        </div>

        
        <div class="qr-url-box">
          <span class="qr-url-label">⤷ Lien de profil</span>
          <span class="qr-url-text">{{ profileUrl() }}</span>
        </div>

      
        <div class="qr-actions">
          <button class="btn-download" (click)="downloadQr()">
            ⬇↓ Télécharger PNG
          </button>
          <button class="btn-copy" (click)="copyUrl()">
            {{ copied() ? " Copié !" : "𓂃🖊 Copier le lien" }}
          </button>
          <button class="btn-print" (click)="printQr()">
            🖨 Imprimer
          </button>
        </div>

        
        <div class="copy-toast" *ngIf="copied()">
          ✔ Lien copié dans le presse-papiers !
        </div>

      </div>

      
      <div class="qr-note" *ngIf="!isLoading() && !errorMsg()">
        <strong> Conseil :</strong> Imprimez ce QR code et affichez-le dans votre cabinet.
        Vos patients pourront scanner le code pour vérifier instantanément vos informations.
      </div>

    </div>
  `,
  styles: [`
  
    .qr-wrapper {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 16px rgba(0,0,0,.06);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    
    .qr-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .qr-icon {
      font-size: 28px;
      line-height: 1;
      flex-shrink: 0;
    }
    .qr-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 4px;
    }
    .qr-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    
    .qr-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #64748b;
      font-size: 14px;
      justify-content: center;
      padding: 24px 0;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    
    .qr-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
    }

    
    .qr-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    /* Canvas wrapper avec logo centré */
    .qr-canvas-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(79,70,229,.1);
    }
    .qr-canvas {
      display: block;
      border-radius: 8px;
    }
    .qr-logo-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 36px;
      height: 36px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,.12);
      pointer-events: none;
    }

    /* URL box */
    .qr-url-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      max-width: 380px;
      box-sizing: border-box;
    }
    .qr-url-label {
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .qr-url-text {
      font-size: 12px;
      color: #4f46e5;
      font-weight: 600;
      word-break: break-all;
    }

    /* Actions */
    .qr-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .btn-download,
    .btn-copy,
    .btn-print {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity .15s, transform .1s;
    }
    .btn-download,
    .btn-copy,
    .btn-print {
      &:hover { opacity: .85; transform: translateY(-1px); }
      &:active { transform: translateY(0); }
    }
    .btn-download { background: #4f46e5; color: white; }
    .btn-copy     { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }
    .btn-print    { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }

    /* Toast copié */
    .copy-toast {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      animation: fadeIn .2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

    
    .qr-note {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 13px;
      color: #92400e;
      line-height: 1.6;
    }
  `],
})
export class MedecinQrcodeComponent implements OnInit, AfterViewInit {

  @ViewChild("qrCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;

  
  @Input() doctorId?: string;

  private http = inject(HttpClient);

  isLoading  = signal(true);
  errorMsg   = signal<string | null>(null);
  profileUrl = signal<string>("");
  copied     = signal(false);

  private resolvedId: string | null = null;

  
  ngOnInit() {
    if (this.doctorId) {
      this.resolvedId = this.doctorId;
      this.profileUrl.set(this.buildUrl(this.doctorId));
      
    } else {
      this.fetchDoctorId();
    }
  }

  ngAfterViewInit() {
    
    if (this.resolvedId) {
      this.generateQr(this.profileUrl());
    }
  }

  
  private fetchDoctorId() {
    this.http.get<any>("/api/v1/medecins/me")
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        const id =
          res?.data?.data?.id     ||
          res?.data?.data?.userId ||
          res?.data?.userId       ||
          res?.data?.id           ||
          res?.userId             ||
          res?.id                 ||
          null;

        if (!id) {
          this.errorMsg.set("Impossible de récupérer votre identifiant médecin.");
          this.isLoading.set(false);
          return;
        }

        this.resolvedId = id;
        const url = this.buildUrl(id);
        this.profileUrl.set(url);
        this.generateQr(url);
      });
  }

  
  private async generateQr(url: string) {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    try {
      
      const QRCode = (await import("qrcode")).default;

      
      await new Promise(r => setTimeout(r, 50));

      const canvas = this.canvasRef?.nativeElement;
      if (!canvas) {
        this.errorMsg.set("Canvas introuvable.");
        this.isLoading.set(false);
        return;
      }

      await QRCode.toCanvas(canvas, url, {
        width:           220,
        margin:          2,
        errorCorrectionLevel: "H",   
        color: {
          dark:  "#0f172a",
          light: "#ffffff",
        },
      });

      this.isLoading.set(false);

    } catch (err) {
      console.error("[QRCode] Erreur génération :", err);
      this.errorMsg.set("Erreur lors de la génération du QR code. Vérifiez que le package 'qrcode' est installé.");
      this.isLoading.set(false);
    }
  }

  
  downloadQr() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `qrcode-medecin-${this.resolvedId ?? "profil"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  
  async copyUrl() {
    try {
      await navigator.clipboard.writeText(this.profileUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.errorMsg.set("Impossible d'accéder au presse-papiers.");
    }
  }

  
  printQr() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>QR Code Médecin — MediConnect</title>
        <style>
          body {
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px;
            color: #0f172a;
          }
          h1 { font-size: 22px; margin-bottom: 4px; }
          p  { color: #64748b; font-size: 13px; margin-bottom: 24px; }
          img { width: 240px; height: 240px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; }
          .url { margin-top: 16px; font-size: 12px; color: #4f46e5; word-break: break-all; max-width: 300px; text-align: center; }
          .note { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; max-width: 300px; }
        </style>
      </head>
      <body>
        <h1> MediConnect</h1>
        <p>Profil Médecin Vérifié</p>
        <img src="${dataUrl}" alt="QR Code" />
        <div class="url">${this.profileUrl()}</div>
        <div class="note">Scannez ce QR code pour accéder au profil vérifié du médecin</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    win.document.close();
  }

  
  private buildUrl(id: string): string {
    // En production, remplacez window.location.origin par votre domaine fixe
    return `${window.location.origin}/medecin/scan/${id}`;
  }
}