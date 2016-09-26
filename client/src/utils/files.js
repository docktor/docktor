export const download = (blob, filename) => {
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
            window.navigator.msSaveBlob(blob, filename);
        } else {
        var url = window.URL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        document.body.appendChild(tempLink); //Firefox requires the link to be in the body
        tempLink.href = url;
        tempLink.setAttribute('download', filename);
        tempLink.click();
        document.body.removeChild(tempLink); // remove the link when done
    }
};
