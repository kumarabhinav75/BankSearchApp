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
prevButton.addEventListener("click", () => previousPage());
nextButton.addEventListener("click", () => nextPage());
pageSizeSelector.addEventListener("change", (e) => handlePageSizeChange(e.target.value));


//handle city dropdown selection
const handleCitySelect = (cityName) => {
    //show loader and hide table
    bankDataContainer.style.display = 'none';
    loader.style.display = '';
    const data = await cachingResponseFromFetch(cityName);
    finalBankData = data;           //storing globally
    filteredData = finalBankData;   //storing globally
    pagesCount = Math.ceil(finalBankData.length/pageSize);


}


//start thinking how to paginate

let currPage;
let pageSize = 250;
let startIndex;
let pagesCount;

const newPagination = (data) => {
    currPage = 1;
    startIndex = 0;
    paginate(data);
}
//here, currPage can never go out of bounds
const previousPage = () => {
    currPage-=1;
    startIndex-=pageSize;
    paginate(filteredData);
    window.scrollTo(0,0);
}

const nextPage = () => {

}

const paginate = () => {

}
 

//this function will make api call and cache it for next time.
const cachingResponseFromFetch = (cityName) => {
    // Use the URL as the cache key to sessionStorage
    const cacheKey = cityName;
    const url = `https://vast-shore-74260.herokuapp.com/banks?city=${cityName}`;

    // START new cache HIT code
    const cached = JSON.parse(sessionStorage.getItem(cacheKey));
    if (cached !== null) {
      // it was in sessionStorage! Yay!
        return cached;
    }

    return fetch(url)
        .then(async (response) => {
            const res = await response.json();
            sessionStorage.setItem(cacheKey, JSON.stringify(res))
            return res;
            })

}

//function to render table with array of objects.
const renderTable = (data) => {
    const bankData = data;
    const bankTableData = [`<tr>
        <th>Index</th>
        <th>IFSC</th>
        <th>Bank Name</th>
        <th>Branch Name</th>
        <th>Address</th>
        </tr>`].concat(
                    bankData.map((bank,index) => {
                        const {ifsc,address,bank_name, branch} = bank;
                        return (
                            `
                            <tr>
                                <td>${index+1}</td>
                                <td>${ifsc}</td>
                                <td>${bank_name}</td>
                                <td>${branch}</td>
                                <td>${address}</td>
                            </tr>`
                        )
                    })
        );

    bankTable.innerHTML = bankTableData.join('');
}
