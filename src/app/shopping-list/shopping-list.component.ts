import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from './shopping-list.service';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Ingredient[] = [];
  private subscription = new Subscription();
  private subscription1 = new Subscription();
  private subscription2 = new Subscription();

  editMode = false;
  editedItemId: string = '';
  editedItem: Ingredient | undefined;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('table', {static: false}) table!: ElementRef;
  summedIngredients: Ingredient[] = [];

  clearAndSelectFile() {
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  constructor(private shoppingListService: ShoppingListService) {
  }

  ngOnInit(): void {
    this.ingredients = this.shoppingListService.getIngredients();
    this.subscription = this.shoppingListService.ingredientsChanged.subscribe(
      (ingredients: Ingredient[]) => {
        this.ingredients = ingredients;
      }
    );

    this.summedIngredients = this.shoppingListService.getSummedIngredients();
    this.subscription1 = this.shoppingListService.summedIngredientsChanged.subscribe(
      (ingredients: Ingredient[]) => {
        this.summedIngredients = ingredients;
      }
    );

    this.subscription2 = this.shoppingListService.startedEditing
      .subscribe(
        (id: string | undefined) => {
          if (id) {
            this.editedItemId = id;
          } else {
            this.editedItemId = '';
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  onEditItem(id: string) {
    if (this.editedItemId === id) {
      this.shoppingListService.startedEditing.next(undefined);
    } else {
      this.shoppingListService.startedEditing.next(id);
    }
  }

  saveIngredients() {
    const jsonData = JSON.stringify(this.ingredients);
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
  }

  importData($event: any) {
    const file = $event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonData = event.target!.result as string;
      const data = JSON.parse(jsonData) as Ingredient[];
      this.shoppingListService.importIngredients(data);
    };
    reader.readAsText(file);
  }

  getPriceEuro(ingredient: Ingredient): string {
    const priceString = ingredient.price.toFixed(2);
    const [euro] = priceString.split('.');
    return `${euro}`;
  }

  getPriceCent(ingredient: Ingredient): string {
    const priceString = ingredient.price.toFixed(2);
    const [euro, cent] = priceString.split('.');
    return `${cent}`;
  }

  getWorthEuro(ingredient: Ingredient): string {
    const priceString = (ingredient.price * ingredient.quantity).toFixed(2);
    const [euro, cent] = priceString.split('.');
    return `${euro}`;
  }

  getWorthCent(ingredient: Ingredient): string {
    const priceString = (ingredient.price * ingredient.quantity).toFixed(2);
    const [euro, cent] = priceString.split('.');
    return `${cent}`;
  }

  getSumEuro(): string {
    let sum = 0;
    for (let ingredient of this.shoppingListService.getIngredients()) {
      sum += ingredient.price * ingredient.quantity;
    }
    const priceString = sum.toFixed(2);
    const [euro, cent] = priceString.split('.');
    return `${euro}`;
  }

  getSumCent(): string {
    let sum = 0;
    for (let ingredient of this.shoppingListService.getIngredients()) {
      sum += ingredient.price * ingredient.quantity;
    }
    const priceString = sum.toFixed(2);
    const [euro, cent] = priceString.split('.');
    return `${cent}`;
  }


  scrollToTop() {
    window.scrollTo(0, 0);
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }
}
