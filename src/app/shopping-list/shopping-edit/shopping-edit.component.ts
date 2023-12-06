import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import {v4 as uuidv4} from 'uuid';


@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('f', {static: false}) slForm: NgForm | undefined;
  @ViewChild('name') nameInput: ElementRef | undefined;
  subscription: Subscription = new Subscription();

  editMode = false;
  editedItemId: string = '';
  editedItem: Ingredient | undefined;
  selectedValue: any;

  options = {
    values: [
      'Bluzka',
      'Biżuteria',
      'Czapka',
      'Komplet',
      'Kurtka',
      'Obuwie',
      'Pasek',
      'Rękawice',
      'Spodnie',
      'Spódnica',
      'Suknia',
      'Sweter',
      'Szal',
      'Torba',
      'Żakiet',
      'Portfel',
      'Zegarek',
      'Tunika',
      'Leginsy',
      'Bolerko',
      'Pierścień',
      'Naszyjnik',
      'Bransoletka',
      'Broszka',
      'Kpl.Biż',
      'Kolczyki',
      'Pudełko',
      'Kamizelka',
      'Zawieszka',
      'Kombinezon',
      'Bluza',
      'Brelok',
      'Rekl.',
      'Dres',
      'Beret',
      'Koszula',
      'Kapelusz',
      'Okulary',
      'Kardigan',
      'Dodatki',
      'Płaszcz'
    ]
  };


  constructor(private shoppingListService: ShoppingListService) {
  }

  ngAfterViewInit(): void {
    if (this.nameInput) this.nameInput.nativeElement.focus();
  }

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditing
      .subscribe(
        (id: string | undefined) => {
          if (id) {
            this.editedItemId = id;
            this.editMode = true;
            this.editedItem = this.shoppingListService.getIngredient(id);
            if (this.editedItem)
              this.slForm!.setValue({
                name: this.editedItem.name,
                quantity: this.editedItem.quantity,
                price: this.editedItem.price,
                sold: null
              });
          } else {

            this.slForm!.reset();

            this.editedItemId = '';
            this.editedItem = undefined;
            this.editMode = false;

            if (this.nameInput) this.nameInput.nativeElement.focus();
          }
        }
      );

    this.sortOptionsAlphabetically();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(form: NgForm) {
    const value = form.value;

    const quantity = value.quantity - value.sold;

    if (this.editMode) {
      const newIngredient = new Ingredient(this.editedItemId, value.name,
        quantity,
        value.price);
      this.shoppingListService.updateIngredient(this.editedItemId, newIngredient);
    } else {
      const newIngredient = new Ingredient(uuidv4(), value.name,
        quantity,
        value.price);
      this.shoppingListService.addIngredient(newIngredient);
    }
    this.shoppingListService.startedEditing.next(undefined);
    this.slForm!.controls['name'].setValue(value.name);
  }

  onClear() {
    this.shoppingListService.startedEditing.next(undefined);
  }

  onDelete() {
    this.shoppingListService.deleteIngredient(this.editedItemId);
    this.onClear();
  }

  onSell(form: NgForm) {
    const value = form.value;

    const quantity = value.quantity - 1;
    const newIngredient = new Ingredient(this.editedItemId, value.name,
      quantity,
      value.price);
    this.shoppingListService.updateIngredient(this.editedItemId, newIngredient);

    this.shoppingListService.startedEditing.next(undefined);
  }

  sortOptionsAlphabetically() {
    this.options.values.sort((a, b) => a.localeCompare(b));
  }
}
