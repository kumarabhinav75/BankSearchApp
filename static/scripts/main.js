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
const favouriteCheckbox = document.getElementById('fav-checkbox');

selectCity.addEventListener("change", (e) => handleCitySelect(e.target.value));
searchBar.addEventListener("input", (e) => handleSearchInput(e.target.value.toUpperCase()));
prevButton.addEventListener("click", () => previousPage());
nextButton.addEventListener("click", () => nextPage());
pageSizeSelector.addEventListener("change", (e) => handlePageSizeChange(e.target.value));
bankTable.addEventListener("mousedown",(e) => handleRowPress(e.target));
favouriteCheckbox.addEventListener("change", (e) => showOnlyFavBank())

const favBankKey = 'fav-banks-';
let favBankIFSC;

let finalBankData=[];
let filteredData=[];
const cityNames = ['BENGALURU','CHENNAI','DELHI','JAIPUR','MUMBAI']
let currCityName='';

let favouriteBanks;

loader.style.display = 'none';
bankDataContainer.style.display = 'none';

let currPage;
let pageSize = 250;
let startIndex;
let pagesCount;

const saveIFSC = (rowObj) => {
    const {ifsc} = rowObj;
    if(favBankIFSC.indexOf(ifsc)===-1){
        favBankIFSC.push(ifsc);
        return true;
    }else return false
}

const saveBankIFSC = (cityNameList) => {
    cityNameList.forEach((city) => {
        const bankData = JSON.parse(localStorage.getItem(favBankKey+city));
        bankData?
            bankData.forEach((bank) => saveIFSC(bank)):
            favBankIFSC = [];
    })
}

saveBankIFSC(cityNames);


const cacheFavouriteBank = (rowObj) => {
    let favBankData = JSON.parse(localStorage.getItem(favBankKey+currCityName));
    if(!favBankData){
        favBankData = [];
    }
    favBankData.push(rowObj);
    localStorage.setItem(favBankKey+currCityName,JSON.stringify(favBankData));
}

const newPagination = (data) => {   
    currPage = 1;
    startIndex = 0;
    paginate(data);
}

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

const currentPageBoundCheck = (currentPage) => {
    if(currentPage < 1) return 1;
    else if(currentPage > pagesCount) return pagesCount;
}

const paginate = (data) => {
    const pagesCountCopy = Math.ceil(data.length/pageSize);
    pagesCount = pagesCountCopy;
    currpage = currentPageBoundCheck(currPage);

    pageNumberContainer.textContent = `Page ${currPage} of ${pagesCount}`;
    prevButton.style.visibility = (currPage === 1) ? 'hidden' : 'visible';
    nextButton.style.visibility = (currPage === pagesCount) ? 'hidden' : 'visible';

    if(currPage === pagesCount){
        renderTable(data.slice(pageSize*(pagesCount-1)));
    }else{
        renderTable(data.slice(startIndex,startIndex+pageSize));
    }
}
 
const handleCitySelect = async (cityName) => {

    currCityName = cityName;
    saveBankIFSC(cityNames);

    favouriteCheckbox.checked = false;
    bankDataContainer.style.display = 'none';
    loader.style.display = '';

    const data = await fetchCityData(cityName);
    finalBankData = data;
    filteredData = finalBankData;
    pagesCount = Math.ceil(data.length/pageSize);
    newPagination(data);

    loader.style.display = 'none';
    bankDataContainer.style.display = '';
}

const handlePageSizeChange = (size) => {
    pageSize = parseInt(size);
    filteredData = (!favouriteCheckbox.checked)?
        finalBankData:
        favouriteBanks;
    newPagination(filteredData);
}

const handleSearchInput = (value) => {
    filteredData = (!favouriteCheckbox.checked)?
            finalBankData.filter((bank) => searchValueInTable(bank,value)):
            favouriteBanks.filter((bank) => searchValueInTable(bank,value));
    newPagination(filteredData);
}

const sumOfColumnSearchIndex = (a,b,c,d) => {
    return a+b+c+d;
}

const searchValueInTable = (bank,value) => {
    const { ifsc,address,bank_name, branch } = bank;
    const ifscIndex = ifsc.indexOf(value);
    const addressIndex = address.indexOf(value);
    const nameIndex = bank_name.indexOf(value);
    const branchIndex = branch.indexOf(value);
    const totalIndex  = sumOfColumnSearchIndex(ifscIndex,addressIndex,nameIndex,branchIndex);
    return totalIndex > -4? true:false;
};

const fetchCityData = (cityName) => {
    const cacheKey = cityName;
    const url = `https://vast-shore-74260.herokuapp.com/banks?city=${cityName}`;

    const cached = JSON.parse(localStorage.getItem(cacheKey));
    return  (cached)?
        cached:
        fetch(url)
            .then((response)=>response.json())
            .then((res) =>{
                localStorage.setItem(cacheKey, JSON.stringify(res));
                return res;
            })
}


const renderTable = (data) => {
    const bankData = data;
    const bankTableData = [`<tr>
        <th>Index</th>
        <th>IFSC</th>
        <th>Bank Name</th>
        <th>Branch Name</th>
        <th>Address</th>
        </tr>`]
            .concat(
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

const extractRowData = (element) => {
    const rowChildren = element.parentElement.children;
    return Array.from(rowChildren).map((ele) => ele.innerHTML).slice(1);
}

const handleRowPress = (element) => {
    const rowObj = new rowData(...extractRowData(element));
    if(saveIFSC(rowObj)){
        cacheFavouriteBank(rowObj);
    }
}

const rowData = function(ifsc,bankName,branch,address){
    this.ifsc=ifsc;
    this.bank_name=bankName;
    this.branch=branch;
    this.address=address;
}

const showOnlyFavBank = () => {
    searchBar.value="";
    if(favouriteCheckbox.checked){
        const favBanks = JSON.parse(localStorage.getItem(favBankKey+currCityName));
        if(favBanks) {
            favBanks.map((bank) => {
                saveIFSC(bank);
            });
            newPagination(favBanks);
            favouriteBanks = favBanks;
        }else{
            newPagination([{}]);
            favouriteBanks = [];
        }
        
    }else{
        newPagination(filteredData);
    }
}
