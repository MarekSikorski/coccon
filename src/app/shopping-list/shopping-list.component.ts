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

  @ViewChild('fileInput') fileInput!: ElementRef;

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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onEditItem(id: string) {
    this.shoppingListService.startedEditing.next(id);
  }

  getWorth(ingredient: Ingredient): number {
    return ingredient.price * ingredient.quantity;


  }

  getRemaining(ingredient: Ingredient): number {
    return ingredient.quantity - ingredient.sold;

  }

  printTable() {
    window.print();
  }

  saveIngredients() {
    const jsonData = JSON.stringify(this.ingredients);
    const blob = new Blob([jsonData], { type: 'application/json' });
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
}
