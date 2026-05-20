"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PatientSearchMedecinComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var router_1 = require("@angular/router");
var rxjs_1 = require("rxjs");
var rxjs_2 = require("rxjs");
var auth_service_1 = require("../../../../core/services/auth.service");
var book_appointment_panel_component_1 = require("./book-appointment-panel/book-appointment-panel.component");
var L = require("leaflet");
var PatientSearchMedecinComponent = /** @class */ (function () {
    function PatientSearchMedecinComponent() {
        this.http = core_1.inject(http_1.HttpClient);
        this.router = core_1.inject(router_1.Router);
        this.route = core_1.inject(router_1.ActivatedRoute);
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.zone = core_1.inject(core_1.NgZone);
        this.isLoading = core_1.signal(true);
        this.allDoctors = core_1.signal([]);
        this.selectedDoc = core_1.signal(null);
        this.bookingDoctor = core_1.signal(null);
        this.fullscreenPhoto = core_1.signal(null);
        this.searchQuery = "";
        this.filterVille = "";
        this.filterSpecialite = "";
        this.filterTeleconsult = false;
        this.filterDisponible = false;
        this.sortBy = "nom";
        this.viewMode = "list";
        this.carouselIndex = 0;
        this.carouselOffset = 0;
        this.cardWidth = 316;
        this.searchSubject = new rxjs_1.Subject();
        this.map = null;
        this.markers = [];
        this.userMarker = null;
        this.villes = ["Tunis", "Sfax", "Sousse", "Bizerte", "Nabeul", "Monastir", "Gabes", "Ariana", "Ben Arous", "La Marsa"];
        this.specialites = ["Medecin Generaliste", "Cardiologue", "Dermatologue", "Urgentiste", "Gynecologue", "Neurologue", "Ophtalmologue", "ORL", "Pediatre", "Psychiatre", "Radiologue", "Rhumatologue", "Urologue", "Chirurgien", "Anesthesiste", "Endocrinologue", "Gastro-enterologue", "Nephrologue", "Oncologue", "Pneumologue"];
        this.topSpecialites = ["Cardiologue", "Generaliste", "Pediatre", "Gynecologue"];
        this.filteredDoctors = core_1.signal([]);
        this.villeCoords = {
            "Tunis": [36.8065, 10.1815], "Sfax": [34.7406, 10.7603], "Sousse": [35.8245, 10.6346],
            "Bizerte": [37.2744, 9.8739], "Nabeul": [36.4561, 10.7376], "Monastir": [35.7643, 10.8113],
            "Gabes": [33.8881, 10.0975], "Ariana": [36.8625, 10.1956], "Ben Arous": [36.7533, 10.2282],
            "La Marsa": [36.8781, 10.3247]
        };
    }
    Object.defineProperty(PatientSearchMedecinComponent.prototype, "visibleCount", {
        get: function () {
            if (typeof window === "undefined")
                return 3;
            if (window.innerWidth <= 640)
                return 1;
            if (window.innerWidth <= 1024)
                return 2;
            return 3;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PatientSearchMedecinComponent.prototype, "canPrev", {
        get: function () { return this.carouselIndex > 0; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PatientSearchMedecinComponent.prototype, "canNext", {
        get: function () { return this.carouselIndex < this.getCarouselDots().length - 1; },
        enumerable: false,
        configurable: true
    });
    PatientSearchMedecinComponent.prototype.getCarouselDots = function () { return Array.from({ length: Math.ceil(this.filteredDoctors().length / this.visibleCount) }, function (_, i) { return i; }); };
    PatientSearchMedecinComponent.prototype.prevSlide = function () { if (this.canPrev)
        this.goToSlide(this.carouselIndex - 1); };
    PatientSearchMedecinComponent.prototype.nextSlide = function () { if (this.canNext)
        this.goToSlide(this.carouselIndex + 1); };
    PatientSearchMedecinComponent.prototype.goToSlide = function (i) { this.carouselIndex = i; this.carouselOffset = i * this.visibleCount * this.cardWidth; };
    PatientSearchMedecinComponent.prototype.onResize = function () { this.goToSlide(0); };
    PatientSearchMedecinComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loadDoctors();
        this.searchSubject.pipe(rxjs_1.debounceTime(300), rxjs_1.distinctUntilChanged()).subscribe(function () { return _this.applyFilters(); });
        // Lire le query param specialite (depuis le chatbot IA)
        this.route.queryParams.subscribe(function (params) {
            if (params['specialite']) {
                _this.filterSpecialite = params['specialite'];
                _this.applyFilters();
            }
        });
    };
    PatientSearchMedecinComponent.prototype.ngOnDestroy = function () {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        delete window.__takeAppointment;
    };
    PatientSearchMedecinComponent.prototype.setView = function (mode) {
        var _this = this;
        this.viewMode = mode;
        if (mode === "map")
            setTimeout(function () { return _this.initMap(); }, 150);
    };
    PatientSearchMedecinComponent.prototype.initMap = function () {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        var el = document.getElementById("medecin-map");
        if (!el)
            return;
        this.map = L.map("medecin-map", { zoomControl: true }).setView([36.8065, 10.1815], 7);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);
        this.addDoctorMarkers();
        this.locateUser();
    };
    PatientSearchMedecinComponent.prototype.addDoctorMarkers = function () {
        var _this = this;
        if (!this.map)
            return;
        this.markers.forEach(function (m) { return m.remove(); });
        this.markers = [];
        var docIcon = L.divIcon({
            className: "",
            html: "<div style=\"background:#1a56db;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.3);border:2px solid white;font-weight:700;\">+</div>",
            iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20]
        });
        var bounds = [];
        this.filteredDoctors().forEach(function (doc) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var lat, lng;
            if (((_a = doc.profile) === null || _a === void 0 ? void 0 : _a.latitude) && ((_b = doc.profile) === null || _b === void 0 ? void 0 : _b.longitude)) {
                lat = parseFloat(doc.profile.latitude);
                lng = parseFloat(doc.profile.longitude);
            }
            else if (((_c = doc.profile) === null || _c === void 0 ? void 0 : _c.ville) && _this.villeCoords[doc.profile.ville]) {
                var base = _this.villeCoords[doc.profile.ville];
                lat = base[0] + (Math.random() - 0.5) * 0.02;
                lng = base[1] + (Math.random() - 0.5) * 0.02;
            }
            else {
                lat = 36.8065 + (Math.random() - 0.5) * 0.05;
                lng = 10.1815 + (Math.random() - 0.5) * 0.05;
            }
            var name = (((_d = doc.profile) === null || _d === void 0 ? void 0 : _d.titre) || "Dr.") + " " + _this.getFullName(doc);
            var spec = ((_e = doc.profile) === null || _e === void 0 ? void 0 : _e.specialite) || _this.getRoleLabel(doc.role);
            var addr = ((_f = doc.profile) === null || _f === void 0 ? void 0 : _f.adresseCabinet) || ((_g = doc.profile) === null || _g === void 0 ? void 0 : _g.ville) || "";
            var tel = ((_h = doc.profile) === null || _h === void 0 ? void 0 : _h.telephonePro) || "";
            var popup = "<div style=\"min-width:200px;font-family:system-ui,sans-serif;padding:4px;\">\n        <div style=\"font-weight:700;font-size:14px;color:#0f172a;margin-bottom:4px;\">" + name + "</div>\n        <div style=\"font-size:12px;color:#1a56db;font-weight:600;margin-bottom:6px;\">" + spec + "</div>\n        " + (addr ? "<div style=\"font-size:12px;color:#64748b;margin-bottom:3px;\">&#128205; " + addr + "</div>" : "") + "\n        " + (tel ? "<div style=\"font-size:12px;color:#64748b;margin-bottom:8px;\">&#128222; " + tel + "</div>" : "") + "\n        <button onclick=\"window.__takeAppointment('" + doc.id + "')\"\n          style=\"width:100%;padding:8px;background:#1a56db;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;\">\n          Prendre RDV\n        </button>\n      </div>";
            var marker = L.marker([lat, lng], { icon: docIcon }).addTo(_this.map).bindPopup(popup, { maxWidth: 240 });
            _this.markers.push(marker);
            bounds.push([lat, lng]);
        });
        window.__takeAppointment = function (id) {
            _this.zone.run(function () {
                var doc = _this.filteredDoctors().find(function (d) { return String(d.id) === String(id); });
                if (doc)
                    _this.takeAppointment(doc);
            });
        };
        if (bounds.length > 0) {
            this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
    };
    PatientSearchMedecinComponent.prototype.locateUser = function () {
        var _this = this;
        if (!navigator.geolocation)
            return;
        navigator.geolocation.getCurrentPosition(function (pos) {
            _this.zone.run(function () {
                if (!_this.map)
                    return;
                var _a = pos.coords, lat = _a.latitude, lng = _a.longitude;
                if (_this.userMarker)
                    _this.userMarker.remove();
                var userIcon = L.divIcon({
                    className: "",
                    html: "<div style=\"background:#ef4444;border-radius:50%;width:16px;height:16px;border:3px solid white;box-shadow:0 0 0 3px rgba(239,68,68,.3);\"></div>",
                    iconSize: [16, 16], iconAnchor: [8, 8]
                });
                _this.userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(_this.map).bindPopup("<b>Votre position</b>").openPopup();
                _this.map.setView([lat, lng], 12);
            });
        }, function () { });
    };
    PatientSearchMedecinComponent.prototype.loadDoctors = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins").pipe(rxjs_1.catchError(function () { return rxjs_2.of([]); })).subscribe(function (res) {
            var _a;
            var list = Array.isArray(res) ? res : Array.isArray(res === null || res === void 0 ? void 0 : res.data) ? res.data : Array.isArray((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) ? res.data.data : [];
            _this.allDoctors.set(list);
            _this.filteredDoctors.set(list);
            _this.isLoading.set(false);
        });
    };
    PatientSearchMedecinComponent.prototype.onSearchChange = function (q) { this.searchSubject.next(q); };
    PatientSearchMedecinComponent.prototype.applyFilters = function () {
        var _this = this;
        var list = __spreadArrays(this.allDoctors());
        var q = this.searchQuery.toLowerCase().trim();
        if (q)
            list = list.filter(function (d) { var _a, _b; return _this.getFullName(d).toLowerCase().includes(q) || (((_a = d.profile) === null || _a === void 0 ? void 0 : _a.specialite) || "").toLowerCase().includes(q) || (((_b = d.profile) === null || _b === void 0 ? void 0 : _b.ville) || "").toLowerCase().includes(q); });
        if (this.filterVille)
            list = list.filter(function (d) { var _a; return ((_a = d.profile) === null || _a === void 0 ? void 0 : _a.ville) === _this.filterVille; });
        if (this.filterSpecialite)
            list = list.filter(function (d) { var _a; return (((_a = d.profile) === null || _a === void 0 ? void 0 : _a.specialite) || "").toLowerCase().includes(_this.filterSpecialite.toLowerCase()) || _this.getRoleLabel(d.role).toLowerCase().includes(_this.filterSpecialite.toLowerCase()); });
        if (this.filterTeleconsult)
            list = list.filter(function (d) { var _a; return (_a = d.profile) === null || _a === void 0 ? void 0 : _a.disponTeleconsult; });
        this.sortList(list);
        this.filteredDoctors.set(list);
        this.goToSlide(0);
        if (this.viewMode === "map" && this.map)
            this.addDoctorMarkers();
    };
    PatientSearchMedecinComponent.prototype.sortDoctors = function () { var list = __spreadArrays(this.filteredDoctors()); this.sortList(list); this.filteredDoctors.set(list); };
    PatientSearchMedecinComponent.prototype.sortList = function (list) {
        var _this = this;
        list.sort(function (a, b) {
            var _a, _b, _c, _d;
            if (_this.sortBy === "nom")
                return _this.getFullName(a).localeCompare(_this.getFullName(b));
            if (_this.sortBy === "specialite")
                return (((_a = a.profile) === null || _a === void 0 ? void 0 : _a.specialite) || "").localeCompare(((_b = b.profile) === null || _b === void 0 ? void 0 : _b.specialite) || "");
            if (_this.sortBy === "ville")
                return (((_c = a.profile) === null || _c === void 0 ? void 0 : _c.ville) || "").localeCompare(((_d = b.profile) === null || _d === void 0 ? void 0 : _d.ville) || "");
            return 0;
        });
    };
    PatientSearchMedecinComponent.prototype.resetFilters = function () {
        this.searchQuery = "";
        this.filterVille = "";
        this.filterSpecialite = "";
        this.filterTeleconsult = false;
        this.filterDisponible = false;
        this.filteredDoctors.set(this.allDoctors());
        this.goToSlide(0);
        if (this.viewMode === "map" && this.map)
            this.addDoctorMarkers();
    };
    PatientSearchMedecinComponent.prototype.openProfile = function (doc) { this.selectedDoc.set(doc); };
    PatientSearchMedecinComponent.prototype.getCabinetPhotos = function (doc) {
        var _a, _b, _c;
        var raw = (_b = (_a = doc === null || doc === void 0 ? void 0 : doc.profile) === null || _a === void 0 ? void 0 : _a.photosCabinet) !== null && _b !== void 0 ? _b : (_c = doc === null || doc === void 0 ? void 0 : doc.profile) === null || _c === void 0 ? void 0 : _c.photos_cabinet;
        console.log('[getCabinetPhotos]', raw);
        if (!raw)
            return [];
        if (Array.isArray(raw))
            return raw.filter(Boolean);
        if (typeof raw === 'string') {
            try {
                var parsed = JSON.parse(raw);
                if (Array.isArray(parsed))
                    return parsed.filter(Boolean);
            }
            catch (_d) { }
            return raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        return [];
    };
    PatientSearchMedecinComponent.prototype.openPhotoFull = function (photo) { this.fullscreenPhoto.set(photo); };
    PatientSearchMedecinComponent.prototype.hideImg = function (e) { e.target.style.display = 'none'; };
    PatientSearchMedecinComponent.prototype.takeAppointment = function (doc) {
        this.selectedDoc.set(null);
        if (!this.authService.isAuthenticated()) {
            this.router.navigate(["/auth/login"], { queryParams: { returnUrl: "/patient/recherche" } });
            return;
        }
        this.bookingDoctor.set(doc);
    };
    PatientSearchMedecinComponent.prototype.onBooked = function () { this.router.navigate(["/patient/appointments"]); };
    PatientSearchMedecinComponent.prototype.goToGuide = function () { this.router.navigate(["/patient/guide-medecin"]); };
    PatientSearchMedecinComponent.prototype.getFullName = function (doc) { return ((doc.firstName || doc.first_name || "") + " " + (doc.lastName || doc.last_name || "")).trim() || "Medecin"; };
    PatientSearchMedecinComponent.prototype.getInitials = function (doc) { return ((doc.firstName || doc.first_name || "")[0] || "").toUpperCase() + ((doc.lastName || doc.last_name || "")[0] || "").toUpperCase() || "M"; };
    PatientSearchMedecinComponent.prototype.getRoleLabel = function (role) {
        var labels = {
            MEDECIN: "Medecin Generaliste",
            MEDECIN_GENERALISTE: "Medecin Generaliste",
            MEDECIN_SPECIALISTE: "Medecin Specialiste",
            MEDECIN_CHEF_SERVICE: "Chef de Service",
            MEDECIN_URGENTISTE: "Medecin Urgentiste"
        };
        return labels[role] || "Medecin";
    };
    PatientSearchMedecinComponent.prototype.getTarif = function (tarifs) {
        if (!tarifs)
            return "";
        try {
            var t = typeof tarifs === "string" ? JSON.parse(tarifs) : tarifs;
            if (t === null || t === void 0 ? void 0 : t.consultation)
                return "Consultation : " + t.consultation + " DT";
        }
        catch (_a) { }
        return (tarifs === null || tarifs === void 0 ? void 0 : tarifs.substring(0, 60)) || "";
    };
    __decorate([
        core_1.HostListener("window:resize")
    ], PatientSearchMedecinComponent.prototype, "onResize");
    PatientSearchMedecinComponent = __decorate([
        core_1.Component({
            selector: "app-patient-search-medecin",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule, book_appointment_panel_component_1.BookAppointmentPanelComponent],
            template: "\n    <div class=\"search-page\">\n\n      <!-- HERO BANNER -->\n      <div class=\"hero-banner\">\n        <img src=\"assets/images/hemato-oncology-adults.jpg.webp\" class=\"hero-img\" alt=\"Trouver un medecin\" />\n        <div class=\"hero-overlay\">\n          <h1 class=\"hero-title\">Trouver un Medecin</h1>\n          <p class=\"hero-sub\">Recherchez parmi nos medecins disponibles</p>\n        </div>\n      </div>\n\n      <!-- BARRE DE RECHERCHE -->\n      <div class=\"search-hero\">\n        <div class=\"search-bar-main\">\n          <div class=\"search-input-wrap\">\n            <input class=\"search-input\" type=\"text\" [(ngModel)]=\"searchQuery\" (ngModelChange)=\"onSearchChange($event)\" placeholder=\"Nom du medecin, specialite...\"/>\n          </div>\n          <div class=\"search-select-wrap\">\n            <select class=\"search-select\" [(ngModel)]=\"filterVille\" (change)=\"applyFilters()\">\n              <option value=\"\">Toutes les villes</option>\n              <option *ngFor=\"let v of villes\" [value]=\"v\">{{ v }}</option>\n            </select>\n          </div>\n          <div class=\"search-select-wrap\">\n            <select class=\"search-select\" [(ngModel)]=\"filterSpecialite\" (change)=\"applyFilters()\">\n              <option value=\"\">Toutes specialites</option>\n              <option *ngFor=\"let s of specialites\" [value]=\"s\">{{ s }}</option>\n            </select>\n          </div>\n          <button class=\"btn-search\" (click)=\"applyFilters()\">Rechercher</button>\n        </div>\n        <div class=\"quick-filters\">\n          <button class=\"quick-btn\" [class.active]=\"filterTeleconsult\" (click)=\"filterTeleconsult = !filterTeleconsult; applyFilters()\">Teleconsultation</button>\n          <button class=\"quick-btn\" [class.active]=\"filterDisponible\" (click)=\"filterDisponible = !filterDisponible; applyFilters()\">Disponible aujourd'hui</button>\n          <button *ngFor=\"let s of topSpecialites\" class=\"quick-btn\" [class.active]=\"filterSpecialite === s\" (click)=\"filterSpecialite = filterSpecialite === s ? '' : s; applyFilters()\">{{ s }}</button>\n        </div>\n      </div>\n\n      <!-- LOADING -->\n      <div class=\"loading-state\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div><p>Recherche en cours...</p>\n      </div>\n\n      <div *ngIf=\"!isLoading()\">\n        <!-- TOGGLE VUE -->\n        <div class=\"results-header\">\n          <span class=\"results-count\">{{ filteredDoctors().length }} medecin(s) trouve(s)</span>\n          <div class=\"view-toggle-bar\">\n            <button class=\"view-btn\" [class.active]=\"viewMode === 'list'\" (click)=\"setView('list')\">&#9776; Liste</button>\n            <button class=\"view-btn\" [class.active]=\"viewMode === 'map'\" (click)=\"setView('map')\">&#9974; Carte</button>\n            <select class=\"sort-select\" *ngIf=\"viewMode === 'list'\" [(ngModel)]=\"sortBy\" (change)=\"sortDoctors()\">\n              <option value=\"nom\">Trier par nom</option>\n              <option value=\"specialite\">Trier par specialite</option>\n              <option value=\"ville\">Trier par ville</option>\n            </select>\n          </div>\n        </div>\n\n        <!-- VUE CARTE -->\n        <div class=\"map-section\" *ngIf=\"viewMode === 'map'\">\n          <div class=\"map-toolbar\">\n            <button class=\"locate-btn\" (click)=\"locateUser()\">&#9654; Ma position</button>\n            <span class=\"map-info\">{{ filteredDoctors().length }} cabinet(s) sur la carte</span>\n          </div>\n          <div id=\"medecin-map\" class=\"leaflet-map\"></div>\n        </div>\n\n        <!-- VUE LISTE CAROUSEL -->\n        <div class=\"carousel-section\" *ngIf=\"viewMode === 'list' && filteredDoctors().length > 0\">\n          <div class=\"carousel-wrapper\">\n            <button class=\"carousel-arrow\" (click)=\"prevSlide()\" [disabled]=\"!canPrev\">&#8249;</button>\n            <div class=\"carousel-viewport\">\n              <div class=\"carousel-track\" [style.transform]=\"'translateX(-' + carouselOffset + 'px)'\">\n                <div class=\"doctor-card\" *ngFor=\"let doc of filteredDoctors()\" (click)=\"openProfile(doc)\">\n                  <div class=\"card-top\">\n                    <div class=\"doc-avatar\">\n                      <img *ngIf=\"doc.profile?.photoPro\" [src]=\"doc.profile.photoPro\" [alt]=\"getFullName(doc)\" class=\"avatar-img\"/>\n                      <span *ngIf=\"!doc.profile?.photoPro\" class=\"avatar-initials\">{{ getInitials(doc) }}</span>\n                    </div>\n                    <div class=\"doc-badges\">\n                      <span class=\"badge-teleconsult\" *ngIf=\"doc.profile?.disponTeleconsult\">Teleconsult.</span>\n                      <span class=\"badge-disponible\">Disponible</span>\n                    </div>\n                  </div>\n                  <div class=\"card-body\">\n                    <h3 class=\"doc-name\">{{ doc.profile?.titre || 'Dr.' }} {{ getFullName(doc) }}</h3>\n                    <p class=\"doc-spec\">{{ doc.profile?.specialite || getRoleLabel(doc.role) }}</p>\n                    <div class=\"doc-meta\">\n                      <span *ngIf=\"doc.profile?.ville\">{{ doc.profile.ville }}</span>\n                      <span *ngIf=\"doc.profile?.telephonePro\">{{ doc.profile.telephonePro }}</span>\n                    </div>\n                    <p class=\"doc-bio\" *ngIf=\"doc.profile?.biographie\">{{ doc.profile.biographie | slice:0:100 }}{{ doc.profile.biographie?.length > 100 ? '...' : '' }}</p>\n                    <div class=\"doc-assurances\" *ngIf=\"doc.profile?.assurancesAcceptees\">Assurances : {{ doc.profile.assurancesAcceptees }}</div>\n                  </div>\n                  <div class=\"card-actions\">\n                    <button class=\"btn-profile\" (click)=\"$event.stopPropagation(); openProfile(doc)\">Voir profil</button>\n                    <button class=\"btn-rdv\" (click)=\"$event.stopPropagation(); takeAppointment(doc)\">Prendre RDV</button>\n                  </div>\n                </div>\n              </div>\n            </div>\n            <button class=\"carousel-arrow\" (click)=\"nextSlide()\" [disabled]=\"!canNext\">&#8250;</button>\n          </div>\n          <div class=\"carousel-dots\">\n            <button *ngFor=\"let dot of getCarouselDots()\" class=\"carousel-dot\" [class.active]=\"dot === carouselIndex\" (click)=\"goToSlide(dot)\"></button>\n          </div>\n          <p class=\"carousel-counter\">Page {{ carouselIndex + 1 }} / {{ getCarouselDots().length }} - {{ filteredDoctors().length }} medecin(s)</p>\n        </div>\n\n        <div class=\"empty-state\" *ngIf=\"viewMode === 'list' && filteredDoctors().length === 0\">\n          <p>Aucun medecin trouve</p>\n          <button class=\"btn-reset\" (click)=\"resetFilters()\">Reinitialiser</button>\n        </div>\n      </div>\n\n      <!-- SECTION PROMO -->\n      <div class=\"promo-section\">\n        <div class=\"promo-text\">\n          <h2 class=\"promo-title\">Bienvenue sur notre plateforme medicale !</h2>\n          <p class=\"promo-desc\">Nous collaborons avec les meilleurs medecins en Tunisie pour vous accompagner dans votre parcours de sante.</p>\n          \n        </div>\n        <div class=\"promo-img-wrap\">\n          <img src=\"assets/images/recherche-medecins.webp\" class=\"promo-img\" alt=\"Recherche medecins\" />\n        </div>\n      </div>\n\n      <!-- PANNEAU RDV -->\n      <app-book-appointment-panel [medecin]=\"bookingDoctor()\" (closed)=\"bookingDoctor.set(null)\" (booked)=\"onBooked()\"></app-book-appointment-panel>\n\n      <!-- MODAL PROFIL -->\n      <div class=\"modal-overlay\" *ngIf=\"selectedDoc()\" (click)=\"selectedDoc.set(null)\">\n        <div class=\"modal-card\" (click)=\"$event.stopPropagation()\">\n          <div class=\"modal-header\">\n            <h2>Profil du M\u00E9decin</h2>\n            <button class=\"btn-close\" (click)=\"selectedDoc.set(null)\">\u2715</button>\n          </div>\n          <div class=\"modal-body\" *ngIf=\"selectedDoc()\">\n\n            <!-- Hero -->\n            <div class=\"profile-hero\">\n              <div class=\"profile-avatar\">\n                <img *ngIf=\"selectedDoc()!.profile?.photoPro\" [src]=\"selectedDoc()!.profile.photoPro\" class=\"avatar-img-lg\"/>\n                <span *ngIf=\"!selectedDoc()!.profile?.photoPro\" class=\"avatar-initials-lg\">{{ getInitials(selectedDoc()!) }}</span>\n              </div>\n              <div class=\"profile-hero-info\">\n                <h3>{{ selectedDoc()!.profile?.titre || 'Dr.' }} {{ getFullName(selectedDoc()!) }}</h3>\n                <p class=\"profile-spec\">{{ selectedDoc()!.profile?.specialite || getRoleLabel(selectedDoc()!.role) }}</p>\n                <div class=\"profile-badges\">\n                  <span class=\"badge-tele\" *ngIf=\"selectedDoc()!.profile?.disponTeleconsult\"> T\u00E9l\u00E9consultation</span>\n                  <span class=\"badge-ville\" *ngIf=\"selectedDoc()!.profile?.ville\"> {{ selectedDoc()!.profile.ville }}</span>\n                </div>\n              </div>\n            </div>\n\n            <!-- Biographie -->\n            <div class=\"profile-section\" *ngIf=\"selectedDoc()!.profile?.biographie\">\n              <h4>\u00C0 propos</h4>\n              <p>{{ selectedDoc()!.profile.biographie }}</p>\n            </div>\n\n            <!-- Infos pratiques -->\n            <div class=\"profile-section\">\n              <h4>Informations pratiques</h4>\n              <div class=\"info-grid\">\n                <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.telephonePro\">\n                  <span class=\"info-label\"> T\u00E9l\u00E9phone</span><span>{{ selectedDoc()!.profile.telephonePro }}</span>\n                </div>\n                <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.adresseCabinet\">\n                  <span class=\"info-label\"> Adresse</span><span>{{ selectedDoc()!.profile.adresseCabinet }}</span>\n                </div>\n                <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.assurancesAcceptees\">\n                  <span class=\"info-label\">'G Assurances</span><span>{{ selectedDoc()!.profile.assurancesAcceptees }}</span>\n                </div>\n                <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.languesParlees\">\n                  <span class=\"info-label\"> Langues</span><span>{{ selectedDoc()!.profile.languesParlees }}</span>\n                </div>\n                <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.tarifs\">\n                  <span class=\"info-label\"> Tarifs</span><span>{{ selectedDoc()!.profile.tarifs }}</span>\n                </div>\n                <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.actesCouverts\">\n                  <span class=\"info-label\"> Actes</span><span>{{ selectedDoc()!.profile.actesCouverts }}</span>\n                </div>\n              </div>\n            </div>\n\n            <!-- Dipl\u00F4mes -->\n            <div class=\"profile-section\" *ngIf=\"selectedDoc()!.profile?.diplomes\">\n              <h4> Dipl\u00F4mes & Formations</h4>\n              <p class=\"diplomes-text\">{{ selectedDoc()!.profile.diplomes }}</p>\n            </div>\n\n            <!-- Photos cabinet -->\n            <div class=\"profile-section\" *ngIf=\"getCabinetPhotos(selectedDoc()!).length > 0\">\n              <h4> Photos du cabinet</h4>\n              <div class=\"cabinet-photos\">\n                <img *ngFor=\"let photo of getCabinetPhotos(selectedDoc()!)\"\n                     [src]=\"photo\" alt=\"Photo cabinet\"\n                     class=\"cabinet-photo\"\n                     (error)=\"hideImg($event)\"\n                     (click)=\"openPhotoFull(photo)\"/>\n              </div>\n            </div>\n\n          </div>\n          <div class=\"modal-footer\">\n            <button class=\"btn-outline\" (click)=\"selectedDoc.set(null)\">Fermer</button>\n            <button class=\"btn-rdv-lg\" (click)=\"takeAppointment(selectedDoc()!)\">Prendre RDV</button>\n          </div>\n        </div>\n      </div>\n\n      <!-- Photo plein \u00E9cran -->\n      <div class=\"photo-fullscreen\" *ngIf=\"fullscreenPhoto()\" (click)=\"fullscreenPhoto.set(null)\">\n        <img [src]=\"fullscreenPhoto()!\" alt=\"Photo cabinet\"/>\n      </div>\n    </div>\n  ",
            styles: ["\n    .search-page { padding: 0; font-family: system-ui, sans-serif; }\n    .hero-banner { position: relative; width: 100%; height: 520px; overflow: hidden; }\n    .hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }\n    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,.65), rgba(0,0,0,.2)); display: flex; flex-direction: column; justify-content: center; padding: 40px 48px; }\n    .hero-title { font-size: 32px; font-weight: 800; color: white; margin: 0 0 8px; }\n    .hero-sub { font-size: 16px; color: rgba(255,255,255,.85); margin: 0; }\n    .search-hero { background: #f1f5f9; border-radius: 16px; padding: 28px; margin-bottom: 28px; }\n    .search-bar-main { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }\n    .search-input-wrap, .search-select-wrap { display: flex; align-items: center; background: white; border-radius: 10px; padding: 10px 14px; flex: 1; min-width: 160px; border: 1.5px solid #e2e8f0; }\n    .search-input, .search-select { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; background: transparent; }\n    .btn-search { padding: 10px 24px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }\n    .btn-search:hover { background: #1447c0; }\n    .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }\n    .quick-btn { padding: 6px 14px; background: white; color: #374151; border: 1.5px solid #d1d5db; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; }\n    .quick-btn:hover, .quick-btn.active { background: #1a56db; color: white; border-color: #1a56db; }\n    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }\n    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin .8s linear infinite; }\n    @keyframes spin { to { transform: rotate(360deg); } }\n    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 0 4px; }\n    .results-count { font-size: 14px; color: #64748b; font-weight: 600; }\n    .view-toggle-bar { display: flex; gap: 8px; align-items: center; }\n    .view-btn { padding: 7px 16px; background: white; color: #374151; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }\n    .view-btn.active { background: #1a56db; color: white; border-color: #1a56db; }\n    .sort-select { padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; cursor: pointer; }\n    .map-section { margin-bottom: 32px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }\n    .map-toolbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border-bottom: 1px solid #e2e8f0; }\n    .locate-btn { padding: 7px 16px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }\n    .locate-btn:hover { background: #1447c0; }\n    .map-info { font-size: 13px; color: #64748b; }\n    .leaflet-map { height: 520px; width: 100%; }\n    .carousel-section { margin-bottom: 32px; }\n    .carousel-wrapper { display: flex; align-items: center; }\n    .carousel-viewport { flex: 1; overflow: hidden; }\n    .carousel-track { display: flex; gap: 16px; transition: transform .45s cubic-bezier(.25,.46,.45,.94); }\n    .doctor-card { min-width: 300px; width: 300px; flex-shrink: 0; background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; }\n    .doctor-card:hover { border-color: #1a56db; box-shadow: 0 8px 24px rgba(26,86,219,.12); transform: translateY(-2px); }\n    .card-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 16px 0; }\n    .doc-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #1a56db, #2563eb); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }\n    .avatar-img { width: 100%; height: 100%; object-fit: cover; }\n    .avatar-initials { color: white; font-size: 20px; font-weight: 700; }\n    .doc-badges { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }\n    .badge-teleconsult { background: #eff6ff; color: #1a56db; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }\n    .badge-disponible { background: #f0fdf4; color: #16a34a; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }\n    .card-body { padding: 12px 16px; flex: 1; }\n    .doc-name { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .doc-spec { font-size: 13px; color: #1a56db; font-weight: 600; margin: 0 0 10px; }\n    .doc-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b; margin-bottom: 8px; }\n    .doc-bio { font-size: 12px; color: #475569; line-height: 1.5; margin: 0 0 6px; }\n    .doc-assurances { font-size: 12px; color: #64748b; }\n    .card-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; background: #f8fafc; }\n    .btn-profile { flex: 1; padding: 8px; background: white; color: #1a56db; border: 1.5px solid #1a56db; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }\n    .btn-profile:hover { background: #eff6ff; }\n    .btn-rdv { flex: 1; padding: 8px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }\n    .btn-rdv:hover { background: #1447c0; }\n    .carousel-arrow { width: 44px; height: 44px; border-radius: 50%; background: white; border: 1.5px solid #e2e8f0; font-size: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,.1); transition: all .2s; flex-shrink: 0; color: #0f172a; }\n    .carousel-arrow:first-of-type { margin-right: 12px; }\n    .carousel-arrow:last-of-type { margin-left: 12px; }\n    .carousel-arrow:hover:not(:disabled) { background: #1a56db; color: white; border-color: #1a56db; }\n    .carousel-arrow:disabled { opacity: .3; cursor: not-allowed; }\n    .carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }\n    .carousel-dot { width: 8px; height: 8px; border-radius: 50%; background: #e2e8f0; border: none; cursor: pointer; padding: 0; transition: all .2s; }\n    .carousel-dot.active { background: #1a56db; width: 22px; border-radius: 4px; }\n    .carousel-counter { text-align: center; font-size: 12px; color: #64748b; margin-top: 8px; }\n    .empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; background: white; border-radius: 14px; }\n    .btn-reset { padding: 10px 20px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; }\n    .promo-section { display: flex; align-items: center; gap: 48px; background: white; border-radius: 20px; padding: 48px; margin: 32px 0; box-shadow: 0 4px 24px rgba(0,0,0,.06); }\n    .promo-text { flex: 1; }\n    .promo-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 16px; }\n    .promo-desc { font-size: 16px; color: #475569; line-height: 1.7; margin: 0 0 28px; }\n    .btn-symptomes { padding: 14px 28px; background: #1a56db; color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }\n    .btn-symptomes:hover { background: #1447c0; }\n    .promo-img-wrap { flex: 1; display: flex; justify-content: flex-end; }\n    .promo-img { width: 100%; max-width: 460px; height: 300px; object-fit: cover; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.12); }\n    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }\n    .modal-card { background: white; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); }\n    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; }\n    .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }\n    .btn-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }\n    .modal-body { padding: 24px; }\n    .modal-footer { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; position: sticky; bottom: 0; background: white; }\n    .profile-hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }\n    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1a56db, #2563eb); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }\n    .avatar-img-lg { width: 100%; height: 100%; object-fit: cover; }\n    .avatar-initials-lg { color: white; font-size: 26px; font-weight: 700; }\n    .profile-hero-info h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .profile-spec { color: #1a56db; font-weight: 600; font-size: 14px; margin: 0 0 10px; }\n    .profile-badges { display: flex; gap: 8px; flex-wrap: wrap; }\n    .badge-tele { background: #eff6ff; color: #1a56db; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }\n    .badge-ville { background: #f0fdf4; color: #16a34a; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }\n    .profile-sections { display: flex; flex-direction: column; gap: 20px; }\n    .profile-section { margin-bottom: 20px; }\n    .profile-section h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }\n    .profile-section p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }\n    .diplomes-text { font-size: 13px; color: #475569; line-height: 1.7; white-space: pre-line; }\n    .info-grid { display: flex; flex-direction: column; gap: 8px; }\n    .info-row { display: flex; gap: 12px; font-size: 13px; align-items: flex-start; }\n    .info-label { color: #64748b; font-weight: 600; min-width: 110px; flex-shrink: 0; }\n    .cabinet-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }\n    .cabinet-photo { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; transition: transform .2s; border: 1.5px solid #e2e8f0; }\n    .cabinet-photo:hover { transform: scale(1.03); }\n    .photo-fullscreen { position: fixed; inset: 0; background: rgba(0,0,0,.9); display: flex; align-items: center; justify-content: center; z-index: 9999; cursor: pointer; }\n    .photo-fullscreen img { max-width: 90vw; max-height: 90vh; border-radius: 8px; object-fit: contain; }\n    .btn-outline { flex: 1; padding: 10px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }\n    .btn-rdv-lg { flex: 2; padding: 10px; background: #1a56db; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }\n    .btn-rdv-lg:hover { background: #1447c0; }\n    @media (max-width: 768px) { .promo-section { flex-direction: column; padding: 28px; } .promo-img { max-width: 100%; height: 200px; } }\n    @media (max-width: 640px) { .search-bar-main { flex-direction: column; } .hero-overlay { padding: 24px 20px; } .hero-title { font-size: 22px; } .doctor-card { min-width: calc(100vw - 80px); width: calc(100vw - 80px); } .leaflet-map { height: 360px; } }\n  "]
        })
    ], PatientSearchMedecinComponent);
    return PatientSearchMedecinComponent;
}());
exports.PatientSearchMedecinComponent = PatientSearchMedecinComponent;
