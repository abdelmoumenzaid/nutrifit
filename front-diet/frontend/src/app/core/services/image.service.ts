import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
//   private apiUrl = 'http://localhost:8080/api/images';
    private apiUrl = environment.apiUrl + 'images';
  constructor(private http: HttpClient) {}

  getLogoUrl(): Observable<any> {
    return this.http.get(`${this.apiUrl}/url/logo-diet-32.jpg`);
  }

  getImageUrl(fileName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/url/${fileName}`);
  }

  uploadImage(file: File, fileName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
  getChatbotImage(): Observable<any> {
  return this.http.get(`${this.apiUrl}/url/chatbot1.png`);
}

}
