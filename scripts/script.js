const months = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];
  const favouriteList = []

function onInit(){
    const filters = []
    if(localStorage.getItem('favourites')){
        favouriteList.push(...JSON.parse(localStorage.getItem('favourites')))
    }

    getVehicles()
    .then(data => {
        let searchInterval;
        let cities = data.offers.reduce((acc, curr) => {
            if (!acc.includes(curr.miasto))
            acc.push(curr.miasto)
            return acc;
        }, [])

        cities.forEach(ele => {
            const option = `<option value='${ele}'>${ele}</option>`
            $("#city-sort").append($(option))
        })

        $('.filters--checkbox :checkbox').change(function() {
            toggleFilter($(this).val(), filters)
            filterList(data.offers, favouriteList, filters)
        });
        $('.select-sort select').change(function(){
            toggleFilter($(this).attr('id'), filters, $(this).val())
            filterList(data.offers, favouriteList, filters)
        })
        $('#search').on('input', function(){
            const searchValue = $(this).val();
            clearTimeout(searchInterval);
            searchInterval = setTimeout(function (){
                toggleFilter('search', filters, searchValue),
                filterList(data.offers, favouriteList, filters)
            }, 500)
        })
  
        data.offers.forEach(ele => {
            createVehicleCard(ele)
        })
    })
    .catch(err => {
        console.error('Coś poszło nie tak', err);
    });
}

function filterList(data, favourites, filters = []){
    $(".vehicle-list").empty();
    let filteredData = data.slice()
    if (filters.some(e => e.name === 'available')){
        filteredData = filteredData.filter( ele => {
            return ele.in_stock === 1
        })
    }
    if (filters.some(e => e.name === 'autobox')){
        filteredData = filteredData.filter( ele => {
            return ele.offer_details.skrzynia_automatyczna === true
        })
    }
    if (filters.some(e => e.name === 'favourites')){
        filteredData = filteredData.filter( ele => {
            return favourites.includes(ele.id_angebot) ? ele : null
        })
    }
    if (filters.some(e => e.name === 'price-sort')){
        const sortType = filters[filters.findIndex(ele => ele.name === 'price-sort')].value
        filteredData = filteredData.sort( (a, b) => {
            return sortType === "asc" ? a.car_price_disc - b.car_price_disc : b.car_price_disc - a.car_price_disc
            
        })
    }
    if (filters.some(e => e.name === 'city-sort')){
        const citySort = filters[filters.findIndex(ele => ele.name === 'city-sort')].value
        filteredData = filteredData.filter( ele => {
            return ele.miasto === citySort
        })
    }
    if (filters.some(e => e.name === 'search')){
        const searchValue = filters[filters.findIndex(ele => ele.name === 'search')].value.toLowerCase()
        filteredData = filteredData.filter( ele => {
            return ele.offer_details.model_details.toLowerCase().includes(searchValue)
        })
    }
    if (filters.length === 0) {
        filteredData = data;
    }

    filteredData.forEach(ele => {
        createVehicleCard(ele)
    })

}

async function getVehicles(){
    try {
        const response = await fetch('https://gx.pandora.caps.pl/zadania/api/offers2023.json');
        if (!response.ok) {
            throw new Error('Coś poszło nie tak');
          }
            const data = await response.json();
            return data;
    } catch (err) {
            console.log('Coś poszło nie tak', err)
            return null
    }
}

function toggleFilter(name, arr, value = false){
    const index = arr.findIndex(ele => ele.name === name);
    if (index !== -1) {
        if (arr[index].value === true || !value){
            arr.splice(index,1)
        } else {
            arr[index].value = value
        }
    } else {
        arr.push({
            name: name,
            value: value ? value : true
        })
    }
}

function toggleArray(ele, arr){
    const index = arr.indexOf(ele)
    if (index !== -1){
        arr.splice(index,1)
    } else {
        arr.push(ele)
    }
}

function addFavourite(id, e){
    toggleArray(id, favouriteList)
    e.target.classList.toggle("favourite-isFaved")
    localStorage.setItem("favourites", JSON.stringify(favouriteList))
}

function createVehicleCard(ele){
    const dateObj = new Date(ele.pdd)
    const validYear = dateObj.getFullYear();
    const validMonth = months[dateObj.getMonth()]
    const netto = ele.car_price_disc.toLocaleString("pl-PL", {
        style: "decimal",
      }).replace(/,00$/, "");
      const brutto = ele.total_gross_price.toLocaleString("pl-PL", {
        style: "decimal",
      }).replace(/,00$/, "");
    const vehicleCard = `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-3 "> 
        <div class="vehicle-card pt-5 pb-4 px-4 text--white text-center">
            <div class="favourite">
                <svg class="favourite-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path class="favourite-outline" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"/>
                    <path onclick="addFavourite(${ele.id_angebot}, event)" class="favourite-fill ${favouriteList.includes(ele.id_angebot) ? 'favourite-isFaved' : ''}" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,5.5"/>
                </svg>
            </div>
            <div class="d-flex flex-column justify-content-between h-100">
                <div class="d-flex flex-column">
                    <p class="font--18 mb-1 fw-bold">${(ele.offer_details.model_details).toUpperCase()}</p>
                    <p class="mb-2">${(ele.offer_details.kabina).toUpperCase()}</p>
                    <p class="font--12 fw-light">${ele.in_stock ? 'Dostępny od ręki!' : ('Przewidywana data dostawy: ' + validMonth + ' ' + validYear + '*') }</p>
                </div>
                <div class="d-flex flex-column">
                    <img src='${ele.offer_details.image_paths.front}' alt='${ele.offer_details.model_details}' class="img-fluid"/>
                    <div class="d-flex justify-content-between mt-1">
                        <p class="mb-0 font--14 fw-light">Rok produkcji</p><strong class="font--14">${ele.pyear}</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p class="mb-0 font--14 fw-light">Skrzynia</p><strong class="font--14">${ele.offer_details.skrzynia_automatyczna ? "Automatyczna" : "Manualna"}</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                        <p class="mb-4 font--14 fw-light">Miasto</p><strong class="font--14">${ele.miasto}</strong>
                    </div>
                    <div class="d-flex justify-content-between line-height--19">
                        <p class="mb-0 font--14 fw-light">Cena netto</p><strong class="font--19">${(netto)}<span class="font--14 fw-light"> zł</span></strong>
                    </div>
                    <div class="d-flex justify-content-between  mb-4">
                        <p class="mb-0 font--14 fw-light">Cena brutto</p><strong class="font--14">${brutto}<span class="font--14 fw-light"> zł</span></strong>
                    </div>
                    <button class="btn-csh mx-auto">ZOBACZ OFERTĘ</button>
                </div>
            </div>
            
        </div>
    </div>
`;
$(".vehicle-list").append($(vehicleCard))
}

$(document).ready(onInit())
