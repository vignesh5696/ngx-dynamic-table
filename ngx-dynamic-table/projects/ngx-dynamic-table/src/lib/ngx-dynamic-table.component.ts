import { KeyValue } from '@angular/common';
import { AfterViewChecked, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';


@Component({
  selector: 'ngx-dynamic-table',
  templateUrl: './ngx-dynamic-table.component.html',
  styleUrls: ['./ngx-dynamic-table.component.css']
})
export class NgxDynamicTableComponent implements OnInit, AfterViewChecked {

  @Input('src') inputSource:any=[];
  @Input('mode') mode:string="write";
  @Output('output') output = new EventEmitter<any>();
  @ViewChild('searchInput') searchInput : any;
  editMode : boolean = false;
  headerSet : any = new Set();
  originalOrder = (a:KeyValue<any,any>,b:KeyValue<any,any>): number => {
    return 0;
  }

  writeHeaders:string[]=[];
  writeOutput:{}[]=[];
  backupOutput:{}[]=[];
  emptyObj={};
  invalidColumnName:boolean=false;
  info : boolean = false;
  messageText : string="";
  showNoDataMessage : boolean = false;
  tempFetch : boolean = false;
  searchOptionType : string = "option1";
  filterOptionType : string = "option1";

  constructor() { }

  ngOnInit(): void {
    if(this.inputSource.length==0) {
      this.inputSource.push({Header:"Value"});
    }
    for(let row of this.inputSource) {
      for(let key in row){
        this.headerSet.add(key);
      }
    }
    this.setUniformInput(this.inputSource);
  }

  ngAfterViewChecked() {
    this.setHighlight();
  }

  setUniformInput(src:any) {
    this.writeOutput=[];
    this.backupOutput=[];
    this.writeHeaders=[];
    this.emptyObj={};
    for(let row of src) {
      let tempObj={};
      for(let key of this.headerSet){
        if(!(row.hasOwnProperty(key))) {
          tempObj={...tempObj,[key]:""};
        }else {
          tempObj={...tempObj,[key]:row[key]}
        }
        this.emptyObj={...this.emptyObj,[key]:""};
      }
      this.writeOutput.push(tempObj);
      this.backupOutput.push(tempObj);
    }
    if(src.length==0) {
      for(let key of this.headerSet){
        this.emptyObj={...this.emptyObj,[key]:""};
      }
    }
    this.writeHeaders=[...this.headerSet];
  }

  onSave() {
    if(this.editMode) {
      this.tempFetch=false;
      this.headerAndDataFetch();
      if(!this.invalidColumnName) {
        this.headerSet.clear();
        this.headerSet=new Set(this.writeHeaders);
        this.editMode=false;
        this.searchInput.nativeElement.value="";
        this.output.emit(this.backupOutput);
      }
      this.showNoData();
    }
  }

  onEdit() {
      this.writeOutput=[...this.backupOutput];
      this.emptyAllColumnSearch();
      this.editMode=true;
  }

  headerAndDataFetch() {
    this.writeHeaders=[];
    let emptyColumnName=0;
    this.invalidColumnName=false;
    let headElements=document.querySelector('#writeHeader');
    headElements?.childNodes.forEach(element => {
      element.childNodes.forEach((inp:any) => {
        if(inp.value=="") {
          emptyColumnName++;
        }
        if(!(Number(inp.value).toString()=="NaN")) {
          inp.value=" "+inp.value;
        }
        while(!(this.writeHeaders.indexOf(inp.value)==-1)) {
          inp.value=inp.value+" ";
        }
        this.writeHeaders.push(inp.value);
      });
      });
      if(emptyColumnName < 1) {
        this.writeOutput=[];    
        this.backupOutput=[];    
        let bodyElements:any=document.querySelector('#writeValue');
        bodyElements.childNodes.forEach((bodyRow:any)=>{
          let tempObj:any={};
          let index=0;
          bodyRow.childNodes.forEach((element:any) => {
            element.childNodes.forEach((inp:any) => {
            tempObj[this.writeHeaders[index]]=inp.value;
            index++;
            });
            });
            this.writeOutput.push(tempObj);
            this.backupOutput.push(tempObj);
        });
        if(!this.tempFetch) {
          this.removeEmptyRows();
        }else {
          this.writeOutput.splice(-1,1);
          this.backupOutput.splice(-1,1);
        }
      }else {
        this.invalidColumnName=true;
        this.messageText="COLUMN HEADER CAN NOT BE EMPTY.";
      }
      if(this.backupOutput.length==0) {
        this.invalidColumnName=true;
        this.info=false;
        this.messageText="THERE SHOULD BE ATLEAST ONE NON-EMPTY ROW.";
      }
  }

  removeEmptyRows() {
    this.writeOutput.splice(-1,1);
    this.backupOutput.splice(-1,1);
    let tempArr = [...this.backupOutput];
    let removedItem=0;
    for(let i=0;i<tempArr.length;i++) {
      let valid=false;
      let eachRow : any = tempArr[i];
      for(let key in eachRow) {
        if(eachRow[key].length!==0) {
          valid=true;
          break;
        }
      }
      if(!valid){
        this.info=true;
        this.messageText=" EMPTY ROWS WILL NOT BE ADDED.";
        this.writeOutput.splice(i-removedItem,1);
        this.backupOutput.splice(i-removedItem,1);
        removedItem++;
    }
    }
  }


  onClose() {
    this.invalidColumnName=false;
    this.info=false;
  }

  onRowAdd() {
    this.writeOutput.push(this.emptyObj);
  }

  onColumnAdd() {
    this.tempFetch=true;
    this.headerAndDataFetch();
    this.headerSet.add("Column "+(this.headerSet.size+1));
    this.setUniformInput(this.writeOutput);
    this.setUniformInput(this.backupOutput);
  }

  onColumnDelete() {
    this.tempFetch=true;
    this.headerAndDataFetch();
    if(this.headerSet.size>1) {
      let tempArr=[...this.headerSet];
      tempArr.pop();
      this.headerSet=new Set(tempArr);
    this.setUniformInput(this.backupOutput);
    this.setUniformInput(this.writeOutput);
    }else {
      this.invalidColumnName=true;
      this.messageText="THERE SHOULD BE ATLEAST ONE COLUMN.";
    }
  }

  onRowDelete() {
    this.writeOutput.pop();
    this.backupOutput.pop();
  }

  onSearch() {
    if(this.editMode) {
      this.messageText="CAN NOT PERFORM SEARCH IN EDIT MODE."
      this.invalidColumnName=true;
      this.searchInput.nativeElement.value="";
    }else {
      this.checkAllSearchString();
      this.showNoData();
    }
  }

  checkAllSearchString() {
    this.writeOutput=[...this.backupOutput];
    let searchInputList = document.querySelector('#columnSearchHeader');
    let searchValue;
    let searchColumn;
    let emptySearch : boolean = true;
    searchInputList?.childNodes.forEach((header : any) => {
      if(header?.firstChild) {
        if(header?.firstChild.value.length > 0) {
          emptySearch=false;
          searchValue = header?.firstChild.value;
          searchColumn =  header?.firstChild.id;
          this.filter(searchColumn,searchValue);
        }
      }
    });
    if(this.searchInput.nativeElement.value.length>0){
      emptySearch=false;
      searchValue = this.searchInput.nativeElement.value;
      searchColumn = "";
      this.filter(searchColumn,searchValue);
    }
    if(emptySearch) {
      this.writeOutput=[...this.backupOutput];
    }
  }

  filter(columnName : string , value : string) {
    for(let i=0;i<this.writeOutput.length;i++) {
      let contains=false;
      let eachRow : any = this.writeOutput[i];
      for(let key in eachRow) {
        if(columnName == "") {
          let condition;
          if(this.searchOptionType=="option1") {
            condition=eachRow[key].toString().toLowerCase().includes(value.toLowerCase());
          }else if(this.searchOptionType=="option2") {
            condition=eachRow[key].toString().toLowerCase().startsWith(value.toLowerCase());
          }
          if(condition) {
            contains=true;
            break;
          }
        }else {
          let condition;
          if(this.filterOptionType=="option1") {
            condition=eachRow[key].toString().toLowerCase().includes(value.toLowerCase());
          }else if(this.filterOptionType=="option2") {
            condition=eachRow[key].toString().toLowerCase().startsWith(value.toLowerCase());
          }
          if(key==columnName && condition) {
            contains=true;
            break;
          }
        }
      }
      if(!contains) {
        this.writeOutput.splice(i,1);
        i--;
      }
    }
  }

  showNoData() {
    this.showNoDataMessage = ((this.writeOutput.length==0));
  }

  setHighlight() {
    let bodyElements : any=document.querySelector('#readValue');
    bodyElements.childNodes.forEach((bodyRow:any)=>{
      bodyRow.childNodes.forEach((element:any) => {
        let inp = element.firstChild;
        if(inp) {
          let searchValue=this.searchInput.nativeElement.value.toLowerCase();
          let condition;
          if(this.searchOptionType=="option1") {
            condition=inp.data.toLowerCase().includes(searchValue)
          }else if(this.searchOptionType=="option2") {
            condition=inp.data.toLowerCase().startsWith(searchValue)
          }
          if( condition && searchValue.length>0) {
            inp.parentNode.bgColor="lightgreen"
          }else {
            inp.parentNode.bgColor="transparent"
          }
        }
        });
    });
  }

  emptyAllColumnSearch() {
    this.searchInput.nativeElement.value="";
    let searchInputList = document.querySelector('#columnSearchHeader');
    let searchValue;
    let searchColumn;
    searchInputList?.childNodes.forEach((header : any) => {
      if(header?.firstChild) {
        if(header?.firstChild.value.length > 0) {
          header.firstChild.value="";
          searchValue = header.firstChild.value;
          searchColumn =  header?.firstChild.id;
          this.filter(searchColumn,searchValue);
        }
      }
    });
  }

}
