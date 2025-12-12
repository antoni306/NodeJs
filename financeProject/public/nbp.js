


import { elements } from "chart.js";
import fs from "fs";
import XLSX from "xlsx";


const workbook = XLSX.readFile('public/data/list-one.xls');

let workSheets = {};

for (const SheetName of workbook.SheetNames) {
    workSheets[SheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[SheetName]);
}

// console.log(JSON.stringify(workSheets.Active));
// console.log(JSON.stringify(workSheets));

const codes = [];
workSheets.Active.forEach(element => {
    codes.push(
        {
            entity: element.ENTITY,
            currency: element.CURRENCY,
            code: element['Numeric Code']
        });
});
console.log(codes);
document.addEventListener("DOMContentLoaded", async () => {
    codes.forEach(element => {
        var option = document.createElement('option');
        option.value = element.code;
        option.textContent = "entity: " + element.entity + ", currency:  " + element.currency;

        document.getElementById("currency").appendChild(option);
    });
});
console.log("nbp done");


