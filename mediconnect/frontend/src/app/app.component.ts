import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { I18nService } from "@core/services/i18n.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private i18n = inject(I18nService);

  ngOnInit() {
    this.i18n.init();
  }
}

