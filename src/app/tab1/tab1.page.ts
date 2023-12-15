import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { LatLng, latLng, map, Marker, tileLayer } from 'leaflet';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Note } from '../model/note';
import { NoteService } from '../services/note.service';
import { UIService } from '../services/ui.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
})
export class Tab1Page {
  @ViewChild('map') mapContainer: any; // Obtén una referencia al contenedor del mapa

  public form!: FormGroup;
  private formB = inject(FormBuilder);
  private noteS = inject(NoteService);
  private UIS = inject(UIService);
  private loadingS = inject(LoadingController);
  private myLoading!: HTMLIonLoadingElement;
  private selectedPhoto: string | undefined;
  private map: any;
  private marker: Marker | undefined;

  constructor() {
    this.form = this.formB.group({
      title: ['', [Validators.required, Validators.minLength(4)]],
      description: [''],
      datetime: [''],
    });
  }
  
  public async saveNote(): Promise<void> {
    if (!this.form.valid || !this.selectedPhoto) return;

    const currentPosition = await this.getCurrentPosition();

    // Convierte la imagen a base64
    const photoDataUrl = await this.convertImageToBase64(this.selectedPhoto);

    let note: Note = {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value,
      date: this.form.get('datetime')?.value || new Date().toLocaleString(),
      photo: photoDataUrl, // Guarda la imagen en base64
      position: currentPosition ? currentPosition.toString() : undefined,
    };

    await this.UIS.showLoading();

    try {
      await this.noteS.addNote(note);
      this.form.reset();
      this.selectedPhoto = undefined;
      await this.UIS.showToast('Note submit succesfully', 'success');
    } catch (error) {
      await this.UIS.showToast('Submit error', 'danger');
    } finally {
      await this.UIS.hideLoading();
    }
  }

  public async takePic(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });

      this.selectedPhoto = image.webPath;
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  private async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const base64Data = await this.blobToBase64(blob);
      return base64Data;
    } catch (error) {
      console.error('Error al convertir la imagen a base64:', error);
      return '';
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public openMap(): void {
    if (this.marker) {
      this.map.setView(this.marker.getLatLng(), 13);
    }
  }

  public async getCurrentPosition(): Promise<LatLng | undefined> {
    try {
      const position = await Geolocation.getCurrentPosition();
      return latLng(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      console.error('Error al obtener la posición actual:', error);
      return undefined;
    }
  }
}
