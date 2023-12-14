import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import * as L from 'leaflet';
import { LatLng, map, Marker, tileLayer, icon } from 'leaflet';


@Component({
  standalone: true,
  imports:[NoteDetailModalComponent,IonicModule],
  selector: 'app-node-detail-modal',
  templateUrl: './node-detail-modal.component.html',
  styleUrls: ['./node-detail-modal.component.scss'],
})
export class NoteDetailModalComponent implements AfterViewInit, OnDestroy {
  @Input() note: any;
  private map: any;
  private marker: Marker | undefined;

  constructor(private modalController: ModalController) { }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    if (this.note) {
      // Inicializar el mapa
      const mapElement = document.getElementById('noteDetailMap');
  
      if (mapElement) {

        setTimeout(() => {
          this.map.invalidateSize(true);
        }, 100);
  
        this.map = map('noteDetailMap').setView([0, 0], 13);
  
        tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
  
        // Verificar si hay posición
        if (this.note.position) {
          const positionMatch = this.note.position.match(/\(([^,]+),([^)]+)\)/);
  
          if (positionMatch) {
            const lat = parseFloat(positionMatch[1]);
            const lng = parseFloat(positionMatch[2]);
  
            const position: L.LatLngExpression = [lat, lng];
  
            this.map.setView(position, 13);
  
            // Crear un ícono personalizado para el marcador
            const customIcon = L.icon({
              iconUrl: 'http://leafletjs.com/examples/custom-icons/leaf-green.png', // Reemplaza con la ruta de tu ícono personalizado
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            });
  
            this.marker = L.marker(position, { icon: customIcon }).addTo(this.map);
          } else {
            console.error('Invalid position data for the note:', this.note);
          }
        }
      } else {
        console.error('Map element not found');
      }
    } else {
      console.error('No data found for the note');
    }
  }
  
  
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

}