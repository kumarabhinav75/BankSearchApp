const selectCityContainer = document.getElementById("select-city");
const bankDataContainer = document.getElementById("bank-data");
const loader = document.querySelector(".loader");
const selectCity = document.getElementById("select-city-from");
const bankTable = document.getElementById("bank-table");
const searchBar = document.getElementById("search-text");
const prevButton = document.getElementById("prev-page-btn");
const nextButton = document.getElementById("next-page-btn");
const pageNumberContainer = document.getElementById('page-number');
const pageSizeSelector = document.getElementById('page-size');

selectCity.addEventListener("change", (e) => handleCitySelect(e.target.value));
searchBar.addEventListener("input", (e) => handleSearchInput(e.target.value.toUpperCase()));


//handle city dropdown selection
const handleCitySelect = (cityName) => {
    //show loader and hide table
    bankDataContainer.style.display = 'none';
    loader.style.display = '';


}
//start thinking how to paginate

let currPage;
let pageSize = 250;
let startIndex;
let pagesCount;

const previousPage = () => {

}

const nextPage = () => {

}

const paginate = () => {

}
 