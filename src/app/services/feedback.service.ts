import { Injectable } from '@angular/core';

import { Restangular } from 'ngx-restangular';
import { Feedback } from '../shared/feedback';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(
    private restangular: Restangular
  ) { }

  submitFeedback(fb: Feedback) {
    return this.restangular.all('feedback').post(fb);
  }
}
