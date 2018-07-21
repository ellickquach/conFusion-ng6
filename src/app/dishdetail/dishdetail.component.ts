import { Component, OnInit, Input, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Comment } from '../shared/comment';

import { visibility, flyInOut, expand } from '../animations/app.animations';

const DISH = {
  name: 'Uthappizza',
  image: '/assets/images/uthappizza.png',
  category: 'mains',
  label: 'Hot',
  price: '4.99',
  // tslint:disable-next-line:max-line-length
  description: 'A unique combination of Indian Uthappam (pancake) and Italian pizza, topped with Cerignola olives, ripe vine cherry tomatoes, Vidalia onion, Guntur chillies and Buffalo Paneer.',
  comments: [
       {
           rating: 5,
           comment: 'Imagine all the eatables, living in conFusion!',
           author: 'John Lemon',
           date: '2012-10-16T17:57:28.556094Z'
       },
       {
           rating: 4,
           comment: 'Sends anyone to heaven, I wish I could get my mother-in-law to eat it!',
           author: 'Paul McVites',
           date: '2014-09-05T17:57:28.556094Z'
       },
       {
           rating: 3,
           comment: 'Eat it, just eat it!',
           author: 'Michael Jaikishan',
           date: '2015-02-13T17:57:28.556094Z'
       },
       {
           rating: 4,
           comment: 'Ultimate, Reaching for the stars!',
           author: 'Ringo Starry',
           date: '2013-12-02T17:57:28.556094Z'
       },
       {
           rating: 2,
           comment: 'It\'s your birthday, we\'re gonna party!',
           author: '25 Cent',
           date: '2011-12-02T17:57:28.556094Z'
       }
   ]
};

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [ visibility(), flyInOut(), expand() ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: number[];
  prev: number;
  next: number;

  dishcopy = null;

  commentForm: FormGroup;

  visibility = 'shown';

  formErrors = {
    'author': '',
    'rating': 5,
    'comment': '',
  }

  validationMessages = {
    'author': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Your comments are required.',
      'minlength':     'Please enter some comments to continue.'
    }
  };

  errMess: string;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cf: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
        this.createForm();
    }

  ngOnInit() {
    this.dishservice.getDishIds()
      .subscribe(dishIds => this.dishIds = dishIds, 
        errmess => this.errMess = <any>errmess.message);

    this.route.params.pipe(switchMap((params: Params) => { 
        this.visibility = 'hidden';
        return this.dishservice.getDish(+params['id']); }))
        .subscribe(dish => { 
            this.dish = dish; 
            this.dishcopy = dish;
            this.setPrevNext(dish.id); 
            this.visibility = 'shown';
        },
        errmess => this.errMess = <any>errmess.message);
    }

   goBack(): void {
    this.location.back();
    }

  setPrevNext(dishId: number) {
      let index = this.dishIds.indexOf(dishId);
      let idslen = this.dishIds.length;
      this.prev = this.dishIds[(idslen + index - 1) % idslen];
      this.next = this.dishIds[(idslen + index + 1) % idslen];
  }

  createForm(): void {
    this.commentForm = this.cf.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)] ],
      rating: '5',
      comment: ['', [Validators.required, Validators.minLength(1)] ]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();

  }

  comment: Comment;
  
  onSubmit() {
       
    this.comment = {
       'author': this.commentForm.get('author').value,
       'rating': this.commentForm.get('rating').value,
       'comment': this.commentForm.get('comment').value,
       'date': (new Date()).toISOString()
    }
            
    this.dishcopy.comments.push(this.comment);
    this.dishcopy.save()
      .subscribe(dish => this.dish = dish);
    
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });

  }


  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
}
