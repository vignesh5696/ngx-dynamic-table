# ngx-dynamic-table
Create and save new table with rows and columns. Over all search and individual column search options available.

Dynamic table generator library for Angular.

**Installation**<br/>
 npm install ngx-dynamic-tables


**Usage**<br/>
 Create and save new table with rows and columns. Over all search and individual column search options available.

**Step 1:**
Import NgxDynamicTableModule in your root module e.g: AppModule.

```
// app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NgxDynamicTableModule } from 'ngx-dynamic-tables'; // ==> import module from library

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxDynamicTableModule // ==> add module to `imports` array.
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 
```
Once the module is imported, you can start using the libaray seamlessly.

**Step 2**<br/>
Setup table config in your component file:

```
//app.component.ts
import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  src=[
    {
      Name:"Vignesh",
      age:25,
    },
    {
      Name:"Prabha",
      age:25,
      height:""
    },   
    {
     Name:"Prabha",
     age:25,
     weight:""
    }
  ];
}
```

**Step 3:**<br/>
Finally, add the ngx-dynamic-table to your template:

```
<!-- app.component.html-->
<ngx-dynamic-table [src]="src" [mode]="'read'" (output)="onSave($event)"></ngx-dynamic-table>
```

src - If empty then by default one row and column is created. (No restriction for keys in input object)<br/>
mode - values can be 'read' or 'write'(default).<br/>
output - If mode is edit, then on saving data can be fetched in parent element using (output) event.<br/>


