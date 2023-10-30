import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', {static: false}) slForm: NgForm | undefined ;
  subscription: Subscription = new Subscription();
  editMode = false;
  editedItemId: string = '';
  editedItem: Ingredient | undefined;

  constructor(private shoppingListService: ShoppingListService) {
  }

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing
      .subscribe(
        (id: string) => {
          this.editedItemId = id;
          this.editMode = true;
          this.editedItem = this.shoppingListService.getIngredient(id);
          if (this.editedItem)
          this.slForm!.setValue({
            name: this.editedItem.name,
            quantity: this.editedItem.quantity,
            price: this.editedItem.price,
            sold: this.editedItem.sold
          });
        }
      );
  }

  ngOnDestroy(): void {
        this.subscription.unsubscribe();
  }

  onSubmit(form: NgForm) {
    const value = form.value;

    const newIngredient = new Ingredient(uuidv4(), value.name,
      value.quantity,
      value.price,
      value.sold);
    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.editedItemId, newIngredient);
    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }
    this.editMode = false;
    form.reset();
  }

  onClear() {
    if (this.slForm)
    this.slForm.reset();
    this.editMode = false;
  }

  onDelete() {
    this.shoppingListService.deleteIngredient(this.editedItemId);
    this.onClear();
  }
}
