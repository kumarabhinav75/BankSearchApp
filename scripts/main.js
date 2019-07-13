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
bankTable.addEventListener("mousedown",(e) => handleRowPress(e.target));

//initialize fav-bank in sessionStorage
const favBankKey = 'fav-banks';
const favBankData = [];
sessionStorage.setItem(favBankKey,JSON.stringify(favBankData));

//global data for table
let finalBankData=[];
let filteredData=[];

//when app loads, hide loader and bankTable
loader.style.display = 'none';
bankDataContainer.style.display = 'none';

//global data for pagination
let currPage;
let pageSize = 250;   //can be chosen by user #todo
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
    startIndex += pageSize;
    paginate(filteredData);
    window.scrollTo(0,0);
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
    console.log({currPage,startIndex,pageSize, pagesCount});
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

//set the size to global variable and call newPagination with filteredData
const handlePageSizeChange = (size) => {
    pageSize = parseInt(size);
    newPagination(filteredData);
}

// search against all fields
// indexOf returns -1 for no result
// to search accross 4 fields, add all indexOfs and check if value > -4? to match rows
const handleSearchInput = (value) => {
    filteredData = finalBankData.filter((bank) => {
        const { ifsc,address,bank_name, branch } = bank;
        const ifscIndex = ifsc.indexOf(value);
        const addressIndex = address.indexOf(value);
        const nameIndex = bank_name.indexOf(value);
        const branchIndex = branch.indexOf(value);
        const totalIndex  = ifscIndex+addressIndex+nameIndex+branchIndex;
        return totalIndex > -4? true:false; //just checks if total sum >-4 (will be if any of searches give >-1)
    });
    newPagination(filteredData);
}

//this function will make api call and cache it for next time.
const cachingResponseFromFetch = async (cityName) => {
    // Use the cityName as the cache key to sessionStorage
    const cacheKey = cityName;
    const url = `https://vast-shore-74260.herokuapp.com/banks?city=${cityName}`;

    //stored as string, so JSON.parse
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

const handleRowPress = (tableRow) => {
    const rowChildren = tableRow.parentElement.children;
    let rowDataArr = [];
    for(let i=0;i<rowChildren.length;i++){
        rowDataArr.push(rowChildren[i].innerHTML);
    }
    rowDataArr = rowDataArr.slice(1);
    const rowObj = new rowData(...rowDataArr);
    cacheFavouriteBank(rowObj);
}

//constructor function to create row Objects
const rowData = function(ifsc,bankName,branch,address){
    this.ifsc=ifsc;
    this.bankName=bankName;
    this.branch=branch;
    this.address=address;
}

//
const cacheFavouriteBank = (rowObj) => {
    const favBankData = JSON.parse(sessionStorage.getItem(favBankKey));
    favBankData.push(rowObj);
    sessionStorage.setItem(favBankKey,JSON.stringify(favBankData));
}