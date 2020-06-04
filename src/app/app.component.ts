import { AppService } from './services/app.service';
import { Component } from '@angular/core';
import { read, utils } from 'xlsx';

declare var jQuery: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  userName: string = '';
  fetchedData: any = [];
  user: any;
  constructor(private appService: AppService) { }

  searchUser() {
    this.appService.search(this.userName).subscribe(data => {
      console.log('data', data)
      this.fetchedData = data;
    })
  }

  getKeys(obj) {
    if (obj) {
      let ob = Object.assign({}, obj)
      delete ob._id;
      return Object.keys(ob);
    }
    return [];
  }

  fetchDetails(id) {
    console.log('idddd', id)
    this.appService.fetchData(id).subscribe(data => {
      console.log('user', data);
      this.user = data;
    })
  }

  uploadClick() {
    jQuery('#fileUpload')[0].click();
  }

  handleFile(ev) {
    let file = ev.target.files[0];
    console.log(file);
    // let formData: FormData = new FormData();
    // formData.append('sampleSheet', file, file.name);
    // this.appService.upload(formData).subscribe(res=> {
    //   console.log(res);
    // })
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(ev.target);
    // if (target.files.length != 1) { throw new Error("Cannot upload multiple files on the entry") };
    const reader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr = e.target.result;
      const wb = read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // /* save data */
      let uploadData: any = (utils.sheet_to_formulae(ws));
      let newData = [];
      let noR = uploadData[uploadData.length - 1].split('=')[0].match(/([A-Za-z]+)([0-9]+)/)[2];
      for (let j = 0; j < noR - 1; j++) {
        newData.push({});
      }
      let indexing = [];
      uploadData.map(val => {
        let i = Number(val.split('=')[0].match(/([A-Za-z]+)([0-9]+)/)[2]) - 1;
        let j = this.getcolumnNumber(val.split('=')[0].match(/([A-Za-z]+)([0-9]+)/)[1]);
        let value = val.split('=')[1].replace(/"|'/g, '');
        if (i == 0) {
          indexing[j] = value;
        } else {
          newData[i - 1][indexing[j]] = value ? value : '';
        }
      });
      let data = newData;
      console.log('data', data.toString().length)
      this.appService.upload(data).subscribe(res => {
        console.log(res);
      })
    };
    reader.readAsBinaryString(target.files[0]);
  }

  getcolumnNumber(col: string) {
    let newCol = col.split('').reverse();
    let num = 0;
    for (let i = 0; i < newCol.length; i++) {
      num = num + ((newCol[i].charCodeAt(0) - 64) * Math.pow(26, i));
    }
    return num - 1;
  }
}
