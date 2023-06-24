const yt = require('youtube-search-without-api-key');

/**
 * Given a search query, searching on youtube
 * @param {string} search value.
 */
async function search(search) {
    const results = await yt.search(search);
    return results;
}

search('Hallo Welt').then((results) => {
    console.log(results);
});
