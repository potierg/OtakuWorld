import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.css']
})
export class ParametersComponent implements OnInit {

  private directory = "";

  constructor() { }

  ngOnInit() {
  }

  directoryChange() {

    var fil = document.getElementById("myFile");
    console.log(fil['value']);

  }
}
