"use strict";
(() => {
    // This is the max amount of coins that can be selected for reports page
    const selectedCoinsTopLimit = 6;
    // Navbar elements
    const mainPageLink = document.getElementById("mainPageLink");
    const coinsPageLink = document.getElementById("coinsPageLink");
    const reportsPageLink = document.getElementById("reportsPageLink");
    const aboutUsPageLink = document.getElementById("aboutUsPageLink");
    const searchField = document.getElementById("searchField");
    const mainContentContainer = document.getElementById("main-content-display");

    // This is array of selected coins on page load - used for triggering modal on page load if needed 
    const isThereDataOnLoad = JSON.parse(sessionStorage.getItem("selectedCoins"));

    // Navbar links & navbar search field event listeners
    mainPageLink.addEventListener("click", () => loadMainPage());
    coinsPageLink.addEventListener("click", () => loadCoinsPage());
    reportsPageLink.addEventListener("click", () => loadReportPage());
    aboutUsPageLink.addEventListener("click", () => loadAboutUsPage());

    searchField.addEventListener("input", event => filterAndDisplayCoins(event.target.value));

    // This loads the navbar reports icons 
    adjustReportsLink();

    // This triggers modal if user tries to surpass the max amount of coins allowed by refreshing the page
    if (isThereDataOnLoad) {
        if (isThereDataOnLoad.length === selectedCoinsTopLimit) {
            loadCoinsPage();
            checkSelectedCoinsAmount();
        }
    };


    // ------------------------------------------------------- FUNCTIONS RELATED TO COINS PAGE -------------------------------------------------------

    // Function loads coins from API or session storage and displays it in Bootstrap's card format
    async function loadCoinsPage() {
        if (!sessionStorage.getItem("coins")) {
            await getSaveAndDisplayCoins();
        }
        else {
            loadCoinsFromSessionStorage();
        }
    }

    // Function returns coins json from API
    async function getJson() {
        return (await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1")).json();
    }

    // Function gets coinsArray from API, calls for a save to session storage and calls for a display 
    async function getSaveAndDisplayCoins() {
        try {
            const coins = await getJson();
            saveCoinsAndTimeToSessionStorage(coins);
            displayCoins(coins);
        }
        catch (err) { console.log(err) }
    }

    // Function displays all coins from data in session storage in Bootstrap's card format
    function loadCoinsFromSessionStorage() {
        displayCoins(JSON.parse(sessionStorage.getItem("coins")));
    }

    // Function adds event listeners to all checkbox buttons on screen (EXCLUDING modal buttons)
    function addEventListenersToCheckBoxButtons() {
        const buttons = document.getElementsByClassName("form-check-input");
        for (const button of buttons) {

            if (button.id === "firstSelectedCoin" || button.id === "secondSelectedCoin" || button.id === "thirdSelectedCoin"
                || button.id === "fourthSelectedCoin" || button.id === "fifthSelectedCoin" || button.id === "sixthSelectedCoin") { continue; }

            button.addEventListener("change", (event) => {
                updateSelectedCoins(event.target.id.substring(6, event.target.id.length));
                adjustReportsLink();
                checkSelectedCoinsAmount();
            });
        }
    }

    // Function saves fetched coinsArray and fetching time to session storage
    function saveCoinsAndTimeToSessionStorage(coinsArray) {
        sessionStorage.setItem("coins", JSON.stringify(coinsArray));
        sessionStorage.setItem("dateAndTime", JSON.stringify((new Date).toLocaleString()));
    }

    // Function displays array of coins sent to it in Bootstrap's card format
    function displayCoins(coinsArray) {

        let selectedCoins = sessionStorage.getItem("selectedCoins");
        if (selectedCoins) { selectedCoins = JSON.parse(selectedCoins) }
        else { selectedCoins = [] };

        // h2 and modal HTML
        let html = `
            <h2>The coins:</h2>

            <!-- Button trigger modal -->
            <button type="button" class="btn btn-primary invisible" data-bs-toggle="modal" data-bs-target="#staticBackdrop" id="buttonSwitchModal">
                Launch static backdrop modal
            </button>

            <!-- Modal -->
            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="staticBackdropLabel">Too many coins!</h1>
                        </div>
                        <div class="modal-body">
                            Unfortunately at this time can only select 5 coins.<br>
                            Please unselect a coin:<br><br>
    
                            <input class="form-check-input" type="checkbox" checked role="switch" data-bs-dismiss="modal" id="firstSelectedCoin">
                            <label id="firstCoinPlaceHolder" for="firstSelectedCoin"></label><br>

                            <input class="form-check-input" type="checkbox" checked role="switch" data-bs-dismiss="modal" id="secondSelectedCoin">
                            <label id="secondCoinPlaceHolder" for="secondSelectedCoin"></label><br> 

                            <input class="form-check-input" type="checkbox" checked role="switch" data-bs-dismiss="modal" id="thirdSelectedCoin">
                            <label id="thirdCoinPlaceHolder" for="thirdSelectedCoin"></label><br>

                            <input class="form-check-input" type="checkbox" checked role="switch" data-bs-dismiss="modal" id="fourthSelectedCoin">
                            <label id="fourthCoinPlaceHolder" for="fourthSelectedCoin"></label><br>

                            <input class="form-check-input" type="checkbox" checked role="switch" data-bs-dismiss="modal" id="fifthSelectedCoin">
                            <label id="fifthCoinPlaceHolder" for="fifthSelectedCoin"></label><br>

                            <input class="form-check-input" type="checkbox" checked role="switch" data-bs-dismiss="modal" id="sixthSelectedCoin">
                            <label id="sixthCoinPlaceHolder" for="sixthSelectedCoin"></label><br>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">`;

        for (let coin of coinsArray) {
            // HTML Card featuring asked params
            html += `
                    <div class="col card mb-3 border border-0 bg-transparent" style="max-width: 540px;">
                        <div class="row g-0">

                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="switch${coin.symbol}">
                                <label class="form-check-label" for="switch${coin.symbol}">Add ${coin.symbol} to report</label>
                            </div>

                            <div class="col-md-4">
                                <label for="switch${coin.symbol}">
                                    <img src="${coin.image}" class="img-fluid rounded-start" alt="image broken...">
                                </label>
                            </div>

                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${coin.name}</h5>
                                    <p class="card-text">${coin.symbol}</p>
                                    <p class="card-text"><small class="text-body-secondary" id="coinFetchDateAndTime${coin.id}">Last updated:<br>${getMostRelevantFetchDateAndTime(coin.id)}</small></p>
                                        <button class="btn btn-primary priceButton" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseExample" id="buttonTogglePrice${coin.id}">
                                            <span class="spinner-border spinner-border-sm visually-hidden" role="status" aria-hidden="true" id="spinner${coin.id}"></span>
                                            <span class="visually-hidden" id=spinnerLabel${coin.id}>Loading...</span>
                                            <span class="" id=spinnerMainLabel${coin.id}>More Info</span>
                                        </button>
                                    </p>
                                    <div class="collapse" id="collapse${coin.id}">
                                        <div class="card card-body bg-transparent border-0">
                                            <div id="coinPricePlaceHolderUSD${coin.id}">
                                                $<br>
                                            </div>
                                            <div id="coinPricePlaceHolderEUR${coin.id}">
                                                &#8352;<br>
                                            </div>
                                            <div id="coinPricePlaceHolderILS${coin.id}">
                                                &#8362;<br>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        }

        // if coinsArray is empty show a nice image
        if (coinsArray.length == 0) { html += `<img src="assets/noCoinsFound.jpg">` };

        html += `</div>`;
        mainContentContainer.innerHTML = html;

        // add event listeners to all buttons on every load and add checked attribute to selected coins
        addEventListenersToCheckBoxButtons();
        addEventListenersToPriceButtons();
        // check if coin is saved as a selected coin in session storage and add "checked" attribute to checked coins
        addCheckedAttributeToSelectedCoins(coinsArray);
    }

    // Function adds "checked" attribute to selected coins when coins are displayed
    function addCheckedAttributeToSelectedCoins(coinsArray) {
        let selectedCoins = sessionStorage.getItem("selectedCoins");
        if (selectedCoins) { selectedCoins = JSON.parse(selectedCoins) }
        else { selectedCoins = [] };
        for (let coin of coinsArray) {
            setTimeout(() => {
                if ((selectedCoins.indexOf(`${coin.symbol}`) > -1)) {
                    document.getElementById(`switch${coin.symbol}`).setAttribute("checked", "checked");
                }
            }, 0);

        }
    }

    // Function filters new coinsArray according to `searchField` input and calls for a display
    async function filterAndDisplayCoins(str) {
        str = str.toLowerCase();
        // Fetch data from API if data hasn't been fetched yet 
        if (!sessionStorage.getItem("coins")) {
            await getSaveAndDisplayCoins();
        }
        let coinsArray = JSON.parse(sessionStorage.getItem("coins"));
        let cloneOfCoinsArray = [...coinsArray];

        cloneOfCoinsArray = coinsArray.map(coin => {
            coin.name = coin.name.toLowerCase();
        })
        cloneOfCoinsArray = coinsArray.filter(coin => {
            return coin.name.indexOf(str) > -1 || coin.symbol.indexOf(str) > -1 // coin.id.indexOf(str) > -1 
        });
        displayCoins(cloneOfCoinsArray);
    }

    // Function updates selected coins to session storage
    function updateSelectedCoins(id) {
        let coinsSavedInStorage = [];

        // If there is data in session storage for selected coins, reboot instrumental variables accordingly
        if (sessionStorage.getItem("selectedCoins")) {
            coinsSavedInStorage = JSON.parse(sessionStorage.getItem("selectedCoins"));
        }
        // If there aren't any coins saved in storage(no coins selected) create coins array and push first id to array
        if (!coinsSavedInStorage) {
            coinsSavedInStorage.push(id);
            sessionStorage.setItem("selectedCoins", JSON.stringify(coinsSavedInStorage));
        }
        // If id appears in array - remove it
        if (coinsSavedInStorage.indexOf(id) > -1) {
            coinsSavedInStorage.splice(coinsSavedInStorage.indexOf(id), 1);
        }
        // else add it
        else {
            coinsSavedInStorage.push(id);
        }

        // update storage
        sessionStorage.setItem("selectedCoins", JSON.stringify(coinsSavedInStorage));
        // adjust `Reports` in navbar
    }

    // Function checks if amount of selected coins is surpassed and displays modal accordingly
    function checkSelectedCoinsAmount() {

        let selectedCoins = JSON.parse(sessionStorage.getItem("selectedCoins"));
        // if max allowed coin limit is surpassed: set params to be shown in modal, add event listeners to params container elements and trigger modal
        if (selectedCoins.length === selectedCoinsTopLimit) {
            const selectedCoins = JSON.parse(sessionStorage.getItem("selectedCoins"));
            // set the names to be displayed for selected coins in modal 
            document.getElementById("firstCoinPlaceHolder").innerHTML = selectedCoins[0];
            document.getElementById("secondCoinPlaceHolder").innerHTML = selectedCoins[1];
            document.getElementById("thirdCoinPlaceHolder").innerHTML = selectedCoins[2];
            document.getElementById("fourthCoinPlaceHolder").innerHTML = selectedCoins[3];
            document.getElementById("fifthCoinPlaceHolder").innerHTML = selectedCoins[4];
            document.getElementById("sixthCoinPlaceHolder").innerHTML = selectedCoins[5];

            // add event listeners to all checkboxes
            document.getElementById("firstSelectedCoin").addEventListener("change", () => {
                updateSelectedCoins(document.getElementById("firstCoinPlaceHolder").innerHTML);
                adjustReportsLink();
                displayCoins(JSON.parse(sessionStorage.getItem("coins")));
            });
            document.getElementById("secondSelectedCoin").addEventListener("change", () => {
                updateSelectedCoins(document.getElementById("secondCoinPlaceHolder").innerHTML);
                adjustReportsLink();
                displayCoins(JSON.parse(sessionStorage.getItem("coins")));
            });
            document.getElementById("thirdSelectedCoin").addEventListener("change", () => {
                updateSelectedCoins(document.getElementById("thirdCoinPlaceHolder").innerHTML);
                adjustReportsLink();
                displayCoins(JSON.parse(sessionStorage.getItem("coins")));
            });
            document.getElementById("fourthSelectedCoin").addEventListener("change", () => {
                updateSelectedCoins(document.getElementById("fourthCoinPlaceHolder").innerHTML);
                adjustReportsLink();
                displayCoins(JSON.parse(sessionStorage.getItem("coins")));
            });
            document.getElementById("fifthSelectedCoin").addEventListener("change", () => {
                updateSelectedCoins(document.getElementById("fifthCoinPlaceHolder").innerHTML);
                adjustReportsLink();
                displayCoins(JSON.parse(sessionStorage.getItem("coins")));
            });
            document.getElementById("sixthSelectedCoin").addEventListener("change", () => {
                updateSelectedCoins(document.getElementById("sixthCoinPlaceHolder").innerHTML);
                adjustReportsLink();
                displayCoins(JSON.parse(sessionStorage.getItem("coins")));
            });

            //THIS IS SAVE BUTTONS EVENT LISTENER IN CASE NEEDED LATER
            // document.getElementById("modalSaveButton").addEventListener("click", () => { displayCoins(JSON.parse(sessionStorage.getItem("coins"))) });

            // trigger modal
            document.getElementById("buttonSwitchModal").click();
        }
    }

    // Function adjusts Reports link in navbar according to selected coins
    function adjustReportsLink() {
        let element = document.getElementById("reportsPageLink");
        let coins = sessionStorage.getItem("coins");
        let selectedCoins = sessionStorage.getItem("selectedCoins");

        let html = `Reports`;

        if (selectedCoins) {
            selectedCoins = JSON.parse(selectedCoins);
            coins = JSON.parse(coins);

            for (const coin of selectedCoins) {
                html += `<img src="${coins[coins.indexOf(coins.find(element => element.symbol == coin))].image}" style="width: 20px;padding-left: 5px;">`;

            }
        }
        element.innerHTML = html;
    }

    // Function returns json of a specific coin
    async function getSpecificCoinJson(coinName) {
        return (await fetch(`https://api.coingecko.com/api/v3/coins/${coinName}`)).json();
    }

    // Function displays coin price in USD, EUR and ILS from session storage or API data
    async function displaySpecificCoinPrice(coinName) {

        const selectedCoin = JSON.parse(sessionStorage.getItem(`${coinName}`));
        const usdValuePlaceholder = document.getElementById(`coinPricePlaceHolderUSD${coinName}`);
        const eurValuePlaceholder = document.getElementById(`coinPricePlaceHolderEUR${coinName}`);
        const ilsValuePlaceholder = document.getElementById(`coinPricePlaceHolderILS${coinName}`);

        const spinnerPlaceHolder = document.getElementById(`spinner${coinName}`);
        const spinnerLabelPlaceHolder = document.getElementById(`spinnerLabel${coinName}`);
        const spinnerMainLabel = document.getElementById(`spinnerMainLabel${coinName}`);
        const coinFetchDateAndTime = document.getElementById(`coinFetchDateAndTime${coinName}`);

        const buttonTogglePrice = document.getElementById(`buttonTogglePrice${coinName}`);
        buttonTogglePrice.setAttribute("href", `#collapse${coinName}`);



        // if selected coin has already been fetched and fetch time is relevant, display it 
        if (selectedCoin && isCoinFetchTimeRelevant(coinName)) {
            usdValuePlaceholder.innerHTML = `${selectedCoin.market_data.current_price.usd} $`;
            eurValuePlaceholder.innerHTML = `${selectedCoin.market_data.current_price.eur} &#8352;`;
            ilsValuePlaceholder.innerHTML = `${selectedCoin.market_data.current_price.ils} &#8362;`;
            // toggle collapse
            buttonTogglePrice.click();
        }
        // else trigger spinner --> fetch data --> save fetch time and coin data to session storage --> display data
        else {

            // toggle spinner on
            spinnerPlaceHolder.classList.toggle("visually-hidden");
            spinnerLabelPlaceHolder.classList.toggle("visually-hidden");
            spinnerMainLabel.classList.toggle("visually-hidden");

            // await data and display when ready
            const coin = await getSpecificCoinJson(coinName);
            usdValuePlaceholder.innerHTML = `${coin.market_data.current_price.usd} $`;
            eurValuePlaceholder.innerHTML = `${coin.market_data.current_price.eur} &#8352;`;
            ilsValuePlaceholder.innerHTML = `${coin.market_data.current_price.ils} &#8362;`;

            // toggle spinner off and open collapse
            spinnerPlaceHolder.classList.toggle("visually-hidden");
            spinnerLabelPlaceHolder.classList.toggle("visually-hidden");
            spinnerMainLabel.classList.toggle("visually-hidden");
            buttonTogglePrice.click();

            // save coin data and fetch time to session storage
            sessionStorage.setItem(`${coinName}`, JSON.stringify(coin));
            const date = (new Date).toLocaleString();
            sessionStorage.setItem(`fetchTime${coinName}`, JSON.stringify(date));
            coinFetchDateAndTime.innerHTML = `Last updated:<br>${date}`;
        }
    }

    // Function adds event listeners to all "more info" price buttons
    function addEventListenersToPriceButtons() {
        const buttons = document.getElementsByClassName("priceButton");
        for (const button of buttons) {
            button.addEventListener("click", () => displaySpecificCoinPrice(button.id.substring(17)));
        }

    }

    // Function returns true if coin data was fetched less than 2 minutes ago; else returns false 
    function isCoinFetchTimeRelevant(coinName) {
        const coinFetchTime = new Date(JSON.parse(sessionStorage.getItem(`fetchTime${coinName}`)));
        const currentDateTime = new Date;
        if (coinFetchTime.getMinutes() === 59 && currentDateTime.getMinutes() === 0) { return true };
        return Math.abs(coinFetchTime.getMinutes() - currentDateTime.getMinutes()) < 2 ? true : false;
    }

    // Function returns most relevant fetch time from session storage
    // (the time all coins were fetched or the time a specific coin was fetched from "More info button")
    function getMostRelevantFetchDateAndTime(coinName) {
        if (sessionStorage.getItem(`fetchTime${coinName}`)) { return JSON.parse(sessionStorage.getItem(`fetchTime${coinName}`)) };
        return JSON.parse(sessionStorage.getItem("dateAndTime"));
    }


    // ------------------------------------------------------- FUNCTIONS RELATED TO  REPORT -----------------------------------------------------------

    // Function loads report page
    function loadReportPage() {
        mainContentContainer.innerHTML = `
        <h2>Reports Page</h2><h2 id="errorMsgHeading">Please select some coins before visiting this page!🥴</h2>
        <div id="chartContainer" style="height: 370px; width: 100%;"></div>`;

        let arrayOfSelectedCoins = sessionStorage.getItem("selectedCoins");
        if (arrayOfSelectedCoins) {
            arrayOfSelectedCoins = JSON.parse(arrayOfSelectedCoins);
            // if there are selected coins: remove error msg and start canvas  
            if (arrayOfSelectedCoins.length != 0) {
                const upper = arrayOfSelectedCoins.map(element => { return element.toUpperCase(); });
                setTimeout(() => startCanvas(upper), 0);
                setTimeout(() => document.getElementById("errorMsgHeading").remove(), 0);
            }
            // else remove canvas
            else { setTimeout(() => document.getElementById("chartContainer").remove(), 0); }
        }
    }

    // Function prints prices from ArrayOfSelected coins to canvas every two second if user is still on reports page   
    function startCanvas(arrayOfSelectedCoins) {

        const chartUpdateInterval = 2000; // how often the chart updates in milliseconds
        let coin1DataPoints = [];
        let coin2DataPoints = [];
        let coin3DataPoints = [];
        let coin4DataPoints = [];
        let coin5DataPoints = [];

        const time = new Date;
        time.setMilliseconds(0);

        const options = { // canvas settings
            axisX: {
                title: "chart updates every 2 secs"
            },
            axisY: {
                suffix: "$"
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "top",
                fontSize: 22,
                fontColor: "dimGrey",
            },
            data: [{
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###. $",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,//(top of chart)
                name: "Coin 1",
                dataPoints: coin1DataPoints
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###. $",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,//(top of chart)
                name: "Coin 2",
                dataPoints: coin2DataPoints
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###. $",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,//(top of chart)
                name: "Coin 3",
                dataPoints: coin3DataPoints
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###. $",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,//(top of chart)
                name: "Coin 4",
                dataPoints: coin4DataPoints
            }, {
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "###. $",
                xValueFormatString: "hh:mm:ss TT",
                showInLegend: true,//(top of chart)
                name: "Coin 5",
                dataPoints: coin5DataPoints
            },
            ]
        };

        $("#chartContainer").CanvasJSChart(options);
        async function updateChart() {

            time.setTime(time.getTime() + chartUpdateInterval);

            // get the current prices:
            const yValue = (await getDataForReportsPage(arrayOfSelectedCoins));

            if (arrayOfSelectedCoins.length === 1) {
                const val1 = yValue[arrayOfSelectedCoins[0]].USD;
                coin1DataPoints.push({ x: time.getTime(), y: val1 });
                options.data[0].legendText = `${arrayOfSelectedCoins[0]}: ${val1} $`;
            }
            else if (arrayOfSelectedCoins.length === 2) {
                const val1 = yValue[arrayOfSelectedCoins[0]].USD;
                const val2 = yValue[arrayOfSelectedCoins[1]].USD;
                coin1DataPoints.push({ x: time.getTime(), y: val1 });
                coin2DataPoints.push({ x: time.getTime(), y: val2 });
                options.data[0].legendText = `${arrayOfSelectedCoins[0]}: ${val1} $`;
                options.data[1].legendText = `${arrayOfSelectedCoins[1]}: ${val2} $`;
            }
            else if (arrayOfSelectedCoins.length === 3) {
                const val1 = yValue[arrayOfSelectedCoins[0]].USD;
                const val2 = yValue[arrayOfSelectedCoins[1]].USD;
                const val3 = yValue[arrayOfSelectedCoins[2]].USD;
                coin1DataPoints.push({ x: time.getTime(), y: val1 });
                coin2DataPoints.push({ x: time.getTime(), y: val2 });
                coin3DataPoints.push({ x: time.getTime(), y: val3 });
                options.data[0].legendText = `${arrayOfSelectedCoins[0]}: ${val1} $`;
                options.data[1].legendText = `${arrayOfSelectedCoins[1]}: ${val2} $`;
                options.data[2].legendText = `${arrayOfSelectedCoins[2]}: ${val3} $`;
            }
            else if (arrayOfSelectedCoins.length === 4) {
                const val1 = yValue[arrayOfSelectedCoins[0]].USD;
                const val2 = yValue[arrayOfSelectedCoins[1]].USD;
                const val3 = yValue[arrayOfSelectedCoins[2]].USD;
                const val4 = yValue[arrayOfSelectedCoins[3]].USD;
                coin1DataPoints.push({ x: time.getTime(), y: val1 });
                coin2DataPoints.push({ x: time.getTime(), y: val2 });
                coin3DataPoints.push({ x: time.getTime(), y: val3 });
                coin4DataPoints.push({ x: time.getTime(), y: val4 });
                options.data[0].legendText = `${arrayOfSelectedCoins[0]}: ${val1} $`;
                options.data[1].legendText = `${arrayOfSelectedCoins[1]}: ${val2} $`;
                options.data[2].legendText = `${arrayOfSelectedCoins[2]}: ${val3} $`;
                options.data[3].legendText = `${arrayOfSelectedCoins[3]}: ${val4} $`;
            }
            else {
                const val1 = yValue[arrayOfSelectedCoins[0]].USD;
                const val2 = yValue[arrayOfSelectedCoins[1]].USD;
                const val3 = yValue[arrayOfSelectedCoins[2]].USD;
                const val4 = yValue[arrayOfSelectedCoins[3]].USD;
                const val5 = yValue[arrayOfSelectedCoins[4]].USD;
                coin1DataPoints.push({ x: time.getTime(), y: val1 });
                coin2DataPoints.push({ x: time.getTime(), y: val2 });
                coin3DataPoints.push({ x: time.getTime(), y: val3 });
                coin4DataPoints.push({ x: time.getTime(), y: val4 });
                coin5DataPoints.push({ x: time.getTime(), y: val5 });
                options.data[0].legendText = `${arrayOfSelectedCoins[0]}: ${val1} $`;
                options.data[1].legendText = `${arrayOfSelectedCoins[1]}: ${val2} $`;
                options.data[2].legendText = `${arrayOfSelectedCoins[2]}: ${val3} $`;
                options.data[3].legendText = `${arrayOfSelectedCoins[3]}: ${val4} $`;
                options.data[4].legendText = `${arrayOfSelectedCoins[4]}: ${val5} $`;
            }

            let tab = document.getElementById("chartContainer");
            // if element exists(user still on reports page) continue printing and updating data
            if (tab) { $("#chartContainer").CanvasJSChart().render(); }
            // else stop interval
            else { clearInterval(myInt); }
        }

        updateChart(1);
        const myInt = setInterval(() => { updateChart() }, chartUpdateInterval,);
    }

    // Function returns data from API according to given array of coins  
    async function getDataForReportsPage(arrayOfSelectedCoins) {
        let response;
        if (arrayOfSelectedCoins.length === 1) {
            response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arrayOfSelectedCoins[0]}&tsyms=USD`);
        }
        else if (arrayOfSelectedCoins.length === 2) {
            response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arrayOfSelectedCoins[0]},${arrayOfSelectedCoins[1]}&tsyms=USD`);
        }
        else if (arrayOfSelectedCoins.length === 3) {
            response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arrayOfSelectedCoins[0]},${arrayOfSelectedCoins[1]},${arrayOfSelectedCoins[2]}&tsyms=USD`);
        }
        else if (arrayOfSelectedCoins.length === 4) {
            response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arrayOfSelectedCoins[0]},${arrayOfSelectedCoins[1]},${arrayOfSelectedCoins[2]},${arrayOfSelectedCoins[3]}&tsyms=USD`);
        }
        else if (arrayOfSelectedCoins.length === 5) {
            response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arrayOfSelectedCoins[0]},${arrayOfSelectedCoins[1]},${arrayOfSelectedCoins[2]},${arrayOfSelectedCoins[3]},${arrayOfSelectedCoins[4]}&tsyms=USD`);
        }
        else {//no coins were selected
            alert("select a coin fat ass")
        }
        const info = await response.json();
        return info;
    }

    // -------------------------------------------------------- FUNCTIONS RELATED TO ABOUT US ---------------------------------------------------------

    // Function loads about us page
    function loadAboutUsPage() {
        mainContentContainer.innerHTML = `
        <div class="fs-5 col-sm-12 col-md-8 col-lg-6">
  
        <img class="col-sm-12 col-md-12 col-lg-6 img-thumbnail rounded float-start col-4 me-4 mb-b" src="assets/me.jpg" >
        <h2>Hi there!</h2>
        
        <p>I'm Alexander, a 23 year old junior web developer,
        An information systems analyst, And an athlete.</p>
        <p>A short summary of the project:</p>

        <p>I've called this project <i>\'Crypto World\'</i>. It's a client-side only web page that I've built as a project
        that summarizes the HTML-CSS-JS part of my studies at <i>\'John Bryce Academy\'</i>.</p>

        <p><i>\'Crypto World\'</i> calls an API that returns current data of the 100 most popular crypto coins and saves
        them to session storage. From the saved data(which is its one source of truth) it later displays said coins
        and allows the user to select and filter coins. All of which is possible via dynamic HTML and my own JS.</p>
        
        <p>Enjoy my website and make sure to check out the \`Reports\` page before you leave!</p></dov>`
    }


    // -------------------------------------------------------- FUNCTIONS RELATED TO MAIN PAGE ---------------------------------------------------------

    // Function loads Main page
    function loadMainPage() {
        mainContentContainer.innerHTML = `<h2>Hi there!<br>And welcome to my crypto website,<br>please choose a page to go from the navbar or search a coin</h2>`
    }
})();
