import express from "express";
import axios from "axios";
import parser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";


import { elements } from "chart.js";
import fs from "fs";
import XLSX from "xlsx";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__fileName);

const port = 3000;
const app = express();

// https://api.nbp.pl/
// https://www.coingecko.com/en/api
// https://newsapi.org/

const nbpUrl = "https://api.nbp.pl/api/exchangerates";
const cryptoUrl = "";
const newsUrl = "";

//nbp codes
const workbook = XLSX.readFile('public/data/list-one.xls');

let workSheets = {};

for (const SheetName of workbook.SheetNames) {
    workSheets[SheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[SheetName]);
}

const codes = [];
workSheets.Active.forEach(element => {
    codes.push(
        {
            currency: element['Alphabetic Code'],
            code: element['Numeric Code']
        });
});


const coinsList = await handleApiRequest("https://api.coingecko.com/api/v3/coins/list",
    {
        headers:
        {
            "content-type": "application/json",
            "Accept": "application/json"
        }
    });
console.log(coinsList.data);
app.use(parser.urlencoded({ extended: true }));


app.use(express.static("public"));

app.get("/", async (req, res) => {


    console.log(coinsList);
    res.render("index.ejs", { nbpCodes: codes, coins: coinsList });
});


app.post("/get-nbp", async (req, res) => {
    let apiRequest = buildNbpUrl(req.body);



    var result = await handleApiRequest(apiRequest,
        {
            headers:
            {
                "content-type": "application/json",
                "Accept": "application/json"
            }
        });
    res.json({ nbpValues: result.data });
});

app.post('/get-coingecko', async (req, res) => {
    console.log(req.body);
    const data = await getCoin(req.body.coin, "usd", "max");

    console.log({
        name: data.name,
        price: data.current_price,
        rank: data.market_cap_rank,
        homepage: data.homepage[0] || null
    });
    res.json({ coin: data.data });

}
);



app.listen(port, () => { console.log("listening on port :" + port) });


function buildNbpUrl(form) {
    let apiRequest = nbpUrl;

    if (form.currency == "none") {
        if (form.date1) {
            return apiRequest + '/tables/' + form.table + "/" + form.date1 + '/';
        } else if (form.topCount != '0') {
            return apiRequest + '/tables/' + form.table + "/" + "last/" + form.topCount + '/';
        } else {
            return apiRequest + '/tables/' + form.table + '/';
        }
    } else {
        if (form.date1 && form.date2) {
            return apiRequest + '/rates/' + form.table + '/' + form.currency + '/' + form.date1 + '/' + form.date2 + '/';
        } else if (form.date1) {
            return apiRequest + '/rates/' + form.table + '/' + form.currency + '/' + form.date1 + '/';
        } else if (form.topCount != '0') {
            return apiRequest + '/rates/' + form.table + '/' + form.currency + '/last/' + form.topCount + '/';
        } else {
            return apiRequest + '/rates/' + form.table + '/' + form.currency + '/';
        }
    }
}











async function handleApiRequest(url, option) {
    try {
        if (option) {
            return await axios.get(url, option);
        } else {
            return await axios.get(url);
        }
    } catch (error) {
        console.log(error);
    }
}



async function getCoin(coin, vs = "usd", days = "max") {
    if (!coin) throw new Error("Podaj id coina, np. 'bitcoin'.");

    const base = "https://api.coingecko.com/api/v3";

    const [info, chart] = await Promise.all([
        fetch(`${base}/coins/${encodeURIComponent(coin)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`)
            .then(r => r.json()),
        fetch(`${base}/coins/${encodeURIComponent(coin)}/market_chart?vs_currency=${encodeURIComponent(vs)}&days=${encodeURIComponent(days)}`)
            .then(r => r.json()),
    ]);

    return {
        id: info.id,
        name: info.name,
        symbol: info.symbol,
        image: info.image?.thumb ?? null,
        homepage: (info.links?.homepage || []).filter(Boolean),
        current_price: info.market_data?.current_price?.[vs] ?? null,
        market_cap_rank: info.market_data?.market_cap_rank ?? null,
        high_24h: info.market_data?.high_24h?.[vs] ?? null,
        low_24h: info.market_data?.low_24h?.[vs] ?? null,
        last_updated: info.market_data?.last_updated ?? info.last_updated ?? null,
        chart_prices: chart.prices || [] // [ [timestamp_ms, price], ... ]
    };
}
