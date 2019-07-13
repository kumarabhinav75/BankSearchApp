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

//add event listeners
selectCity.addEventListener("change", (e) => handleCitySelect(e.target.value));
searchBar.addEventListener("input", (e) => handleSearchInput(e.target.value.toUpperCase()));
prevButton.addEventListener("click", () => previousPage());
nextButton.addEventListener("click", () => nextPage());
pageSizeSelector.addEventListener("change", (e) => handlePageSizeChange(e.target.value));


//global data
let finalBankData=[];
let filteredData=[];

//when app loads, hide loader and bankTable
loader.style.display = 'none';
bankDataContainer.style.display = 'none';

//start thinking how to paginate

let currPage;
let pageSize = 250;
let startIndex;
let pagesCount;

// In newPagination, reset the indices and counts;
//then paginate data
const newPagination = (data) => {
    currPage = 1;
    startIndex = 0;
    paginate(data);
}

//here, currPage can never go out of bounds
const previousPage = () => {
    currPage -= 1;
    startIndex -= pageSize;
    paginate(filteredData);
    window.scrollTo(0,0);
}

const nextPage = () => {
    currPage += 1;
    startIndex += 1;
    paginate(filteredData);
    window.scroll(0,0);
}

//this function will take data and chunkify it based on pageSize.
//Then it will call renderTable function with segmented data to render;
const paginate = (data) => {
    pagesCount = Math.ceil(data.length/pageSize);

    //message to show page number
    pageNumberContainer.textContent = `Page ${currPage} of ${pagesCount}`;
    
    //edge conditions for currPage
    if(currPage < 1) {currPage = 1};
    if(currPage > pagesCount) {currPage = pagesCount};

    //hide or show buttons according to currPage
    prevButton.style.visibility = (currPage === 1) ? 'hidden' : 'visible';
    nextButton.style.visibility = (currPage === pagesCount) ? 'hidden' : 'visible';

    if(currPage === pagesCount){
        renderTable(data.slice(pageSize*(pagesCount-1)));   //handled last page differently
    }else{
        renderTable(data.slice(startIndex,startIndex+pageSize));    //slice the array to segment based on index
    }
}
 
//handle city dropdown selection
const handleCitySelect = async (cityName) => {
    //show loader and hide table
    bankDataContainer.style.display = 'none';
    loader.style.display = '';

    //check for cached response
    const data = await cachingResponseFromFetch(cityName);
    finalBankData = data;
    filteredData = finalBankData;
    pagesCount = Math.ceil(finalBankData.length/pageSize);
    newPagination(filteredData);

    //hide loader and show table
    loader.style.display = 'none';
    bankDataContainer.style.display = '';
}

const handlePageSizeChange = (size) => {
    pageSize = size;
    newPagination(filteredData);
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
