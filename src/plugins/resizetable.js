/** @TODO Code to be removed, most likely deprecated after the import of AutoTable. */
// var tableWidth;

// export default function getTable(table) {
//     tableWidth = table.offsetWidth;
//     resizableGrid(table);
// }

// function resizableGrid(table) {
//     var row = table.getElementsByTagName('tr')[0],
//         cols = row ? row.children : undefined;
//     if (!cols) return;

//     if (cols[0].getAttribute('aria-label') == '') {
//         cols[0].style.width = '1%';
//     }

//     for (var i = 0; i < cols.length; i++) {
//         // var div = this.createDiv(table.offsetHeight);
//         var div = createDiv(32);
//         cols[i].appendChild(div);
//         cols[i].style.position = 'relative';
//         setListeners(div);
//     }
// }

// function createDiv(height) {
//     height;
//     var div = document.createDocumentFragment('');
//     return div;
// }

// /* eslint-disable no-unused-vars */
// // This function set header separator div properties,
// // The height var must be uncomment and pass in parameters
// function setDivProps(div) {
//     div.style.top = 0;
//     div.style.right = 0;
//     div.style.width = '1px';
//     div.style.position = 'absolute';
//     div.style.cursor = 'col-resize';
//     /* remove backGroundColor later */
//     div.style.backgroundColor = '#0f6e84';
//     div.style.userSelect = 'none';
//     /* table height */
//     // div.style.height = height+'px';
//     return div;
// }
// /* eslint-disable no-unused-vars */

// var headerFromStorage = JSON.parse(localStorage.getItem('headers'));

// var headerToResize = null;
// var nextHeaderToResize = null;

// function setListeners(div) {
//     var pageX, curCol, nxtCol, curColWidth, nxtColWidth;

//     div.addEventListener('click', function (e) {
//         e.stopPropagation();
//     });

//     div.addEventListener('mouseover', function (e) {
//         e.stopPropagation();
//     });

//     div.addEventListener('mousedown', function (e) {
//         e.stopPropagation();

//         // element which is the created div parent => the current column
//         curCol = e.target.parentElement;

//         // get the current column name
//         var columnName = curCol.getAttribute('aria-label').split(':')[0];

//         // identify the column in the header array
//         headerToResize = headerFromStorage.filter((curr) => {
//             return curr.value == columnName;
//         });

//         // next column
//         nxtCol = curCol.nextElementSibling;
//         // get the current column name
//         var nextColumnName = nxtCol.getAttribute('aria-label').split(':')[0];
//         // identify the column in the header array
//         nextHeaderToResize = headerFromStorage.filter((nextCurr) => {
//             return nextCurr.value == nextColumnName;
//         });

//         // page abciss from the point the mouse down
//         pageX = Math.floor((e.pageX / tableWidth) * 100);

//         curColWidth = Math.floor((curCol.offsetWidth / tableWidth) * 100);

//         if (nxtCol) nxtColWidth = Math.floor((nxtCol.offsetWidth / tableWidth) * 100);
//     });

//     document.addEventListener('mousemove', function (e) {
//         e.stopPropagation();

//         if (curCol) {
//             var diffX = Math.floor((e.pageX / tableWidth) * 100) - pageX;

//             if (nxtCol) nxtCol.style.width = nxtColWidth - diffX + '%';

//             curCol.style.width = curColWidth + diffX + '%';

//             headerToResize[0].width = curColWidth + diffX + '%';
//             nextHeaderToResize[0].width = nxtColWidth - diffX + '%';

//             localStorage.setItem('headers', JSON.stringify(headerFromStorage));
//         }
//     });

//     document.addEventListener('mouseup', function (e) {
//         e.stopPropagation();

//         curCol = undefined;
//         nxtCol = undefined;
//         pageX = undefined;
//         nxtColWidth = undefined;
//         curColWidth = undefined;
//     });
// }
