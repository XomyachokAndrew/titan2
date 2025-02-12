import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  Renderer2,
  DestroyRef,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { FloorService } from '../../../services/controllers/floor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFloor } from '../../../services/models/Floor';

@Component({
  selector: 'office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.scss'],
})
export class OfficeComponent implements OnInit, AfterViewInit {
  svgContent: SafeHtml = '';
  svgData: any = '';

  id: number = 1;
  private subscription: Subscription;
  private destroyRef = inject(DestroyRef);

  office = {
    title: "",
    address: "",
    countCab: 0,
    countWorkspace: 0,
    countAvaibleWorkspace: 0
  };

  dataFloors!: IFloor[];

  //#region  Test
  cabs = [
    {
      id: 1,
      name: 'K-111',
    },
    {
      id: 2,
      name: 'K-121',
    },
    {
      id: 3,
      name: 'K-132',
    },
    {
      id: 4,
      name: 'K-211',
    },
    {
      id: 5,
      name: 'K-113',
    },
  ];
  //#endregion

  constructor(
    private sanitizer: DomSanitizer,
    private el: ElementRef,
    private renderer: Renderer2,
    private activateRoute: ActivatedRoute,
    private floorService: FloorService,
  ) {
    this.subscription = activateRoute.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.id = params["id"]);
  }

  ngOnInit() {
    // Получите SVG из базы данных
    this.svgData = `
      <svg width="1021" height="706" viewBox="0 0 1021 706" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_299_152)">
          <a x="9" y="5" width="316" height="289">
            <rect x="9" y="5" width="316" height="289" fill="#BC9191" stroke="black" stroke-width="10"/>
            <path d="M143.774 152.297L143.837 152.923C143.994 154.772 144.432 155.681 145.874 155.681C146.407 155.681 147.284 155.556 147.754 155.399L147.284 157.969C146.814 158.094 145.874 158.219 145.278 158.219C142.395 158.219 141.33 156.527 141.048 153.299L141.016 152.735C140.86 150.73 139.575 150.009 137.914 150.009H129.609V158H126.852V141.422H129.609V147.627H137.381C139.011 147.596 139.857 147.282 140.014 145.465C140.233 142.864 141.361 141.234 144.056 141.234C144.62 141.234 145.498 141.36 145.937 141.485L146.375 143.992C145.905 143.835 145.122 143.741 144.652 143.741C143.273 143.741 142.897 144.556 142.677 146.154C142.521 147.22 142.051 148.003 141.33 148.536C142.74 149.163 143.586 150.416 143.774 152.297ZM151.117 149.57V146.844H163.496V149.57H151.117ZM174.506 136.063H177.013V158H174.192C174.192 151.92 174.192 145.81 174.161 139.699C172.751 141.203 169.962 142.394 167.016 142.394V140.106C170.087 140.106 172.751 138.414 174.506 136.063ZM188.889 136.063H191.397V158H188.576C188.576 151.92 188.576 145.81 188.545 139.699C187.135 141.203 184.345 142.394 181.4 142.394V140.106C184.471 140.106 187.135 138.414 188.889 136.063ZM203.273 136.063H205.78V158H202.96C202.96 151.92 202.96 145.81 202.928 139.699C201.518 141.203 198.729 142.394 195.783 142.394V140.106C198.854 140.106 201.518 138.414 203.273 136.063Z" fill="white"/>
          </a>
          <a x="9" y="284" width="221" height="409"> 
            <rect x="9" y="284" width="221" height="409" fill="#BCB791" stroke="black" stroke-width="10"/>
            <path d="M91.7742 491.297L91.8369 491.923C91.9936 493.772 92.4323 494.681 93.8738 494.681C94.4066 494.681 95.284 494.556 95.7541 494.399L95.284 496.969C94.814 497.094 93.8738 497.219 93.2784 497.219C90.3953 497.219 89.3298 495.527 89.0478 492.299L89.0165 491.735C88.8598 489.73 87.5749 489.009 85.914 489.009H77.6095V497H74.8517V480.422H77.6095V486.627H85.3813C87.0108 486.596 87.857 486.282 88.0137 484.465C88.233 481.864 89.3612 480.234 92.0562 480.234C92.6203 480.234 93.4978 480.36 93.9365 480.485L94.3752 482.992C93.9052 482.835 93.1217 482.741 92.6517 482.741C91.2728 482.741 90.8967 483.556 90.6774 485.154C90.5207 486.22 90.0506 487.003 89.3298 487.536C90.74 488.163 91.5862 489.416 91.7742 491.297ZM99.1173 488.57V485.844H111.496V488.57H99.1173ZM122.506 475.063H125.013V497H122.192C122.192 490.92 122.192 484.81 122.161 478.699C120.751 480.203 117.962 481.394 115.016 481.394V479.106C118.087 479.106 120.751 477.414 122.506 475.063ZM136.889 475.063H139.397V497H136.576C136.576 490.92 136.576 484.81 136.545 478.699C135.135 480.203 132.345 481.394 129.4 481.394V479.106C132.471 479.106 135.135 477.414 136.889 475.063ZM144.316 492.268L146.792 490.889C148.233 493.365 151.9 494.65 155.316 494.65C159.922 494.65 163.181 492.801 163.181 489.73C163.181 486.627 159.828 484.81 155.222 484.81C152.213 484.81 149.706 485.593 148.359 487.003L146.259 485.844L146.666 475.063H164.529V477.79H149.267L148.954 484.089C150.615 482.898 152.903 482.177 155.566 482.177C161.583 482.177 166.002 484.935 166.002 489.604C166.002 494.399 161.74 497.282 155.378 497.282C150.709 497.282 146.228 495.496 144.316 492.268Z" fill="white"/>
          </a>
          <a x="220" y="436" width="282" height="260">
            <rect x="220" y="433" width="282" height="260" fill="#A7BC91" stroke="black" stroke-width="10"/>
            <path d="M332.774 565.297L332.837 565.923C332.994 567.772 333.432 568.681 334.874 568.681C335.407 568.681 336.284 568.556 336.754 568.399L336.284 570.969C335.814 571.094 334.874 571.219 334.278 571.219C331.395 571.219 330.33 569.527 330.048 566.299L330.016 565.735C329.86 563.73 328.575 563.009 326.914 563.009H318.609V571H315.852V554.422H318.609V560.627H326.381C328.011 560.596 328.857 560.282 329.014 558.465C329.233 555.864 330.361 554.234 333.056 554.234C333.62 554.234 334.498 554.36 334.937 554.485L335.375 556.992C334.905 556.835 334.122 556.741 333.652 556.741C332.273 556.741 331.897 557.556 331.677 559.154C331.521 560.22 331.051 561.003 330.33 561.536C331.74 562.163 332.586 563.416 332.774 565.297ZM340.117 562.57V559.844H352.496V562.57H340.117ZM363.506 549.063H366.013V571H363.192C363.192 564.92 363.192 558.81 363.161 552.699C361.751 554.203 358.962 555.394 356.016 555.394V553.106C359.087 553.106 361.751 551.414 363.506 549.063ZM377.889 549.063H380.397V571H377.576C377.576 564.92 377.576 558.81 377.545 552.699C376.135 554.203 373.345 555.394 370.4 555.394V553.106C373.471 553.106 376.135 551.414 377.889 549.063ZM406.344 566.299H402.552V571H399.763C399.763 569.433 399.731 567.866 399.731 566.299H384.627V564.231L400.045 549.063H402.552V563.792H406.344V566.299ZM388.575 563.792H399.731V552.855L388.575 563.792Z" fill="white"/>
          </a>
          <a x="493" y="439" width="520" height="260"> 
            <rect x="492" y="433" width="520" height="260" fill="#BC91B3" stroke="black" stroke-width="10"/>
            <path d="M723.774 565.297L723.837 565.923C723.994 567.772 724.432 568.681 725.874 568.681C726.407 568.681 727.284 568.556 727.754 568.399L727.284 570.969C726.814 571.094 725.874 571.219 725.278 571.219C722.395 571.219 721.33 569.527 721.048 566.299L721.016 565.735C720.86 563.73 719.575 563.009 717.914 563.009H709.609V571H706.852V554.422H709.609V560.627H717.381C719.011 560.596 719.857 560.282 720.014 558.465C720.233 555.864 721.361 554.234 724.056 554.234C724.62 554.234 725.498 554.36 725.937 554.485L726.375 556.992C725.905 556.835 725.122 556.741 724.652 556.741C723.273 556.741 722.897 557.556 722.677 559.154C722.521 560.22 722.051 561.003 721.33 561.536C722.74 562.163 723.586 563.416 723.774 565.297ZM731.117 562.57V559.844H743.496V562.57H731.117ZM754.506 549.063H757.013V571H754.192C754.192 564.92 754.192 558.81 754.161 552.699C752.751 554.203 749.962 555.394 747.016 555.394V553.106C750.087 553.106 752.751 551.414 754.506 549.063ZM768.889 549.063H771.397V571H768.576C768.576 564.92 768.576 558.81 768.545 552.699C767.135 554.203 764.345 555.394 761.4 555.394V553.106C764.471 553.106 767.135 551.414 768.889 549.063ZM794.461 564.67C794.461 561.975 791.39 560.909 787.284 560.909H784.558V558.371H787.441C791.17 558.371 793.489 557.274 793.489 555.049C793.489 552.918 790.92 551.477 787.002 551.477C783.555 551.477 780.797 552.793 779.199 555.394L776.692 553.984C778.635 550.693 782.458 548.844 787.034 548.844C792.674 548.844 796.31 551.445 796.31 554.861C796.31 556.992 794.837 558.434 792.8 559.468C795.558 560.376 797.375 562.194 797.375 564.795C797.375 568.869 793.113 571.251 787.222 571.251C782.521 571.251 778.102 569.496 776.191 566.268L778.666 564.889C780.139 567.365 783.774 568.65 787.222 568.65C791.358 568.65 794.461 567.365 794.461 564.67Z" fill="white"/>
          </a>
          <a x="319" y="5" width="802" height="448">
            <mask id="path-9-outside-1_299_152" maskUnits="userSpaceOnUse" x="215" y="0" width="802" height="448" fill="black">
              <rect fill="white" x="215" width="802" height="448"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M1007 10H320V289H225V438H320H664H1007V10Z"/>
            </mask>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1007 10H320V289H225V438H320H664H1007V10Z" fill="#9891BC"/>
            <path d="M320 10V0H310V10H320ZM1007 10H1017V0H1007V10ZM320 289V299H330V289H320ZM225 289V279H215V289H225ZM225 438H215V448H225V438ZM1007 438V448H1017V438H1007ZM320 20H1007V0H320V20ZM330 289V10H310V289H330ZM225 299H320V279H225V299ZM235 438V289H215V438H235ZM320 428H225V448H320V428ZM664 428H320V448H664V428ZM1007 428H664V448H1007V428ZM997 10V438H1017V10H997Z" fill="black" mask="url(#path-9-outside-1_299_152)"/>
            <path d="M592.774 226.297L592.837 226.923C592.994 228.772 593.432 229.681 594.874 229.681C595.407 229.681 596.284 229.556 596.754 229.399L596.284 231.969C595.814 232.094 594.874 232.219 594.278 232.219C591.395 232.219 590.33 230.527 590.048 227.299L590.016 226.735C589.86 224.73 588.575 224.009 586.914 224.009H578.609V232H575.852V215.422H578.609V221.627H586.381C588.011 221.596 588.857 221.282 589.014 219.465C589.233 216.864 590.361 215.234 593.056 215.234C593.62 215.234 594.498 215.36 594.937 215.485L595.375 217.992C594.905 217.835 594.122 217.741 593.652 217.741C592.273 217.741 591.897 218.556 591.677 220.154C591.521 221.22 591.051 222.003 590.33 222.536C591.74 223.163 592.586 224.416 592.774 226.297ZM600.117 223.57V220.844H612.496V223.57H600.117ZM623.506 210.063H626.013V232H623.192C623.192 225.92 623.192 219.81 623.161 213.699C621.751 215.203 618.962 216.394 616.016 216.394V214.106C619.087 214.106 621.751 212.414 623.506 210.063ZM637.889 210.063H640.397V232H637.576C637.576 225.92 637.576 219.81 637.545 213.699C636.135 215.203 633.345 216.394 630.4 216.394V214.106C633.471 214.106 636.135 212.414 637.889 210.063ZM647.917 218.086L645.159 217.271C646.789 212.539 650.863 209.844 656.222 209.844C662.019 209.844 665.435 212.915 665.435 216.864C665.435 220.342 662.646 223.069 657.13 225.952L650.675 229.305H665.936V232H645.692V229.681L655.908 223.915C659.951 221.627 662.615 219.778 662.615 217.052C662.615 214.419 660.202 212.477 656.284 212.477C652.148 212.477 649.171 214.482 647.917 218.086Z" fill="white"/>
          </a>
        </g>
      </svg>`;

    this.floorService.getFloorsByOfficeId(this.id).subscribe(
      response => {
        this.dataFloors = response;
      },
      error => {
        console.error(error);
      }
    );

    // Сантизируйте SVG для безопасного использования
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.svgData);
  }

  ngAfterViewInit(): void {
    // Добавляем обработчики событий и стилизацию после того, как SVG будет вставлен в DOM
    const svgElements = this.el.nativeElement.querySelectorAll('a');
    svgElements.forEach((element: HTMLElement, index: number) => {
      // Добавляем обработчик событий
      this.renderer.listen(element, 'click', () => {
        this.onSvgElementClick(element, index);
      });
      // Добавляем CSS-класс для стилизации
      this.renderer.addClass(element, 'clickable');
      this.renderer.setAttribute(element, 'id', `${this.cabs[index].id}`);
      // Добавляем инлайн-стили (если нужно)
      this.renderer.setStyle(element, 'cursor', 'pointer');

      // Добавляем текстовые элементы
      const text = this.renderer.createElement('text', 'svg');
      this.renderer.setAttribute(
        text,
        'x',
        `${(parseInt(element.getAttribute('x') || '') || 0) + 20}`
      );
      this.renderer.setAttribute(
        text,
        'y',
        `${(parseInt(element.getAttribute('y') || '') || 0) + 30}`
      );
      this.renderer.setAttribute(text, 'fill', 'black');
      this.renderer.setAttribute(text, 'font-size', '20');
      this.renderer.appendChild(
        text,
        this.renderer.createText(`${this.cabs[index].name}`)
      );
      this.renderer.appendChild(element.parentElement, text);
    });
  }

  onSvgElementClick(element: HTMLElement, index: number): void {
    alert(`Element ${element.tagName} ${index + 1} clicked!`);
  }
}
